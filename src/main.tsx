import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@xterm/xterm/css/xterm.css';
import './style.css';
import './workbench.css';
import './desktop.css';
import './studio.css';
createRoot(document.getElementById('root')!).render(<App />);
