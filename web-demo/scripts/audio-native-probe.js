// Injected only by --gallery-audio-smoke on the simulator, never in a device build.
(()=>{
 const label='__AUDIO_CASE__',settings=__AUDIO_SETTINGS__,restore=__AUDIO_RESTORE__;
 if(!restore)localStorage.setItem('quiet-stacks.music.v1',JSON.stringify(settings));
 const counters={contexts:0,plays:0,voices:0},AC=window.AudioContext||window.webkitAudioContext;let analyser,backgroundSeen=false,backgroundSnapshot;
 window.AudioContext=function(...args){const c=new AC(...args);counters.contexts++;const createGain=c.createGain.bind(c),createBuffer=c.createBufferSource.bind(c);let first=true;c.createGain=()=>{const g=createGain();if(first){first=false;analyser=c.createAnalyser();const silent=createGain();silent.gain.value=0;g.connect(analyser);analyser.connect(silent);silent.connect(c.destination);}return g;};c.createBufferSource=()=>{const b=createBuffer(),start=b.start.bind(b);b.start=(...a)=>{counters.voices++;return start(...a);};return b;};return c;};
 const Audio=window.Audio;window.Audio=function(...args){const a=new Audio(...args),play=a.play.bind(a);a.play=()=>{counters.plays++;return play();};return a;};
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),snap=()=>GalleryAudio.snapshot(),peak=()=>{if(!analyser)return 0;const v=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(v);return Math.max(...v.map(Math.abs));};
 const send=(phase,extra={})=>webkit.messageHandlers.galleryStatus.postMessage({type:'audio-probe',label,phase,...extra,snapshot:snap(),counters:{...counters}});
 window.addEventListener('gallery-background',()=>{backgroundSeen=true;queueMicrotask(()=>{backgroundSnapshot=snap();});});
 window.addEventListener('gallery-foreground',async()=>{if(!backgroundSeen)return;await sleep(800);const first=snap();await sleep(400);send('resumed',{backgroundSeen,backgroundSnapshot,first});});
 (async()=>{try{for(let i=0;i<300;i++){if(window.GalleryAudio?.snapshot().buffers===9&&window.__galleryRenderedFrames>0)break;await sleep(100);}await sleep(3300);let musicPeak=0;for(let i=0;i<20;i++){musicPeak=Math.max(musicPeak,peak());await sleep(20);}const initial=snap();let effectsPeak=0;GalleryAudio.effect('floor');for(let i=0;i<25;i++){effectsPeak=Math.max(effectsPeak,peak());await sleep(10);}for(let i=0;i<4;i++)document.dispatchEvent(new Event('pointerup'));await sleep(50);send('cold',{settings,initial,musicPeak,effectsPeak,restore});}catch(e){send('error',{error:String(e)});}})();
})();
