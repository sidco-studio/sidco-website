/* SIDCO — a tactile, two-dimensional field of possibilities. */
(() => {
  const canvas = document.getElementById('energy-core');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    const fallback = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="a" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#e5ffac"/><stop offset=".35" stop-color="#c7ff47"/><stop offset=".7" stop-color="#b8f742"/><stop offset="1" stop-color="#88d74b"/></linearGradient></defs><path fill="url(#a)" d="M20 1 28 13 20 10 12 13ZM39 20 27 28 30 20 27 12ZM20 39 12 27 20 30 28 27ZM1 20 13 12 10 20 13 28Z"/></svg>';
    canvas.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(fallback)}")`;
    canvas.style.backgroundSize = '72% 72%';
    canvas.style.backgroundPosition = 'center';
    canvas.style.backgroundRepeat = 'no-repeat';
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smallViewport = matchMedia('(max-width: 600px)');
  let mobile = false, columns = 49;
  const facets = [
    [[20,1],[28,13],[20,10],[12,13]],
    [[39,20],[27,28],[30,20],[27,12]],
    [[20,39],[12,27],[20,30],[28,27]],
    [[1,20],[13,12],[10,20],[13,28]],
  ];
  const lime = '#c7ff47';
  const paleLime = '#e5ffac';
    const colorStops = [[0,[229,255,172]],[0.35,[199,255,71]],[0.67,[184,247,66]],[0.84,[155,227,66]],[1,[136,215,75]]];
  function fieldColor(nx,ny){
    const value=Math.max(0,Math.min(1,nx*0.25+ny*0.75));
    let a=colorStops[0],b=colorStops[1];
    for(let i=1;i<colorStops.length;i++){
      b=colorStops[i];if(value<=b[0])break;a=b;
    }
    const t=(value-a[0])/(b[0]-a[0]||1);
    return `rgb(${a[1].map((channel,i)=>Math.round(channel+(b[1][i]-channel)*t)).join(',')})`;
  }
  const base = document.createElement('canvas');
  const baseCtx = base.getContext('2d');
  let width=1, height=1, dpr=1, step=10, fieldSize=480, left=0, top=0;
  let points=[], glyphPoints=[], pulses=[], visible=true, raf=0, last=0, time=0;
  let nextAutoPulse=0, touchGesture=null, suppressClickUntil=0;
  const pointer={active:false,x:-1000,y:-1000,easedX:-1000,easedY:-1000};

  function inside(x,y,polygon) {
    let result=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const a=polygon[i],b=polygon[j];
      if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])) result=!result;
    }
    return result;
  }
  function requestDraw(){
    if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);
  }
  function drawBase(){
    base.width=Math.round(width*dpr);base.height=Math.round(height*dpr);
    baseCtx.setTransform(dpr,0,0,dpr,0,0);
    baseCtx.clearRect(0,0,width,height);
    // The diffuse silhouette is cached once per resize, never blurred per pixel.
    const bloom=baseCtx.createLinearGradient(left,top,left+fieldSize*0.3,top+fieldSize);
    bloom.addColorStop(0,paleLime);bloom.addColorStop(0.35,lime);
    bloom.addColorStop(0.67,'#b8f742');bloom.addColorStop(1,'#88d74b');
    baseCtx.save();
    baseCtx.filter=`blur(${Math.max(8,fieldSize*0.035)}px)`;
    baseCtx.globalAlpha=0.25;baseCtx.fillStyle=bloom;
    for(const facet of facets){
      baseCtx.beginPath();
      facet.forEach(([fx,fy],i)=>{
        const x=left+fx/40*fieldSize,y=top+fy/40*fieldSize;
        if(i===0)baseCtx.moveTo(x,y);else baseCtx.lineTo(x,y);
      });
      baseCtx.closePath();baseCtx.fill();
    }
    baseCtx.restore();
    baseCtx.lineWidth=0.7;
    baseCtx.strokeStyle='#c7ff471a';
    baseCtx.beginPath();
    for(const p of points){
      const arm=step*0.13;
      baseCtx.moveTo(p.x-arm,p.y);baseCtx.lineTo(p.x+arm,p.y);
      baseCtx.moveTo(p.x,p.y-arm);baseCtx.lineTo(p.x,p.y+arm);
    }
    baseCtx.stroke();
    // Precise corner brackets anchor the flat field without boxing it in.
    const inset=step*0.5, arm=step*0.95;
    const x=left-inset,y=top-inset,s=fieldSize+inset*2;
    baseCtx.strokeStyle='#c7ff4748';baseCtx.lineWidth=1;
    baseCtx.beginPath();
    for(const [cx,cy,dx,dy] of [[x,y,1,1],[x+s,y,-1,1],[x+s,y+s,-1,-1],[x,y+s,1,-1]]){
      baseCtx.moveTo(cx+dx*arm,cy);baseCtx.lineTo(cx,cy);baseCtx.lineTo(cx,cy+dy*arm);
    }
    baseCtx.stroke();
    baseCtx.fillStyle='#c7ff4750';
    const tick=step*0.24;
    for(let n=8;n<columns-1;n+=8){
      baseCtx.fillRect(left+n*step,top-step*1.25,1,tick);
      baseCtx.fillRect(left+n*step,top+fieldSize+step,1,tick);
    }
  }
  function resize(){
    const box=canvas.getBoundingClientRect();
    width=Math.max(1,box.width);height=Math.max(1,box.height);
    mobile=smallViewport.matches;
    columns=mobile?37:49;
    nextAutoPulse=time+0.6;
    touchGesture=null;
    dpr=Math.min(window.devicePixelRatio||1,1.6);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    step=Math.min(width*0.84,height*0.84)/(columns-1);
    fieldSize=step*(columns-1);left=(width-fieldSize)/2;top=(height-fieldSize)/2;
    points=[];
    for(let row=0;row<columns;row++)for(let col=0;col<columns;col++){
      const nx=col/(columns-1),ny=row/(columns-1);
      const facet=facets.findIndex(shape=>inside(nx*40,ny*40,shape));
      points.push({x:left+col*step,y:top+row*step,nx,ny,col,row,facet,
        accent:facet===1&&(col+row)%13===0,
        color:fieldColor(nx,ny),
        variation:((col*19+row*31)%17)/17});
    }
    glyphPoints=points.filter(p=>p.facet>=0);
    drawBase();last=0;requestDraw();
  }
  function pulse(x,y,{auto=false,schedule=true,start=performance.now()}={}){
    pulses.push({x,y,start,auto,quiet:reduced.matches,
      strength:auto?0.44:(mobile?1.55:1),duration:reduced.matches?360:1900});
    if(pulses.length>5)pulses.shift();
    if(mobile&&!auto)nextAutoPulse=time+4.8;
    if(schedule)requestDraw();
  }
  function chevron(x,y,length,angle,alpha,color=lime){
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(1,step*0.15);
    const dx=Math.cos(angle),dy=Math.sin(angle);
    const tip=length*0.4,back=-length*0.3,wing=length*0.4;
    ctx.beginPath();
    ctx.moveTo(x+dx*back-dy*wing,y+dy*back+dx*wing);
    ctx.lineTo(x+dx*tip,y+dy*tip);
    ctx.lineTo(x+dx*back+dy*wing,y+dy*back-dx*wing);
    ctx.stroke();
  }
  function draw(now){
    raf=0;if(!visible||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,0.06):0;last=now;
    if(!reduced.matches)time+=dt;
    if(mobile&&!reduced.matches&&time>=nextAutoPulse){
      pulse(width/2,height/2,{auto:true,schedule:false,start:now});
      nextAutoPulse=time+4.8;
    }
    if(reduced.matches){pointer.easedX=pointer.x;pointer.easedY=pointer.y;}
    else{
      // Exponential following keeps the same feel at 60, 90 and 120 Hz.
      const follow=1-Math.exp(-dt*9);
      pointer.easedX+=(pointer.x-pointer.easedX)*follow;
      pointer.easedY+=(pointer.y-pointer.easedY)*follow;
    }
    pulses=pulses.filter(p=>now-p.start<p.duration);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.globalAlpha=1;ctx.drawImage(base,0,0,width,height);
    const radius=step*7.3;
    const scan=(time*0.13)%1.8-0.4;
    const breathing=mobile&&!reduced.matches?1+Math.sin(time*Math.PI*2/4.8)*0.018:1;
    // The static grid is cached; only interaction needs the surrounding points.
    const activePoints=pointer.active||pulses.length?points:glyphPoints;
    for(const p of activePoints){
      const glyph=p.facet>=0;
      const px=glyph?width/2+(p.x-width/2)*breathing:p.x;
      const py=glyph?height/2+(p.y-height/2)*breathing:p.y;
      const dx=px-pointer.easedX,dy=py-pointer.easedY;
      const distance=Math.max(Math.abs(dx),Math.abs(dy));
      const influence=pointer.active?Math.pow(Math.max(0,1-distance/radius),1.7):0;
      let wave=0,strongestWave=0,waveAngle=0;
      for(const q of pulses){
        const age=now-q.start;
        const reach=age*fieldSize/1450;
        const dist=Math.max(Math.abs(px-q.x),Math.abs(py-q.y));
        const strength=q.quiet
          ?Math.max(0,1-dist/(fieldSize*0.75))*Math.max(0,1-age/q.duration)*q.strength
          :Math.max(0,1-Math.abs(dist-reach)/(step*(mobile?2.8:2.1)))*Math.max(0,1-age/q.duration)*q.strength;
        const tapFlash=mobile&&glyph&&!q.auto&&!q.quiet&&age<160?Math.max(0,1-age/160)*0.18:0;
        wave+=strength+tapFlash;
        if(strength>strongestWave){strongestWave=strength;waveAngle=Math.atan2(py-q.y,px-q.x);}
      }
      const scanLight=reduced.matches?0:Math.max(0,1-Math.abs(p.nx+p.ny*0.22-scan)/0.12);
      if(!glyph&&influence<0.015&&wave<0.015&&scanLight<0.8)continue;
      const dist=influence>0?Math.max(1,Math.hypot(dx,dy)):1;
      const displacement=reduced.matches?0:influence*influence*step*1.7;
      const x=px+dx/dist*displacement,y=py+dy/dist*displacement;
      const brightness=glyph?0.77+p.variation*0.15+scanLight*0.23:0;
      const alpha=Math.min(1,brightness+influence*0.9+wave*1.05+(!glyph?scanLight*0.065:0));
      const color=influence>0.38?lime:(p.accent?paleLime:p.color);
      const sparseChevron=(p.col+p.row*3)%4===0;
      if(influence>0.18&&sparseChevron){
        // Sparse open facets follow the pointer; most pixels retain their shape.
        const direction=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4);
        chevron(x,y,step*(0.57+influence*0.34),direction,alpha,color);
      }else if(mobile&&!reduced.matches&&wave>0.32&&sparseChevron){
        const direction=Math.round(waveAngle/(Math.PI/4))*(Math.PI/4);
        chevron(x,y,step*0.78,direction,alpha,color);
      }else if(glyph){
        ctx.globalAlpha=alpha;ctx.fillStyle=color;
        const horizontal=p.facet===0||p.facet===2;
        const long=step*((mobile?0.67:0.57)+(reduced.matches?0:wave*0.13));
        const short=step*(mobile?0.46:0.37);
        const w=horizontal?long:short,h=horizontal?short:long;
        ctx.fillRect(x-w/2,y-h/2,w,h);
        if(wave>0.28&&!reduced.matches){
          ctx.globalAlpha=Math.min(1,wave*0.4);
          ctx.fillRect(x-long*.68,y-long*.68,long*1.36,long*1.36);
        }
      }else if(wave>0.04||influence>0.015){
        if(wave>0.3&&sparseChevron&&!reduced.matches){
          const direction=Math.round(waveAngle/(Math.PI/4))*(Math.PI/4);
          chevron(x,y,step*0.5,direction,alpha*0.7,color);
        }else{
          const size=step*(0.22+influence*0.18+(reduced.matches?0:wave*0.1));
          ctx.globalAlpha=alpha*0.7;ctx.fillStyle=color;
          ctx.fillRect(x-size/2,y-size/2,size,size);
        }
      }
    }
    // A tap sends a square wave through the grid. The shape stays resolutely flat.
    for(const p of pulses){
      if(p.quiet)continue;
      const age=now-p.start,reach=age*fieldSize/1450;
      ctx.globalAlpha=Math.min(1,Math.max(0,1-age/1500)*0.26*p.strength);
      ctx.strokeStyle=lime;ctx.lineWidth=1;
      ctx.strokeRect(p.x-reach,p.y-reach,reach*2,reach*2);
      if(age<450){
        const small=step*(0.8+age/450);
        ctx.globalAlpha=Math.min(1,(1-age/450)*0.8*p.strength);
        ctx.strokeRect(p.x-small,p.y-small,small*2,small*2);
      }
    }
    if(pointer.active){
      const x=pointer.easedX,y=pointer.easedY,arm=step*0.55;
      ctx.globalAlpha=0.8;ctx.strokeStyle=lime;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x-arm,y);ctx.lineTo(x+arm,y);
      ctx.moveTo(x,y-arm);ctx.lineTo(x,y+arm);ctx.stroke();
      ctx.globalAlpha=0.3;ctx.strokeRect(x-step*1.1,y-step*1.1,step*2.2,step*2.2);
    }
    ctx.globalAlpha=1;
    if(!reduced.matches||pulses.length)raf=requestAnimationFrame(draw);
  }
  function setPointer(event){
    if(event.pointerType==='touch'){
      if(touchGesture&&touchGesture.pointerId===event.pointerId&&
        Math.hypot(event.clientX-touchGesture.x,event.clientY-touchGesture.y)>10)touchGesture.moved=true;
      return;
    }
    const box=canvas.getBoundingClientRect();
    const x=event.clientX-box.left,y=event.clientY-box.top;
    if(!pointer.active){pointer.easedX=x;pointer.easedY=y;}
    pointer.active=true;pointer.x=x;pointer.y=y;requestDraw();
  }
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch')return;
    suppressClickUntil=performance.now()+900;
    if(!event.isPrimary){touchGesture=null;return;}
    touchGesture={pointerId:event.pointerId,x:event.clientX,y:event.clientY,start:performance.now(),moved:false};
  },{passive:true});
  canvas.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch')return;
    const gesture=touchGesture;
    touchGesture=null;
    suppressClickUntil=performance.now()+900;
    if(!gesture||gesture.pointerId!==event.pointerId||gesture.moved||
      performance.now()-gesture.start>700||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>10)return;
    const box=canvas.getBoundingClientRect();
    pulse(event.clientX-box.left,event.clientY-box.top);
  },{passive:true});
  canvas.addEventListener('pointermove',setPointer,{passive:true});
  canvas.addEventListener('pointerenter',setPointer,{passive:true});
  canvas.addEventListener('pointerleave',event=>{
    pointer.active=false;
    if(event.pointerType==='touch')touchGesture=null;
    requestDraw();
  },{passive:true});
  canvas.addEventListener('pointercancel',event=>{
    pointer.active=false;touchGesture=null;
    if(event.pointerType==='touch')suppressClickUntil=performance.now()+900;
    requestDraw();
  },{passive:true});
  canvas.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil)return;
    const box=canvas.getBoundingClientRect();
    pulse(event.clientX-box.left,event.clientY-box.top);
  });
  canvas.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();if(!event.repeat)pulse(width/2,height/2);
    }
  });
  canvas.style.touchAction='pan-y pinch-zoom';
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){last=0;requestDraw();}
    else{
      touchGesture=null;
      if(raf){cancelAnimationFrame(raf);raf=0;}
    }
  },{rootMargin:'40px'}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){touchGesture=null;cancelAnimationFrame(raf);raf=0;}
    else{last=0;requestDraw();}
  });
  reduced.addEventListener('change',()=>{
    cancelAnimationFrame(raf);raf=0;last=0;time=0;pulses=[];nextAutoPulse=0.6;requestDraw();
  });
  smallViewport.addEventListener('change',resize);
  resize();requestDraw();
})();
