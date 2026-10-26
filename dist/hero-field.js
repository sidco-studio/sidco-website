/* SIDCO: quiet angular light behind the words. All page input stays native. */
(() => {
  const canvas=document.querySelector('.hero-field');
  const hero=canvas?.closest('.hero');
  if(!canvas||!hero)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;
  canvas.setAttribute('aria-hidden','true');
  canvas.style.pointerEvents='none';
  const content=hero.querySelector('.hero-content');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ignored='a,button,input,textarea,select,summary,[role="button"],[contenteditable],.hero-art';
  const base=document.createElement('canvas'),mask=document.createElement('canvas');
  const baseCtx=base.getContext('2d'),maskCtx=mask.getContext('2d');
  const route=[[0,-1],[0.42,-0.42],[1,0],[0.42,0.42],[0,1],[-0.42,0.42],[-1,0],[-0.42,-0.42],[0,-1]];
  const tipColors=['#e3ffab','#c7ff47','#a7dca0'];
  let width=1,height=1,dpr=1,traces=[],pulses=[],visible=true,raf=0,last=0,time=0;
  let gesture=null,suppressClickUntil=0;
  const pointer={active:false,x:0,y:0};
  const eligible=target=>target instanceof Element&&!target.closest(ignored);
  const clamp=value=>Math.max(0,Math.min(1,value));
  function requestDraw(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
  function path(context,points){
    context.beginPath();context.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)context.lineTo(points[i][0],points[i][1]);
  }
  function distanceToTrace(trace,x,y){
    let closest=Infinity;
    for(const edge of trace.edges){
      const dx=edge.b[0]-edge.a[0],dy=edge.b[1]-edge.a[1];
      const t=clamp(((x-edge.a[0])*dx+(y-edge.a[1])*dy)/(edge.length*edge.length));
      closest=Math.min(closest,Math.hypot(x-edge.a[0]-dx*t,y-edge.a[1]-dy*t));
    }
    return closest;
  }
  function slice(trace,phase,fraction){
    const start=(phase%1)*trace.length,end=start+trace.length*fraction;
    ctx.beginPath();
    for(let lap=0;lap<2;lap++)for(const edge of trace.edges){
      const offset=edge.start+lap*trace.length;
      const from=Math.max(start,offset),to=Math.min(end,offset+edge.length);
      if(to<=from)continue;
      const a=(from-offset)/edge.length,b=(to-offset)/edge.length;
      ctx.moveTo(edge.a[0]+(edge.b[0]-edge.a[0])*a,edge.a[1]+(edge.b[1]-edge.a[1])*a);
      ctx.lineTo(edge.a[0]+(edge.b[0]-edge.a[0])*b,edge.a[1]+(edge.b[1]-edge.a[1])*b);
    }
    ctx.stroke();
  }
  function aura(context,x,y,rx,ry,color){
    context.save();context.translate(x,y);context.scale(rx,ry);
    const glow=context.createRadialGradient(0,0,0,0,0,1);
    glow.addColorStop(0,color);glow.addColorStop(0.45,color);glow.addColorStop(1,'rgba(130,190,50,0)');
    context.fillStyle=glow;context.fillRect(-1,-1,2,2);context.restore();
  }
  function resize(){
    const box=canvas.getBoundingClientRect();
    width=Math.max(1,box.width);height=Math.max(1,box.height);dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    for(const layer of [base,mask]){layer.width=canvas.width;layer.height=canvas.height;}
    const copy=content?.getBoundingClientRect()||box;
    const heading=content?.querySelector('h1')?.getBoundingClientRect()||copy;
    const description=content?.querySelector('.hero-description')?.getBoundingClientRect()||copy;
    const textTop=heading.top-box.top,textBottom=Math.max(heading.bottom,description.bottom)-box.top;
    const cx=copy.left-box.left+copy.width*0.5;
    const cy=textTop+(textBottom-textTop)*0.54;
    const span=Math.max(230,Math.min(width,Math.max(copy.width*1.1,(textBottom-textTop)*1.6)));
    traces=[];
    // Five complete routes link the four chevron turns, with no disconnected rays.
    for(let n=0;n<5;n++){
      const radius=span*(0.22+n*0.145);
      const points=route.map(([x,y])=>[cx+x*radius,cy+y*radius]);
      let length=0;
      const edges=points.slice(0,-1).map((a,i)=>{
        const b=points[i+1],edge={a,b,start:length,length:Math.hypot(b[0]-a[0],b[1]-a[1])};
        length+=edge.length;return edge;
      });
      traces.push({points,edges,length,phase:n*0.19,
        alpha:0.12+n*0.01,width:0.8+n*0.03,tip:n%2===0,color:tipColors[n%3]});
    }
    baseCtx.setTransform(dpr,0,0,dpr,0,0);baseCtx.clearRect(0,0,width,height);
    aura(baseCtx,cx-span*0.16,cy+span*0.05,span*0.72,span*0.62,'rgba(174,231,72,0.065)');
    aura(baseCtx,cx+span*0.22,cy+span*0.35,span*0.52,span*0.62,'rgba(117,176,67,0.04)');
    baseCtx.strokeStyle='#b8df7a';baseCtx.lineJoin='miter';
    for(const trace of traces){baseCtx.globalAlpha=trace.alpha;baseCtx.lineWidth=trace.width;path(baseCtx,trace.points);baseCtx.stroke();}
    baseCtx.globalAlpha=1;
    // Reduce light directly under the reading area while keeping the outer traces visible.
    maskCtx.setTransform(dpr,0,0,dpr,0,0);maskCtx.clearRect(0,0,width,height);
    maskCtx.save();maskCtx.translate(cx,cy);maskCtx.scale(Math.max(120,copy.width*0.67),Math.max(100,(textBottom-textTop)*0.8));
    const protection=maskCtx.createRadialGradient(0,0,0,0,0,1);
    protection.addColorStop(0,'rgba(0,0,0,0.53)');protection.addColorStop(0.55,'rgba(0,0,0,0.34)');protection.addColorStop(1,'rgba(0,0,0,0)');
    maskCtx.fillStyle=protection;maskCtx.fillRect(-1,-1,2,2);maskCtx.restore();
    last=0;requestDraw();
  }
  function pulse(x,y){
    pulses.push({x,y,start:performance.now(),quiet:reduced.matches,duration:reduced.matches?320:1550});
    if(pulses.length>3)pulses.shift();requestDraw();
  }
  function draw(now){
    raf=0;if(!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,0.05):0;last=now;
    if(!reduced.matches)time+=dt;
    pulses=pulses.filter(p=>now-p.start<p.duration);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.globalAlpha=1;ctx.drawImage(base,0,0,width,height);ctx.lineJoin='miter';ctx.lineCap='butt';
    for(let i=0;i<traces.length;i++){
      const trace=traces[i];
      let light=pointer.active?Math.max(0,1-distanceToTrace(trace,pointer.x,pointer.y)/110)*0.11:0;
      for(const p of pulses){
        const age=Math.max(0,now-p.start),fade=Math.max(0,1-age/p.duration);
        if(p.quiet)light+=fade*0.19;
        else{
          const reach=age/1300*Math.max(width,height)*0.75;
          const distance=distanceToTrace(trace,p.x,p.y);
          light+=Math.max(0,1-Math.abs(distance-reach)/55)*fade*0.27;
        }
      }
      if(light>0.004){ctx.globalAlpha=Math.min(0.4,light);ctx.strokeStyle='#d6ff8b';ctx.lineWidth=trace.width+0.15;path(ctx,trace.points);ctx.stroke();}
      if(!reduced.matches&&trace.tip){
        const phase=(time*(0.025+(i%3)*0.004)+trace.phase)%1;
        ctx.strokeStyle=trace.color;ctx.lineWidth=2.8;ctx.globalAlpha=0.035;slice(trace,phase,0.055);
        ctx.lineWidth=0.9;ctx.globalAlpha=0.29+Math.sin(time*0.3+i)*0.055;slice(trace,phase,0.055);
      }
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';ctx.drawImage(mask,0,0,width,height);
    ctx.globalCompositeOperation='source-over';
    if(!reduced.matches||pulses.length)raf=requestAnimationFrame(draw);
  }
  function local(event){const box=canvas.getBoundingClientRect();return{x:event.clientX-box.left,y:event.clientY-box.top};}
  hero.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'){
      if(gesture&&gesture.id===event.pointerId&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>10)gesture.moved=true;
      return;
    }
    pointer.active=eligible(event.target);
    if(pointer.active)Object.assign(pointer,local(event));requestDraw();
  },{passive:true});
  hero.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch')return;
    pointer.active=eligible(event.target);
    if(pointer.active)Object.assign(pointer,local(event));requestDraw();
  },{passive:true});
  hero.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch')return;
    suppressClickUntil=performance.now()+900;
    if(!event.isPrimary||!eligible(event.target)){gesture=null;return;}
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,start:performance.now(),moved:false};
  },{passive:true});
  hero.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch')return;
    const tap=gesture;gesture=null;suppressClickUntil=performance.now()+900;
    if(!tap||tap.id!==event.pointerId||tap.moved||!eligible(event.target)||performance.now()-tap.start>700||
      Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>10)return;
    const point=local(event);pulse(point.x,point.y);
  },{passive:true});
  hero.addEventListener('pointercancel',event=>{
    gesture=null;pointer.active=false;
    if(event.pointerType==='touch')suppressClickUntil=performance.now()+900;
    requestDraw();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{gesture=null;pointer.active=false;requestDraw();},{passive:true});
  hero.addEventListener('click',event=>{
    if(!eligible(event.target)||performance.now()<suppressClickUntil)return;
    const point=local(event);pulse(point.x,point.y);
  },{passive:true});
  new ResizeObserver(resize).observe(hero);
  if(content)new ResizeObserver(resize).observe(content);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){last=0;requestDraw();}
    else{gesture=null;pointer.active=false;if(raf)cancelAnimationFrame(raf);raf=0;}
  }).observe(hero);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){gesture=null;pointer.active=false;cancelAnimationFrame(raf);raf=0;}
    else{last=0;requestDraw();}
  });
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;last=0;pulses=[];requestDraw();});
  window.addEventListener('resize',resize,{passive:true});
  if(document.fonts)document.fonts.ready.then(resize);
  resize();
})();
