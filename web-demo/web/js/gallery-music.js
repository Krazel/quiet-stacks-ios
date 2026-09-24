/* One streamed recording, never a full PCM decode in the game heap. */
(() => {
  'use strict';
  const KEY='quiet-stacks.music.v1', $=id=>document.getElementById(id);
  const native=window.location?.protocol==='quietstacks:';
  let settings={muted:false,volume:.28,effects:.65};
  try{const s=JSON.parse(localStorage.getItem(KEY));if(s){settings.muted=s.muted===true;for(const k of ['volume','effects'])if(Number.isFinite(s[k]))settings[k]=Math.max(0,Math.min(1,s[k]));}}catch{}
  const audio=new Audio();audio.preload='auto';audio.loop=false;
  let context,gain,master,source,unlocked=false,background=false,pendingPlay=false,musicReady=false;
  const groups={pickup:['handleSmallLeather','handleSmallLeather2'],place:['bookPlace1','bookPlace2','bookPlace3'],floor:['bookCloseSoftL'],inspect:['bookFlip3','bookFlip2'],correct:['confirmation_001']};
  const buffers=new Map(),requests=new Map(),decoding=new Set(),last={},voices=[],queued=[];
  const status=$('music-status'),panel=$('music-panel');
  const visible=()=>!document.hidden&&!background;
  const allowed=()=>unlocked&&visible()&&!settings.muted&&settings.volume>0;
  // Fetch the small effects while the gallery opens, before the first book gesture.
  function fetchEffect(name){if(!requests.has(name))requests.set(name,fetch('assets/sfx-'+name+'.wav').then(r=>{if(!r.ok)throw Error('Effect unavailable');return r.arrayBuffer();}).catch(()=>{requests.delete(name);return null;}));return requests.get(name);}
  for(const name of Object.values(groups).flat())fetchEffect(name);
  function loadEffects(){if(!context)return;for(const name of Object.values(groups).flat()){if(buffers.has(name)||decoding.has(name))continue;decoding.add(name);fetchEffect(name).then(data=>data&&context.decodeAudioData(data.slice(0))).then(buffer=>{if(buffer)buffers.set(name,buffer);flushEffects();}).catch(()=>requests.delete(name)).finally(()=>decoding.delete(name));}}
  function sound(kind){
    if(!unlocked||!visible()||!settings.effects||context?.state!=='running'||!groups[kind])return false;
    const available=groups[kind].filter(n=>buffers.has(n)),choices=available.length>1?available.filter(n=>n!==last[kind]):available;if(!choices.length)return false;
    const name=choices[Math.floor(Math.random()*choices.length)];last[kind]=name;
    while(voices.length>=2)voices.shift().stop();
    const voice=context.createBufferSource(),volume=context.createGain();voice.buffer=buffers.get(name);voice.playbackRate.value=kind==='floor'?2**((Math.random()*3-1.5)/12):kind==='pickup'||kind==='correct'?2**((Math.random()*2-1)/12):1;volume.gain.value=settings.effects;
    voice.connect(volume);volume.connect(master);voices.push(voice);voice.onended=()=>{const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1);voice.disconnect();volume.disconnect();};voice.start();return true;
  }
  function flushEffects(){for(let i=0;i<queued.length;){const q=queued[i];if(!visible()||!settings.effects||performance.now()-q.at>250){queued.splice(i,1);continue;}if(sound(q.kind))queued.splice(i,1);else i++;}}
  function effect(kind){if(!groups[kind]||!visible()||!settings.effects)return;if(context?.state!=='running')interact();if(!sound(kind)){queued.push({kind,at:performance.now()});if(queued.length>2)queued.shift();}}
  function display(){$('music-mute').textContent=settings.muted?'Unmute':'Mute';$('music-mute').setAttribute('aria-pressed',String(settings.muted));$('music-volume').value=String(Math.round(settings.volume*100));$('effects-volume').value=String(Math.round(settings.effects*100));}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}display();}
  function level(fade){if(!gain)return;const now=context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(fade?0:gain.gain.value,now);gain.gain.linearRampToValueAtTime(settings.volume,now+(fade?2:.12));}
  function pause(){audio.pause();}
  function stopEffects(){queued.length=0;while(voices.length)voices.shift().stop();}
  function suspend(){pause();stopEffects();if(context&&context.state!=='closed')context.suspend().catch(()=>{});}
  function play(){
    if(!allowed()||!musicReady||pendingPlay||!audio.paused||!context)return;
    // Never await loading/resume here: browsers require play() inside the gesture.
    level(true);pendingPlay=true;
    try{Promise.resolve(audio.play()).then(()=>{if(!allowed())pause();else status.textContent='Playing quietly in the library.';}).catch(()=>{status.textContent='Tap the library to enable sound.';}).finally(()=>{pendingPlay=false;});}catch{pendingPlay=false;status.textContent='Tap the library to enable sound.';}
  }
  function interact(){
    unlocked=true;if(!visible())return;
    if(!context){try{const AC=window.AudioContext||window.webkitAudioContext;context=new AC();master=context.createGain();master.gain.value=.65;master.connect(context.destination);gain=context.createGain();gain.gain.value=0;source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(master);context.addEventListener('statechange',()=>{if(context.state==='running'){if(!visible())suspend();else{play();flushEffects();}}});}catch{status.textContent='Audio is unavailable in this browser.';return;}}
    loadEffects();
    // Resume effects independently of the music mute/volume, including WebKit's interrupted state.
    if(context.state!=='running'&&context.state!=='closed')context.resume().then(()=>{if(!visible())suspend();else{play();flushEffects();}}).catch(()=>{status.textContent='Tap the library to enable sound.';});
    play();flushEffects();
  }
  function foreground(){background=false;if(unlocked)interact();}
  function ready(){if(native)interact();}
  // Read-only diagnostics; never changes preferences or the device's output volume.
  window.GalleryAudio={effect,ready,snapshot:()=>({native,unlocked,background,context:context?.state||'uninitialized',contextTime:context?.currentTime||0,musicReady,paused:audio.paused,musicTime:audio.currentTime,pendingPlay,buffers:buffers.size,voices:voices.length,queued:queued.length,settings:{...settings},musicGain:gain?.gain.value??0})};
  // Native custom-scheme media uses a Blob to avoid WebKit range-request failures.
  // Browsers get their URL immediately: the first gesture starts loading and playback together.
  if(native){fetch('assets/meditation-impromptu-01.mp3').then(r=>{if(!r.ok)throw Error('Music unavailable');return r.blob();}).then(blob=>{audio.src=URL.createObjectURL(new Blob([blob],{type:'audio/mpeg'}));musicReady=true;play();}).catch(()=>{status.textContent='Music could not load. Close and reopen the app to retry.';});}
  else{audio.src='assets/meditation-impromptu-01.mp3';musicReady=true;}
  document.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')interact();},{capture:true,passive:true});
  for(const name of ['pointerup','touchend','click','keydown'])document.addEventListener(name,interact,{capture:true,passive:true});
  $('music-open').onclick=()=>{panel.showModal();interact();};$('music-close').onclick=()=>panel.close();
  const about=$('about-panel');$('about-open').onclick=()=>about.showModal();$('about-close').onclick=()=>about.close();
  about.addEventListener('keydown',event=>event.stopPropagation());panel.addEventListener('keydown',event=>event.stopPropagation());
  $('music-mute').onclick=()=>{settings.muted=!settings.muted;save();if(settings.muted){pause();status.textContent='Music muted.';}else interact();};
  $('effects-volume').oninput=event=>{settings.effects=Number(event.target.value)/100;save();if(!settings.effects)stopEffects();interact();};
  $('music-volume').oninput=event=>{settings.volume=Number(event.target.value)/100;save();if(!settings.volume)pause();else{level(false);interact();}};
  audio.addEventListener('ended',()=>{audio.currentTime=0;play();});
  audio.addEventListener('error',()=>{status.textContent='Music could not load. Close and reopen the app to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else if(unlocked)interact();});
  window.addEventListener('pagehide',()=>{background=true;suspend();});window.addEventListener('pageshow',foreground);
  window.addEventListener('gallery-background',()=>{background=true;suspend();});window.addEventListener('gallery-foreground',foreground);
  display();
})();
