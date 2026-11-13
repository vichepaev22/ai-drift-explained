
const get=()=>window.DriftCore;
let three,heroReady=false,renderMap=0,scene,camera,renderer,points,pointIds=[],controls={down:false,moved:false,px:0,py:0,x:0,y:0},mapReady=false,mapBounds=null,mapWasFitted=false,dataExtent=null;
function robustBounds(m){const xs=[],ys=[],n=m.x.length,step=Math.max(1,Math.floor(n/6500));for(let i=0;i<n;i+=step){const x=+m.x[i],y=+m.y[i];if(Number.isFinite(x)&&Number.isFinite(y)){xs.push(x);ys.push(y)}}if(!xs.length)throw Error('Нет корректных координат карты');xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);const lo=Math.floor((xs.length-1)*.005),hi=Math.ceil((xs.length-1)*.995);return {minX:xs[lo],maxX:xs[hi],minY:ys[lo],maxY:ys[hi]}}
function fit3D(){if(!camera||!mapBounds)return;const host=document.getElementById('map-canvas');const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),aspect=w/h,tan=Math.tan(camera.fov*Math.PI/360);const zx=mapBounds.width/(2*tan*aspect*.85),zy=mapBounds.height/(2*tan*.85);camera.position.set(0,0,Math.max(8,Math.min(140,Math.max(zx,zy)+1.3)));camera.aspect=aspect;camera.updateProjectionMatrix()}
export function zoom(factor){if(twoD){trans.zoom=Math.max(.4,Math.min(15,trans.zoom*factor));draw2D()}else if(camera){camera.position.z=Math.max(4.5,Math.min(140,camera.position.z/factor))}}
export async function initHero(){if(heroReady)return;heroReady=true;try{const T=three=await import('three'),host=document.getElementById('hero-orbit'),w=Math.max(200,host.clientWidth),h=Math.max(200,host.clientHeight);const sc=new T.Scene(),cam=new T.PerspectiveCamera(55,w/h,.1,100);cam.position.z=12;const ren=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});ren.setPixelRatio(Math.min(devicePixelRatio,1.5));ren.setSize(w,h);ren.setClearColor(0x000000,0);host.appendChild(ren.domElement);const p=[],c=[];for(let i=0;i<3000;i++){const u=Math.random()*Math.PI*2,v=(Math.random()-.5)*Math.PI,r=3.3+(Math.random()-.5)*2.0;p.push(Math.cos(u)*Math.cos(v)*r,Math.sin(v)*r*.87,Math.sin(u)*Math.cos(v)*r);const cc=new T.Color(i%9===0?'#ffd4a2':i%4===0?'#a09bff':'#61e9df');c.push(cc.r,cc.g,cc.b)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));const o=new T.Points(g,new T.PointsMaterial({vertexColors:true,size:.035,sizeAttenuation:true,transparent:true,opacity:.85}));sc.add(o);const rings=[];for(let j=0;j<3;j++){const r=new T.Mesh(new T.TorusGeometry(3.5+j*.22,.009,5,128),new T.MeshBasicMaterial({color:[0x6be7df,0x6f80dd,0x3f7e8c][j],transparent:true,opacity:.22}));r.rotation.x=.6+j*.25;r.rotation.y=j*.4;sc.add(r);rings.push(r)}let t=0;const frame=()=>{requestAnimationFrame(frame);if(document.hidden)return;t+=.0023;o.rotation.y=t;o.rotation.z=.13*Math.sin(t);rings.forEach((r,i)=>r.rotation.y=(i%2?-1:1)*t*.7);ren.render(sc,cam)};frame();}catch(e){console.error('Hero animation',e)}}
export async function start(){const {D,q,loadFull,toasts}=get();if(mapReady)return;if(renderMap)return;renderMap=1;try{await loadFull();q('map-loading')?.querySelector('small')&&(q('map-loading').querySelector('small').textContent='Строим пространственную модель реальных точек…');const T=three=three||await import('three'),host=q('map-canvas');scene=new T.Scene();const w=Math.max(300,host.clientWidth),h=Math.max(200,host.clientHeight);camera=new T.PerspectiveCamera(49,w/h,.1,400);camera.position.set(0,0,23);renderer=new T.WebGLRenderer({alpha:false,antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(w,h);renderer.setClearColor(0x081527,1);host.appendChild(renderer.domElement);let grid=new T.GridHelper(24,24,0x203e58,0x122a40);grid.rotation.x=Math.PI/2;grid.position.z=-3.0;scene.add(grid);events(renderer.domElement);mapReady=true;repaint();const anim=()=>{requestAnimationFrame(anim);if(document.hidden||get().S.view!=='map')return;if(points){points.rotation.x+=(-.045-points.rotation.x)*.02;points.rotation.y+=(.04-points.rotation.y)*.02}renderer.render(scene,camera)};anim();window.addEventListener('resize',()=>{if(!host.isConnected)return;camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);fit3D()});q('map-loading')?.remove()}catch(e){console.warn('WebGL map unavailable, using Canvas 2D',e);try{init2D()}catch(z){console.error(z);const p=q('map-loading');if(p)p.querySelector('small').textContent='Ошибка загрузки карты: '+z.message;toasts('Карта недоступна: '+z.message)}}finally{renderMap=0}}
export function repaint(){
  if(!mapReady)return;
  if(twoD){draw2D();return}
  const {D,S,q,hue,fmt}=get(),T=three,m=D.map,z=D.members;
  const n=m.x.length,quality=S.quality;
  const stride=quality==='full'?1:quality==='low'?8:innerWidth<760?5:3;
  const capacity=Math.ceil(n/stride);
  const positions=new Float32Array(capacity*3);
  const colors=new Float32Array(capacity*3);
  const ids=new Int32Array(capacity);
  const {minX,maxX,minY,maxY}=dataExtent||(dataExtent=robustBounds(m));
  const scale=20/Math.max(1e-8,maxX-minX,maxY-minY);
  const midX=(minX+maxX)/2,midY=(minY+maxY)/2;
  mapBounds={width:(maxX-minX)*scale,height:(maxY-minY)*scale};
  const topicColors=Array.from({length:D.topics.length},(_,id)=>new T.Color().setHSL(hue(id)/360,.75,.66));
  const yearColors=Array.from({length:9},(_,year)=>new T.Color().setHSL(.52+year/17,.85,.66));
  const up=new T.Color('#6df1dc'),down=new T.Color('#ff937b'),noise=new T.Color('#42536a');
  let k=0;
  for(let i=0;i<n;i+=stride){
    const id=z.cluster[i],year=z.year[i];
    if((S.mapTopic!==null&&S.mapTopic!==id)||
       (S.mapYear!=='all'&&Number(S.mapYear)!==Number(year)))continue;
    const delta=id<0?0:D.topics[id]?.deltaPp??0;
    const color=id<0?noise:
      S.mapColor==='drift'?(delta>=0?up:down):
      S.mapColor==='year'?(yearColors[Number(year)-2018]||noise):
      (topicColors[id]||noise);
    positions[k*3]=(m.x[i]-midX)*scale;
    positions[k*3+1]=(m.y[i]-midY)*scale;
    positions[k*3+2]=(Number(year)-2022)*.15+(id<0?-.5:0);
    colors[k*3]=color.r;colors[k*3+1]=color.g;colors[k*3+2]=color.b;
    ids[k]=i;k++;
  }
  if(points){scene.remove(points);points.geometry.dispose();points.material.dispose()}
  const geom=new T.BufferGeometry();
  geom.setAttribute('position',new T.BufferAttribute(positions.subarray(0,k*3),3));
  geom.setAttribute('color',new T.BufferAttribute(colors.subarray(0,k*3),3));
  points=new T.Points(geom,new T.PointsMaterial({
    size:stride===1?2.0:2.8,sizeAttenuation:false,
    vertexColors:true,transparent:true,opacity:.94,depthWrite:false
  }));
  scene.add(points);pointIds=ids.subarray(0,k);
  if(!mapWasFitted){fit3D();mapWasFitted=true}
  q('map-count').textContent=fmt(n)+' утверждений';
  const selected=(S.mapTopic!==null||S.mapYear!=='all');
  q('map-selection').textContent=`Отрисовано ${fmt(k)} из ${fmt(n)} точек · ${selected?'фильтр применён · ':''}каждая ${stride}-я точка`;
}
export function reset(){if(twoD){trans={zoom:1,panX:0,panY:0};draw2D()}else if(camera){fit3D();repaint()}}
function events(canvas){const T=three;canvas.style.touchAction='none';canvas.addEventListener('pointerdown',e=>{controls.down=true;controls.moved=false;controls.px=e.clientX;controls.py=e.clientY;controls.x=e.clientX;controls.y=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!controls.down)return;const dx=e.clientX-controls.px,dy=e.clientY-controls.py;controls.px=e.clientX;controls.py=e.clientY;if(Math.abs(e.clientX-controls.x)+Math.abs(e.clientY-controls.y)>5)controls.moved=true;camera.position.x-=dx*.023*(camera.position.z/23);camera.position.y+=dy*.023*(camera.position.z/23)});canvas.addEventListener('pointerup',e=>{controls.down=false;if(!controls.moved)click(e,canvas)});canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(4.5,Math.min(140,camera.position.z+Math.sign(e.deltaY)*1.8))},{passive:false});canvas.addEventListener('dblclick',()=>reset())}
function click(e,canvas){if(!points||pointIds.length===0)return;const T=three,rc=new T.Raycaster(),rect=canvas.getBoundingClientRect();rc.params.Points.threshold=.10;rc.setFromCamera(new T.Vector2(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height),camera);const hits=rc.intersectObject(points);if(!hits.length)return;const k=pointIds[hits[0].index],{D,drawer}=get();drawer(D.members.paper[k],D.members.cluster[k])}
export async function openTopic(id){const {D,loadFull,drawer,toasts}=get();try{await loadFull();const i=D.members.cluster.indexOf(id);if(i<0)return toasts('Утверждений в теме не найдено');drawer(D.members.paper[i],id)}catch(e){toasts('Не удалось загрузить тезис: '+e.message)}}


