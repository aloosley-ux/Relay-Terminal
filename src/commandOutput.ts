import type { IBuffer, IMarker, Terminal } from '@xterm/xterm';

export interface CommandBlock {
  id: number;
  command: string;
  start: IMarker;
  prompt?: IMarker;
  end?: IMarker;
  startColumn: number;
  endColumn?: number;
  output?: string;
  truncated: boolean;
  fullScreen: boolean;
}

// Read rendered cells, preserving spaces at soft wraps and excluding ANSI codes.
// End is exclusive; a prompt sharing the last output row is never included.
export function readBuffer(buffer: IBuffer, start: number, end: number, startColumn = 0, endColumn = 0): string {
  const lines: string[] = [];
  for (let row = start; row <= end && row < buffer.length; row++) {
    if (row === end && endColumn === 0) break;
    const line = buffer.getLine(row);
    if (!line) continue;
    const nextWrapped = row < end && buffer.getLine(row + 1)?.isWrapped;
    const value = line.translateToString(!nextWrapped, row === start ? startColumn : 0, row === end ? endColumn : undefined);
    if (line.isWrapped && lines.length) lines[lines.length - 1] += value;
    else lines.push(value);
  }
  return lines.join('\r\n');
}

export class CommandOutput {
  readonly blocks: CommandBlock[] = [];
  private running?: CommandBlock;
  private serial = 0;
  private token = '';
  private prompt?: IMarker;
  private subscriptions: { dispose(): void }[];
  constructor(private terminal: Terminal) {
    this.subscriptions = [
      terminal.parser.registerOscHandler(633, data => this.handle(data)),
      terminal.buffer.onBufferChange(buffer => { if (buffer.type === 'alternate' && this.running) this.running.fullScreen = true; }),
    ];
  }
  authenticate(token: string) { this.token = token; }
  private handle(data: string): boolean {
    const [token, kind, encoded = ''] = data.split(';');
    if (!this.token || token !== this.token) return false;
    if (this.terminal.buffer.active.type !== 'normal') return true;
    if (kind === 'C') {
      // A missing end marker means integration was interrupted. Never turn the
      // next command's echo/prompt into a supposedly complete previous result.
      this.running = undefined;
      let command: string;
      try { command = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))); } catch { return true; }
      if (!command.trim() || command.length > 32768) return true;
      const start = this.terminal.registerMarker(0);
      this.running = { id: ++this.serial, command, start, prompt: this.prompt, startColumn: this.terminal.buffer.active.cursorX, truncated: false, fullScreen: false };
      this.prompt = undefined;
      this.blocks.push(this.running);
      this.prune();
    } else if (kind === 'D') this.finish();
    else if (kind === 'P') { this.prompt?.dispose(); this.prompt = this.terminal.registerMarker(0); }
    return true;
  }
  private finish() {
    const block = this.running;
    if (!block) return;
    const buffer = this.terminal.buffer.normal;
    block.end = this.terminal.registerMarker(0);
    block.endColumn = buffer.cursorX;
    block.truncated = block.start.isDisposed;
    block.output = readBuffer(buffer, block.truncated ? 0 : block.start.line, buffer.baseY + buffer.cursorY, block.truncated ? 0 : block.startColumn, buffer.cursorX);
    // Bounded, in-memory history only. Never persist commands or their results.
    if (block.output.length > 1024 * 1024) { block.output = block.output.slice(-1024 * 1024); block.truncated = true; }
    this.running = undefined;
    this.prune();
  }
  private prune() {
    let size = this.blocks.reduce((n, b) => n + (b.output?.length || 0) + b.command.length, 0);
    while (this.blocks.length > 100 || (size > 2 * 1024 * 1024 && this.blocks.length > 1)) {
      const old = this.blocks.shift()!;
      size -= (old.output?.length || 0) + old.command.length;
      old.start.dispose(); old.end?.dispose(); old.prompt?.dispose();
    }
  }
  latest() { return this.blocks.filter(b => b.output !== undefined).at(-1); }
  atLine(line: number) { return this.blocks.slice().reverse().find(b => line >= (b.prompt && !b.prompt.isDisposed ? b.prompt.line : b.start.isDisposed ? 0 : b.start.line) && (b.end && !b.end.isDisposed ? line < b.end.line || line === b.end.line && !!b.endColumn : b === this.running)); }
  previous() {
    const row = this.terminal.buffer.active.viewportY;
    const block = this.blocks.filter(b => !b.start.isDisposed && b.start.line < row).at(-1);
    if (block) this.terminal.scrollToLine(block.start.line);
  }
  clear() { for (const b of this.blocks) { b.start.dispose(); b.end?.dispose(); b.prompt?.dispose(); } this.blocks.length = 0; this.running = undefined; this.prompt?.dispose(); this.prompt = undefined; }
  dispose() { this.clear(); this.subscriptions.forEach(s => s.dispose()); }
}
