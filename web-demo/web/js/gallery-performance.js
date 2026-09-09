(function(root){
  'use strict';
  const round=n=>Math.round(n*100)/100;
  function distribution(values){
    if(!values.length)return {count:0,median:null,p95:null,max:null};
    const a=values.slice().sort((x,y)=>x-y);
    return {count:a.length,median:round(a[Math.floor(a.length*.5)]),p95:round(a[Math.min(a.length-1,Math.floor(a.length*.95))]),max:round(a[a.length-1])};
  }
  function summarize(s,ended){
    const duration=ended-s.started,frames=s.frames;
    return {name:s.name,durationMs:round(duration),renderedFrames:frames.length,renderFPS:duration?round(frames.length*1000/duration):null,
      drawMainThreadMs:distribution(frames.map(f=>f.total)),roomDrawMs:distribution(frames.map(f=>f.room)),bookDrawMs:distribution(frames.map(f=>f.books)),
      visibleBooks:distribution(frames.map(f=>f.count)),renderIntervalMs:distribution(frames.slice(1).map((f,i)=>f.at-frames[i].at)),
      schedulerIntervalMs:distribution(s.ticks.slice(1).map((t,i)=>t-s.ticks[i])),inputToRenderMs:distribution(s.inputs),dropMs:distribution(s.drops),
      framesOver33ms:frames.filter(f=>f.total>33.34).length,framesOver50ms:frames.filter(f=>f.total>50).length,events:s.events};
  }
  let controller;
  function attach(adapter){
    const $=id=>root.document.getElementById(id),now=()=>root.performance.now();
    let active=false,mode=null,epoch=0,snapshot=null,current=null,result=null,started=0,inputAt=null,contextId=0;
    const waiters=new Set(),contexts=new Map(),completed=[],dropCases=[];
    function bridge(message){const h=root.webkit?.messageHandlers?.galleryStatus;if(!h)return false;h.postMessage(message);return true;}
    function nativeContext(){return new Promise(resolve=>{const id=++contextId;if(!root.webkit?.messageHandlers?.galleryStatus){resolve(null);return;}const timer=root.setTimeout(()=>{contexts.delete(id);resolve(null);},2000);contexts.set(id,data=>{root.clearTimeout(timer);resolve(data);});bridge({type:'performance-context',requestId:id});});}
    function nextFrame(){return new Promise(resolve=>{const done=t=>{waiters.delete(done);resolve(t);};waiters.add(done);root.requestAnimationFrame(done);});}
    function stage(name){current={name,started:now(),frames:[],ticks:[],inputs:[],drops:[],events:{}};inputAt=null;}
    function endStage(){if(current){completed.push(summarize(current,now()));current=null;}}
    function display(){
      $('performance-running').hidden=true;$('performance-panel').hidden=false;$('performance-copy').disabled=!result;$('performance-share').disabled=!result;
      $('performance-report').value=result?JSON.stringify(result,null,2):'';
      $('performance-status').textContent=result?(result.status==='complete'?'Test complete. Share the JSON file (for example, with WhatsApp), or copy the report.':result.mode==='manual'?'Recording stopped. Your moves are kept; you can record again.':'Test interrupted. Your library has been restored; you can run it again.'):'Choose an automatic test or record yourself playing.';
      $('performance-start').disabled=false;$('performance-manual').disabled=false;
    }
    function restore(){if(snapshot){const saved=snapshot;snapshot=null;adapter.restore(saved);}}
    function finish(status,nativeEnd){
      if(!active)return;endStage();active=false;epoch++;restore();
      result={...result,status,durationMs:round(now()-started),nativeEnd:nativeEnd||null,stages:completed.slice(),dropCases:dropCases.slice()};
      try{root.localStorage.setItem('quiet-stacks.performance.last',JSON.stringify(result));}catch{}
      display();for(const resolve of [...waiters])resolve(now());
    }
    function cancel(reason='cancelled'){finish(reason,null);}
    async function runStage(name,seconds,id,animate){
      adapter.setup?.(name);await nextFrame();await nextFrame();if(!active||epoch!==id)return;
      stage(name);const start=now();let label='';
      while(active&&epoch===id&&now()-start<seconds*1000){
        const t=await nextFrame();if(!active||epoch!==id)return;current.ticks.push(t);
        if(animate)adapter.animate(name,(now()-start)/(seconds*1000));
        const text=(name==='manual-play'?'Move, zoom and drag books':name.replaceAll('-',' '))+' · '+Math.max(0,Math.ceil(seconds-(now()-start)/1000))+'s';
        if(text!==label){$('performance-phase').textContent=text;label=text;}
      }
      endStage();
    }
    async function start(requestedMode){
      if(active||!adapter.ready())return;
      mode=requestedMode;active=true;const id=++epoch;started=now();completed.length=0;dropCases.length=0;inputAt=null;
      result={type:'quiet-stacks-performance',schema:1,version:'0.17.2',build:'1',mode,createdAt:new Date().toISOString(),environment:adapter.environment(),
        timingNotes:'Render timings and render FPS measure main-thread draw submissions, not GPU presentation. Graphics identifies WebGL or the Canvas fallback; textureMiB estimates uploaded RGBA textures, not total process memory. Render FPS during idle is expected to be zero. Input latency starts when the JS listener receives an event. WebContent process memory is unavailable through the public bridge. No saved layout or book identities are included.'};
      $('performance-panel').hidden=true;$('performance-running').hidden=false;$('performance-phase').textContent='Preparing test…';$('performance-copy').disabled=true;$('performance-share').disabled=true;
      try{
        if(mode==='automatic')snapshot=adapter.begin();
        const nativeStart=await nativeContext();if(!active||epoch!==id)return;result.nativeStart=nativeStart;
        if(mode==='manual')await runStage('manual-play',20,id,false);
        else{
          for(const [name,seconds] of [['idle',3],['pan-wide',5],['zoom',5],['drag',5],['shelves',5]]){await runStage(name,seconds,id,name!=='idle');if(!active||epoch!==id)return;}
          $('performance-phase').textContent='Nearby placement';stage('nearby-placement');
          for(let repeat=0;repeat<3;repeat++)for(const name of adapter.dropNames){await nextFrame();if(!active||epoch!==id)return;const entry=adapter.dropCase(name);dropCases.push(entry);current.drops.push(entry.ms);}
          endStage();
        }
        const nativeEnd=await nativeContext();if(active&&epoch===id)finish('complete',nativeEnd);
      }catch(error){if(active&&epoch===id){result.failure=String(error.message||error).slice(0,200);finish('failed',null);}}
    }
    $('performance-open').onclick=()=>{if(active)return;$('demo-actions').hidden=true;$('inspection').hidden=true;display();};
    $('performance-close').onclick=()=>{$('performance-panel').hidden=true;};
    $('performance-start').onclick=()=>start('automatic');$('performance-manual').onclick=()=>start('manual');$('performance-cancel').onclick=()=>cancel();
    $('performance-copy').onclick=async()=>{
      if(!result)return;const report=JSON.stringify(result,null,2);
      if(bridge({type:'performance-copy',report}))return;
      try{await root.navigator.clipboard.writeText(report);$('performance-status').textContent='Report copied. Paste it into Codex.';}
      catch{$('performance-report').focus();$('performance-report').select();$('performance-status').textContent='Select and copy the report below.';}
    };
    $('performance-share').onclick=async()=>{
      if(!result)return;const report=JSON.stringify(result,null,2),name='Quiet-Stacks-performance-'+result.version+'.json';
      if(bridge({type:'performance-share',report}))return;
      const file=new File([report],name,{type:'application/json'});
      try{
        if(root.navigator.share&&root.navigator.canShare?.({files:[file]}))await root.navigator.share({files:[file],title:'Quiet Stacks performance report'});
        else{const url=URL.createObjectURL(file),link=root.document.createElement('a');link.href=url;link.download=name;link.click();root.setTimeout(()=>URL.revokeObjectURL(url),30000);$('performance-status').textContent='Report downloaded. You can attach the JSON file in WhatsApp.';}
      }catch(error){if(error.name!=='AbortError')$('performance-status').textContent='Could not share. You can still copy the report.';}
    };
    root.addEventListener('pagehide',()=>cancel('backgrounded'));
    root.addEventListener('resize',()=>cancel('resized'));
    root.document.addEventListener?.('visibilitychange',()=>{if(root.document.hidden)cancel('backgrounded');});
    try{const saved=JSON.parse(root.localStorage.getItem('quiet-stacks.performance.last'));if(saved?.type==='quiet-stacks-performance')result=saved;}catch{}
    controller={get active(){return active;},get automatic(){return active&&mode==='automatic';},cancel,start,
      frame(data){if(!active||!current||current.frames.length>=6000)return;current.frames.push({...data,at:now()});if(inputAt!==null){current.inputs.push(now()-inputAt);inputAt=null;}},
      input(kind){if(!active||!current)return;current.events[kind]=(current.events[kind]||0)+1;if(inputAt===null)inputAt=now();},
      drop(ms){if(active&&current)current.drops.push(ms);},
      nativeContext(data){const resolve=contexts.get(data.requestId);if(resolve){contexts.delete(data.requestId);resolve(data);}},
      copyResult(ok){$('performance-status').textContent=ok?'Report copied. Paste it into Codex.':'Copy failed. Select the report below.';}
    };return controller;
  }
  const api={attach,distribution,summarize,nativeContext:data=>controller?.nativeContext(data),copyResult:ok=>controller?.copyResult(ok)};
  root.GalleryPerformance=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