let twoD=false,canvas2d,ctx2d,trans={zoom:1,panX:0,panY:0},projection={midX:0,midY:0,scale:1},visibleIds=[];
function init2D(){const {q,D,toasts}=get();const host=q('map-canvas');twoD=true;mapReady=true;canvas2d=document.createElement('canvas');canvas2d.style.cssText='width:100%;height:100%;display:block;cursor:grab;touch-action:none';host.appendChild(canvas2d);const coords=D.map,n=coords.x.length;const {minX,maxX,minY,maxY}=dataExtent||(dataExtent=robustBounds(coords));projection.midX=(maxX+minX)/2;projection.midY=(maxY+minY)/2;projection.rangeX=Math.max(1e-8,maxX-minX);projection.rangeY=Math.max(1e-8,maxY-minY);function fit(){canvas2d.width=Math.max(100,host.clientWidth*devicePixelRatio);canvas2d.height=Math.max(100,host.clientHeight*devicePixelRatio);ctx2d=canvas2d.getContext('2d',{alpha:false});projection.scale=.85*Math.min(canvas2d.width/projection.rangeX,canvas2d.height/projection.rangeY);draw2D()}fit();window.addEventListener('resize',fit);let active=false,moved=false,x0=0,y0=0;canvas2d.addEventListener('pointerdown',e=>{active=true;moved=false;x0=e.clientX;y0=e.clientY;canvas2d.setPointerCapture(e.pointerId)});canvas2d.addEventListener('pointermove',e=>{if(!active)return;let dx=e.clientX-x0,dy=e.clientY-y0;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;trans.panX+=dx*devicePixelRatio;trans.panY+=dy*devicePixelRatio;x0=e.clientX;y0=e.clientY;draw2D()});canvas2d.addEventListener('pointerup',e=>{active=false;if(!moved)pick2D(e)});canvas2d.addEventListener('wheel',e=>{e.preventDefault();trans.zoom=Math.max(.4,Math.min(12,trans.zoom*(e.deltaY<0?1.18:.85)));draw2D()},{passive:false});canvas2d.addEventListener('dblclick',()=>{trans={zoom:1,panX:0,panY:0};draw2D()});q('map-loading')?.remove();toasts('Карта работает в совместимом 2D-режиме: WebGL недоступен');}
function coord(i){const {D}=get();return [canvas2d.width/2+(D.map.x[i]-projection.midX)*projection.scale*trans.zoom+trans.panX,canvas2d.height/2-(D.map.y[i]-projection.midY)*projection.scale*trans.zoom+trans.panY]}
function draw2D(){if(!ctx2d)return;const {D,S,q,col,fmt}=get(),ctx=ctx2d,n=D.map.x.length;ctx.fillStyle='#091628';ctx.fillRect(0,0,canvas2d.width,canvas2d.height);const stride=S.quality==='full'?1:S.quality==='low'?9:innerWidth<760?6:4;visibleIds=[];let k=0;for(let i=0;i<n;i+=stride){const topic=D.members.cluster[i],yr=D.members.year[i],selected=(S.mapTopic===null||topic===S.mapTopic)&&(S.mapYear==='all'||Number(S.mapYear)===Number(yr));if(!selected)continue;let x=canvas2d.width/2+(D.map.x[i]-projection.midX)*projection.scale*trans.zoom+trans.panX,y=canvas2d.height/2-(D.map.y[i]-projection.midY)*projection.scale*trans.zoom+trans.panY;if(x<0||x>=canvas2d.width||y<0||y>=canvas2d.height)continue;ctx.fillStyle=topic<0?'#5f748b':S.mapColor==='drift'?(D.topics[topic]?.deltaPp>=0?'#65e5c8':'#ff9378'):S.mapColor==='year'?`hsl(${190+(yr-2018)*15} 70% 67%)`:col(topic);ctx.globalAlpha=topic<0?.40:.82;const size=Math.max(1.2,Math.min(4,1.5*devicePixelRatio*trans.zoom**.17));ctx.fillRect(x,y,size,size);k++;visibleIds.push(i)}ctx.globalAlpha=1;q('map-count').textContent=fmt(n)+' утверждений';q('map-selection').textContent=`Отрисовано ${fmt(visibleIds.length)} из ${fmt(n)} точек · 2D-режим, шаг ${stride}`;}
function pick2D(e){const rect=canvas2d.getBoundingClientRect(),x=(e.clientX-rect.left)*devicePixelRatio,y=(e.clientY-rect.top)*devicePixelRatio;let best=null,dist=Infinity;for(let i of visibleIds){const c=coord(i),d=(c[0]-x)**2+(c[1]-y)**2;if(d<dist){best=i;dist=d}}if(best!==null&&dist<100*devicePixelRatio**2){const {D,drawer}=get();drawer(D.members.paper[best],D.members.cluster[best])}}

