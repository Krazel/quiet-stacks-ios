/* One streamed recording, never a full PCM decode in the game heap. */
(() => {
  'use strict';
  const KEY='quiet-stacks.music.v1', $=id=>document.getElementById(id);
  let settings={muted:false,volume:.28,effects:.65};
  try { const s=JSON.parse(localStorage.getItem(KEY)); if(s){settings.muted=s.muted===true;if(Number.isFinite(s.volume))settings.volume=Math.max(0,Math.min(1,s.volume));} } catch {}
  const audio=new Audio(); audio.preload='metadata'; audio.loop=false;
  try{const s=JSON.parse(localStorage.getItem(KEY));if(Number.isFinite(s?.effects))settings.effects=Math.max(0,Math.min(1,s.effects));}catch{}
  let context, gain, master, source, unlocked=false, background=false, loading, objectURL, pending=false;
  const groups={pickup:['handleSmallLeather','handleSmallLeather2'],place:['bookPlace1','bookPlace2','bookPlace3'],floor:['bookCloseSoftL'],inspect:['bookFlip3','bookFlip2'],correct:['confirmation_001']},buffers=new Map(),last={},voices=[];
  let effectsLoading=false;
  function loadEffects(){if(effectsLoading)return;effectsLoading=true;for(const name of Object.values(groups).flat())fetch('assets/sfx-'+name+'.wav').then(r=>{if(!r.ok)throw Error('Effect unavailable');return r.arrayBuffer();}).then(data=>context.decodeAudioData(data)).then(buffer=>buffers.set(name,buffer)).catch(()=>{effectsLoading=false;});}
  function effect(kind){
    if(!unlocked||document.hidden||background||!settings.effects||!context||context.state!=='running'||!groups[kind])return;
    const available=groups[kind].filter(n=>buffers.has(n)),choices=available.length>1?available.filter(n=>n!==last[kind]):available;if(!choices.length)return;
    const name=choices[Math.floor(Math.random()*choices.length)];last[kind]=name;
    while(voices.length>=2)voices.shift().stop();
    const voice=context.createBufferSource(),volume=context.createGain();voice.buffer=buffers.get(name);voice.playbackRate.value=kind==='floor'?2**((Math.random()*3-1.5)/12):kind==='pickup'||kind==='correct'?2**((Math.random()*2-1)/12):1;volume.gain.value=settings.effects;
    voice.connect(volume);volume.connect(master);voices.push(voice);voice.onended=()=>{const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1);voice.disconnect();volume.disconnect();};voice.start();
  }
  window.GalleryAudio={effect};
  const status=$('music-status'), panel=$('music-panel');
  const allowed=()=>unlocked&&!document.hidden&&!background&&!settings.muted&&settings.volume>0;
  function display(){
    $('music-mute').textContent=settings.muted?'Unmute':'Mute';
    $('music-mute').setAttribute('aria-pressed',String(settings.muted));
    $('music-volume').value=String(Math.round(settings.volume*100));
    $('effects-volume').value=String(Math.round(settings.effects*100));
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}display();}
  function level(fade){if(!gain)return;const now=context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(fade?0:gain.gain.value,now);gain.gain.linearRampToValueAtTime(settings.volume,now+(fade?2:.12));}
  function pause(){audio.pause();}
  function suspend(){pause();while(voices.length)voices.shift().stop();if(context?.state==='running')context.suspend().catch(()=>{});}
  function load(){
    if(!loading) loading=fetch('assets/meditation-impromptu-01.mp3').then(r=>{if(!r.ok)throw Error('Music unavailable');return r.blob();}).then(blob=>{
      // Blob playback also avoids WebKit custom-scheme media range requests.
      objectURL=URL.createObjectURL(new Blob([blob],{type:'audio/mpeg'}));audio.src=objectURL;
    }).catch(error=>{loading=null;throw error;});
    return loading;
  }
  async function play(){
    if(!allowed()||pending||!audio.paused)return;
    pending=true;
    try{
      if(context?.state==='suspended')await context.resume();
      await load();
      if(!allowed())return;
      level(true);await audio.play();
      if(!allowed())pause();else status.textContent='Playing quietly in the library.';
    }catch{status.textContent='Tap Music to try playback again.';}finally{pending=false;}
  }
  function interact(){
    unlocked=true;
    if(!context){
      try{const AC=window.AudioContext||window.webkitAudioContext;context=new AC();master=context.createGain();master.gain.value=.65;master.connect(context.destination);gain=context.createGain();gain.gain.value=0;source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(master);}catch{status.textContent='Audio is unavailable in this browser.';return;}
    }
    loadEffects();
    if(!document.hidden&&!background){context.resume().then(play).catch(()=>{status.textContent='Tap Sound to try playback again.';});}
  }
  document.addEventListener('pointerdown',interact,{passive:true});
  document.addEventListener('keydown',interact);
  $('music-open').onclick=()=>{panel.showModal();interact();};
  $('music-close').onclick=()=>panel.close();
  const about=$('about-panel');
  $('about-open').onclick=()=>about.showModal();
  $('about-close').onclick=()=>about.close();
  about.addEventListener('keydown',event=>event.stopPropagation());
  panel.addEventListener('keydown',event=>event.stopPropagation());
  $('music-mute').onclick=()=>{settings.muted=!settings.muted;save();if(settings.muted){pause();status.textContent='Music muted.';}else interact();};
  $('effects-volume').oninput=event=>{settings.effects=Number(event.target.value)/100;save();if(!settings.effects)while(voices.length)voices.shift().stop();interact();};
  $('music-volume').oninput=event=>{settings.volume=Number(event.target.value)/100;save();if(!settings.volume)pause();else{level(false);interact();}};
  audio.addEventListener('ended',()=>{audio.currentTime=0;play();});
  audio.addEventListener('error',()=>{status.textContent='Music could not load. Close and reopen the app to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else play();});
  window.addEventListener('pagehide',()=>{background=true;suspend();});
  window.addEventListener('pageshow',()=>{background=false;play();});
  window.addEventListener('gallery-background',()=>{background=true;suspend();});
  window.addEventListener('gallery-foreground',()=>{background=false;play();});
  display();
})();
