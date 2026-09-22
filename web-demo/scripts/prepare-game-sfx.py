"""Build the approved book effects and copy the approved confirmation audition."""
from pathlib import Path
import sys,json,hashlib
root=Path(__file__).resolve().parents[1]
source=root.parent/'.studio/audio-selection/quiet-stacks/sfx'
sys.path.insert(0,str(source/'tools'))
import soundfile as sf
import numpy as np
manifest=json.loads((source/'manifest.json').read_text(encoding='utf-8-sig'))
records=[]
for item in manifest['files']:
    if item['selection_status']!='aprobado': continue
    src=source/item['filename']; data,sr=sf.read(src,always_2d=True)
    peak=float(np.max(np.abs(data))); gain=min(1,10**(-12/20)/peak)
    dest=root/'web/assets'/('sfx-'+src.stem+'.wav')
    sf.write(dest,data*gain,sr,subtype='PCM_16')
    rendered,_=sf.read(dest); assert np.max(np.abs(rendered))<.252
    records.append({'file':dest.name,'original':item['filename'],'originalSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'gain':gain,'peak':float(np.max(np.abs(rendered))),'license':'CC0 1.0','author':'Kenney'})
import shutil
floor=root/'design/audio-floor-L/approved-L.wav'
dest=root/'web/assets/sfx-bookCloseSoftL.wav'
shutil.copyfile(floor,dest)
records.append({'file':dest.name,'original':'design/audio-floor-L/approved-L.wav','originalSha256':hashlib.sha256(floor.read_bytes()).hexdigest(),'license':'CC0 1.0','author':'Kenney','approvedOption':'L','event':'floor','pitchSemitones':[-1.5,1.5],'processing':'Approved softened bookClose: 1250Hz two-pole low-pass, 6ms attack, 160ms decay, 35ms fade, -24dBFS peak. No additional normalization.'})
confirmation=source/'correct/A-confirmation_001.wav'
shutil.copyfile(confirmation,root/'web/assets/sfx-confirmation_001.wav')
records.append({'file':'sfx-confirmation_001.wav','original':'correct/A-confirmation_001.wav','originalSha256':hashlib.sha256(confirmation.read_bytes()).hexdigest(),'license':'CC0 1.0','author':'Kenney','pitchSemitones':[-1,1]})
out=root/'artifacts/music';out.mkdir(parents=True,exist_ok=True)
(out/'sfx-manifest.json').write_text(json.dumps(records,indent=2))
print('Prepared',len(records),'approved effects; peaks <= -12 dBFS')
