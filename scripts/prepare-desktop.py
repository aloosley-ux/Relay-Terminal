from pathlib import Path
import json
import sys
root=Path(__file__).resolve().parent.parent
profile=root/'artifacts'/(sys.argv[1] if len(sys.argv)>1 else 'desktop-review-profile')
if profile.resolve().parent != (root/'artifacts').resolve():
    raise SystemExit('Choose a direct child of the project artifacts directory.')
profile.mkdir(parents=True,exist_ok=True)
if (profile/'settings.json').exists():
    raise SystemExit('Profile already exists; preserved.')
(profile/'settings.json').write_text(json.dumps({
    'theme':'dark','fontSize':14,'panelOpen':True,'shell':'auto','loadProfiles':False,
    'favorites':[],'recents':[str(root)],
    'workspaces':[{'id':'relay-project','name':'Relay-Terminal','path':str(root)}],
    'restoreTabs':True,'startupTabs':[{'id':'relay-project','name':'PowerShell','path':str(root)}],
    'actions':[
        {'id':'git-status','name':'Git status','icon':'git','description':'','command':'git status --short --branch','directory':'','favorite':True},
        {'id':'files','name':'List files','icon':'folder','description':'','command':'Get-ChildItem -Force','directory':'','favorite':True},
        {'id':'versions','name':'PowerShell version','icon':'terminal','description':'','command':'$PSVersionTable','directory':'','favorite':False}
    ]
},indent=2),encoding='utf-8')
