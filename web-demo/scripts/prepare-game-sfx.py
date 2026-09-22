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
floor=source/'impact/Audio/impactPlank_medium_000.ogg'
data,sr=sf.read(floor,always_2d=True)
gain=min(1,10**(-12/20)/float(np.max(np.abs(data))))
dest=root/'web/assets/sfx-impactPlank_medium_000.wav'
sf.write(dest,data*gain,sr,subtype='PCM_16')
records.append({'file':dest.name,'original':'impact/Audio/impactPlank_medium_000.ogg','originalSha256':hashlib.sha256(floor.read_bytes()).hexdigest(),'gain':gain,'license':'CC0 1.0','author':'Kenney','approvedOption':'G','event':'floor'})
confirmation=source/'correct/A-confirmation_001.wav'
shutil.copyfile(confirmation,root/'web/assets/sfx-confirmation_001.wav')
records.append({'file':'sfx-confirmation_001.wav','original':'correct/A-confirmation_001.wav','originalSha256':hashlib.sha256(confirmation.read_bytes()).hexdigest(),'license':'CC0 1.0','author':'Kenney','pitchSemitones':[-1,1]})
out=root/'artifacts/music';out.mkdir(parents=True,exist_ok=True)
(out/'sfx-manifest.json').write_text(json.dumps(records,indent=2))
print('Prepared',len(records),'approved effects; peaks <= -12 dBFS')
