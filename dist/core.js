/* SIDCO — a tactile, two-dimensional field of possibilities. */
(() => {
  const canvas = document.getElementById('energy-core');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    const fallback = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="#c7ff47"><path d="M20 1 28 13 20 10 12 13ZM39 20 27 28 30 20 27 12ZM20 39 12 27 20 30 28 27ZM1 20 13 12 10 20 13 28Z"/></svg>';
    canvas.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(fallback)}")`;
    canvas.style.backgroundSize = '72% 72%';
    canvas.style.backgroundPosition = 'center';
    canvas.style.backgroundRepeat = 'no-repeat';
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const columns = 49;
  const facets = [
    [[20,1],[28,13],[20,10],[12,13]],
    [[39,20],[27,28],[30,20],[27,12]],
    [[20,39],[12,27],[20,30],[28,27]],
    [[1,20],[13,12],[10,20],[13,28]],
  ];
  const lime = '#c7ff47';
  const cyan = '#79e5d1';
  const base = document.createElement('canvas');
  const baseCtx = base.getContext('2d');
  let width=1, height=1, dpr=1, step=10, fieldSize=480, left=0, top=0;
  let points=[], pulses=[], visible=true, raf=0, last=0, time=0;
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
        variation:((col*19+row*31)%17)/17});
    }
    drawBase();last=0;requestDraw();
  }
  function pulse(x,y){
    pulses.push({x,y,start:performance.now()});
    if(pulses.length>5)pulses.shift();
    requestDraw();
  }
  function line(x,y,length,angle,alpha,color=lime,arrow=false){
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(1,step*0.15);
    const dx=Math.cos(angle),dy=Math.sin(angle),half=length/2;
    ctx.beginPath();ctx.moveTo(x-dx*half,y-dy*half);ctx.lineTo(x+dx*half,y+dy*half);
    if(arrow){
      const head=length*0.34;
      ctx.moveTo(x+dx*half-dx*head-dy*head,y+dy*half-dy*head+dx*head);
      ctx.lineTo(x+dx*half,y+dy*half);
      ctx.lineTo(x+dx*half-dx*head+dy*head,y+dy*half-dy*head-dx*head);
    }
    ctx.stroke();
  }
  function draw(now){
    raf=0;if(!visible||document.hidden)return;
    if(last&&now-last<30){raf=requestAnimationFrame(draw);return;}
    const dt=last?Math.min((now-last)/1000,0.06):0;last=now;
    if(!reduced.matches)time+=dt;
    if(reduced.matches){pointer.easedX=pointer.x;pointer.easedY=pointer.y;}
    else{
      pointer.easedX+=(pointer.x-pointer.easedX)*0.22;
      pointer.easedY+=(pointer.y-pointer.easedY)*0.22;
    }
    pulses=pulses.filter(p=>now-p.start<1900);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.globalAlpha=1;ctx.drawImage(base,0,0,width,height);
    const radius=step*7.3;
    const scan=(time*0.13)%1.8-0.4;
    for(const p of points){
      const dx=p.x-pointer.easedX,dy=p.y-pointer.easedY;
      const distance=Math.max(Math.abs(dx),Math.abs(dy));
      const influence=pointer.active?Math.pow(Math.max(0,1-distance/radius),1.7):0;
      let wave=0;
      for(const q of pulses){
        const age=now-q.start;
        const reach=age*fieldSize/1450;
        const dist=Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y));
        wave+=Math.max(0,1-Math.abs(dist-reach)/(step*2.1))*Math.max(0,1-age/1900);
      }
      const scanLight=reduced.matches?0:Math.max(0,1-Math.abs(p.nx+p.ny*0.22-scan)/0.12);
      const glyph=p.facet>=0;
      if(!glyph&&influence<0.015&&wave<0.015&&scanLight<0.8)continue;
      const dist=Math.max(1,Math.hypot(dx,dy));
      const displacement=reduced.matches?0:influence*influence*step*1.7;
      const x=p.x+dx/dist*displacement,y=p.y+dy/dist*displacement;
      const brightness=glyph?0.60+p.variation*0.23+scanLight*0.3:0;
      const alpha=Math.min(1,brightness+influence*0.9+wave*1.05+(!glyph?scanLight*0.065:0));
      const color=p.accent&&influence<0.2?cyan:lime;
      if(influence>0.18){
        // Every nearby pixel becomes a tiny, outward-pointing control surface.
        const direction=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4);
        line(x,y,step*(0.57+influence*0.34),direction,alpha,color,true);
      }else if(glyph){
        ctx.globalAlpha=alpha;ctx.fillStyle=color;
        const horizontal=p.facet===0||p.facet===2;
        const long=step*(0.57+wave*0.13),short=step*0.37;
        const w=horizontal?long:short,h=horizontal?short:long;
        ctx.fillRect(x-w/2,y-h/2,w,h);
        if(wave>0.28){
          ctx.globalAlpha=wave*0.4;
          ctx.fillRect(x-long*.68,y-long*.68,long*1.36,long*1.36);
        }
      }else if(wave>0.04||influence>0.015){
        const angle=p.nx<0.5?Math.PI:0;
        line(x,y,step*0.5,angle,alpha*0.7,color,wave>0.3);
      }
    }
    // A tap sends a square wave through the grid. The shape stays resolutely flat.
    for(const p of pulses){
      const age=now-p.start,reach=age*fieldSize/1450;
      ctx.globalAlpha=Math.max(0,1-age/1500)*0.26;
      ctx.strokeStyle=lime;ctx.lineWidth=1;
      ctx.strokeRect(p.x-reach,p.y-reach,reach*2,reach*2);
      if(age<450){
        const small=step*(0.8+age/450);
        ctx.globalAlpha=(1-age/450)*0.8;
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
    if(event.pointerType==='touch')return;
    const box=canvas.getBoundingClientRect();
    const x=event.clientX-box.left,y=event.clientY-box.top;
    if(!pointer.active){pointer.easedX=x;pointer.easedY=y;}
    pointer.active=true;pointer.x=x;pointer.y=y;requestDraw();
  }
  canvas.addEventListener('pointermove',setPointer,{passive:true});
  canvas.addEventListener('pointerenter',setPointer,{passive:true});
  canvas.addEventListener('pointerleave',()=>{pointer.active=false;requestDraw();},{passive:true});
  canvas.addEventListener('pointercancel',()=>{pointer.active=false;requestDraw();},{passive:true});
  canvas.addEventListener('click',event=>{
    const box=canvas.getBoundingClientRect();
    pulse(event.clientX-box.left,event.clientY-box.top);
  });
  canvas.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();if(!event.repeat)pulse(width/2,height/2);
    }
  });
  canvas.style.touchAction='pan-y';
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){last=0;requestDraw();}
    else if(raf){cancelAnimationFrame(raf);raf=0;}
  },{rootMargin:'40px'}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;}
    else{last=0;requestDraw();}
  });
  reduced.addEventListener('change',()=>{
    cancelAnimationFrame(raf);raf=0;last=0;time=0;requestDraw();
  });
  resize();requestDraw();
})();
