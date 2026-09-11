import { renderProfile, loadPortrait } from "./profile-content.js";
import { categoryBySlug, profile } from './integration-config.js';
import { language, setLanguage } from './language.js';
const detail=document.querySelector('#detail'),motionButton=document.querySelector('#motion');
const data={about:{n:'01 / THE BEDROOM',title:'About me',body:'<p>我是 Zoya，一名从空间出发、探索设计与数字体验的设计者。</p><p>中国美术学院 · 环境艺术<br>University of Edinburgh · Advanced Sustainable Design</p><p class="muted">这个房间将继续放入个人介绍与生活片段。</p>'},portfolio:{n:'02 / 空间类作品',title:'Spatial Design',body:'<p>空间、公共性与日常生活。</p><ul><li>01 &nbsp; 传习学院改造<small>CRAFT ACADEMY RENOVATION · 2025</small></li><li>02 &nbsp; 新华路城市更新<small>XINHUA ROAD URBAN STUDY · 2025</small></li><li>03 &nbsp; 观鲸码头<small>WHALE WATCHING PIER · 2023</small></li><li>04 &nbsp; 浙江博物馆扩建<small>MUSEUM EXTENSION · 2022</small></li><li>05 &nbsp; 竹结构搭建<small>BAMBOO STRUCTURE · 2024</small></li><li>06 &nbsp; 所见之光<small>THE SEEN LIGHT · 2025</small></li></ul><p class="muted">项目详情页正在另行设计，完成后从这里进入。</p>'},other:{n:'03 / 平面类作品',title:'Graphic Design',body:'<p>平面设计、视觉表达与图像创作。</p><p class="muted">这里将展示平面类作品，项目内容待补充。</p>'},awards:{n:'04 / THE GALLERY',title:'Awards & credentials',body:'<h2>竞赛获奖</h2><ul><li>林风眠创作奖 · 银奖<small>中国美术学院毕业创作 · 2025</small></li><li>全国竹创赛 · 三等奖<small>2023</small></li><li>晶麒麟奖<small>证书待补充</small></li></ul><h2>资格证书</h2><ul><li>陈设设计师证书</li><li>雅思成绩证明</li></ul><p class="muted">证书原件尚未上传，之后可在这里查看大图或 PDF。</p>'}};
const toolbar=document.querySelector('#room-toolbar'),roomControls=document.querySelector('#room-controls'),toggle=document.querySelector('#directory-toggle'),photoDialog=document.querySelector('#photo-dialog');
let focusRoom=()=>{},setHover=()=>{},returnView=()=>{},adjustView=()=>{},resetCamera=()=>{},interact=()=>{},applyPortrait=()=>{},motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,active=null;
data.atrium={n:'05 / THE ATRIUM',title:'Leave a note',body:'<p>在树下，留下一句话。</p>'};
const objects={atrium:[['guestbook','树下留言簿']],about:[['aboutArt','墙上挂画 · 关于我'],['photo','床头相框'],['lamp','床头灯'],['contact','露台椅 · 联系我']],portfolio:[['model','建筑模型'],['computer','电脑 · 空间作品'],['books','作品书架']],other:[['screen','影院屏幕'],['cinemaLamp','右墙壁灯']],awards:[['trophy','奖杯'],['certificates','证书']]};
function safeHistory(url){try{history.replaceState(null,'',url)}catch{}}
function setDirectory(open){detail.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'收起目录 −':'展开目录 +';document.body.classList.toggle('directory-open',open)}
data.about.body+='<button class=resume-download disabled>下载简历 PDF · 待上传</button>';
function fillDirectory(){document.querySelector('#detail-number').textContent=data[active].n;document.querySelector('#detail-title').textContent=data[active].title;document.querySelector('#detail-body').innerHTML=data[active].body}
function selectRoom(id){if(!data[id])return;active=id;document.body.classList.add('exploring');toolbar.hidden=false;roomControls.hidden=false;setDirectory(false);fillDirectory();document.querySelector('#room-caption').textContent=data[id].n;document.querySelector('#object-actions').replaceChildren(...objects[id].map(([key,label])=>{const b=document.createElement('button');b.textContent=label;b.dataset.object=key;b.onclick=()=>interact(key);return b}));focusRoom(id);document.querySelector('#reset').hidden=false;document.querySelector('#interaction-hint').textContent='拖动调整视角 · 滚轮缩放 · 点击家具探索';safeHistory('#'+id);document.querySelector('#canvas').focus({preventScroll:true})}
function reset(){active=null;setDirectory(false);returnView();document.body.classList.remove('exploring');toolbar.hidden=true;roomControls.hidden=true;document.querySelector('#reset').hidden=true;safeHistory(location.pathname)}
document.querySelectorAll('[data-room]').forEach(b=>{b.addEventListener('click',()=>selectRoom(b.dataset.room));b.addEventListener('mouseenter',()=>{if(!active)setHover(b.dataset.room)});b.addEventListener('mouseleave',()=>setHover(null));b.addEventListener('focus',()=>{if(!active)setHover(b.dataset.room)});b.addEventListener('blur',()=>setHover(null))});
document.querySelectorAll('.close,.return').forEach(b=>b.onclick=()=>{setDirectory(false);toggle.focus()});toggle.onclick=()=>setDirectory(detail.hidden);document.querySelector('.wordmark').onclick=e=>{e.preventDefault();reset()};document.querySelector('#reset').onclick=reset;document.querySelector('#back-room').onclick=reset;
document.querySelector('#turn-left').onclick=()=>adjustView(-.12,0,0);document.querySelector('#turn-right').onclick=()=>adjustView(.12,0,0);document.querySelector('#zoom-in').onclick=()=>adjustView(0,0,.13);document.querySelector('#zoom-out').onclick=()=>adjustView(0,0,-.13);document.querySelector('#view-reset').onclick=()=>resetCamera();
function updateMotion(){motionButton.textContent='动态视角：'+(motion?'开':'关');motionButton.setAttribute('aria-pressed',String(motion))}motionButton.onclick=()=>{motion=!motion;updateMotion()};updateMotion();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('#certificate-dialog')?.open&&!photoDialog.open&&!document.querySelector('#guestbook-dialog').open&&!document.querySelector('#contact-dialog').open){if(!detail.hidden){setDirectory(false);toggle.focus()}else if(active)reset()}});
document.querySelector('#photo-close').onclick=()=>photoDialog.close();
photoDialog.addEventListener('click',e=>{if(e.target===photoDialog){const r=photoDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)photoDialog.close()}});
let portraitURL=null;
document.querySelector('#portrait-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const note=document.querySelector('#photo-note');if(!['image/jpeg','image/png','image/webp'].includes(file.type)){note.textContent='请选择 JPG、PNG 或 WebP 图片。';return}if(file.size>20*1024*1024){note.textContent='请选择小于 20 MB 的照片。';return}const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();await applyPortrait(img);if(portraitURL)URL.revokeObjectURL(portraitURL);portraitURL=url;const preview=document.querySelector('#portrait-preview');preview.src=url;preview.hidden=false;document.querySelector('#photo-empty').hidden=true;note.textContent='已放入床头相框。照片仅留在当前预览中，重新打开文件后需重新选择。'}catch{URL.revokeObjectURL(url);note.textContent='这张图片没有成功打开，请换一张试试。'}});

document.querySelector('#contact-close').onclick=()=>document.querySelector('#contact-dialog').close();
// Persistent guestbook connected to the Next.js API.
const guestDialog = document.querySelector('#guestbook-dialog');
const guestList = document.querySelector('#guest-list');
const guestForm = document.querySelector('#guest-form');
const guestStatus = document.querySelector('#guest-status');
const guestManage = document.querySelector('#guest-manage');

let notes = [];
let manageNotes = false;

async function loadGuestbook() {
  try {
    const response = await fetch('/api/guestbook', {
      method: 'GET',
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '无法读取留言');
    }

    notes = Array.isArray(result.notes)
      ? result.notes.map(note => ({
          id: note.id,
          name: note.name,
          body: note.message,
          createdAt: note.created_at,
        }))
      : [];

    renderNotes();
  } catch (error) {
    console.error('Guestbook load error:', error);

    guestList.replaceChildren();

    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = '暂时无法读取留言，请稍后再试。';
    guestList.append(p);
  }
}

function renderNotes() {
  guestList.replaceChildren();

  guestManage.setAttribute(
    'aria-pressed',
    String(manageNotes)
  );

  guestManage.textContent = manageNotes
    ? '返回访客视图'
    : '管理预览';

  if (!notes.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = '这里还很安静，留下第一句话吧。';
    guestList.append(p);
    return;
  }

  for (const note of notes) {
    const article = document.createElement('article');
    const name = document.createElement('strong');
    const body = document.createElement('p');

    name.dataset.noTranslate = '';
    body.dataset.noTranslate = '';

    name.textContent = note.name;
    body.textContent = note.body;

    article.append(name, body);
    guestList.append(article);
  }
}

async function openGuestbook() {
  guestStatus.textContent = '';
  guestDialog.showModal();

  await loadGuestbook();
}

document.querySelector('#guest-close').onclick = () => {
  guestDialog.close();
};

document.querySelector('#nav-guest').onclick = () => {
  selectRoom('atrium');
  openGuestbook();
};

document.querySelector('#guest-open').onclick = () => {
  selectRoom('atrium');
  openGuestbook();
};

guestManage.onclick = () => {
  manageNotes = !manageNotes;
  renderNotes();
};

guestForm.onsubmit = async event => {
  event.preventDefault();

  const name = guestForm.elements.visitor.value.trim();
  const body = guestForm.elements.message.value.trim();

  if (!name || !body) {
    guestStatus.textContent = '请填写姓名和留言内容。';
    return;
  }

  const submitButton = guestForm.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) {
    submitButton.disabled = true;
  }

  guestStatus.textContent = '正在保存…';

  try {
    const response = await fetch('/api/guestbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        message: body,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '留言保存失败');
    }

    guestForm.reset();

    guestStatus.textContent =
      '谢谢你，留言已经留下。';

    await loadGuestbook();
  } catch (error) {
    console.error('Guestbook submit error:', error);

    guestStatus.textContent =
      error instanceof Error
        ? error.message
        : '留言保存失败，请稍后再试。';
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

// Load existing messages when the house page starts.
loadGuestbook();

try{
const T=await import('./three.module.js');
const host=document.querySelector('#canvas'),scene=new T.Scene();scene.background=new T.Color('#f8f8f4');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(27,host.clientWidth/host.clientHeight,.1,150);camera.position.set(0,4,29);camera.lookAt(0,4,0);
scene.add(new T.HemisphereLight(0xffffff,0xd0d3d1,2.6));scene.add(new T.AmbientLight(0xffffff,.24));const sun=new T.DirectionalLight(0xffffff,1.6);sun.position.set(-5,12,10);scene.add(sun);
const colors={ivory:0xe8e6dd,paper:0xf8f8f2,wood:0xd3c6ae,ink:0x364150,blue:0x60768e,dark:0x283749,soft:0xc5c5bf,soil:0xe1dfd7};const mats={};Object.entries(colors).forEach(([k,c])=>mats[k]=new T.MeshStandardMaterial({color:c,roughness:1,metalness:0}));const cut=new T.MeshBasicMaterial({color:colors.ink});const lineMat=new T.LineBasicMaterial({color:0x777b7b,transparent:true,opacity:.24});
function box(x,y,z,w,h,d,mat='ivory',parent=scene,edge=true){let m=new T.Mesh(new T.BoxGeometry(w,h,d),typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);parent.add(m);if(edge){const l=new T.LineSegments(new T.EdgesGeometry(m.geometry),lineMat);m.add(l)}return m}
const sectionRects=[];
function section(x,y,z,w,h,d){sectionRects.push([x-w/2,y-h/2,x+w/2,y+h/2]);return box(x,y,z,w,h,d,[mats.ivory,mats.ivory,mats.paper,mats.ivory,cut,mats.ivory],scene,false)}
function unifiedSection(){
 const xs=[...new Set(sectionRects.flatMap(r=>[r[0],r[2]]))].sort((a,b)=>a-b),ys=[...new Set(sectionRects.flatMap(r=>[r[1],r[3]]))].sort((a,b)=>a-b),vertices=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;if(sectionRects.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])){const a=xs[i],b=xs[i+1],c=ys[j],d=ys[j+1],z=1.94;vertices.push(a,c,z,b,c,z,b,d,z,a,c,z,b,d,z,a,d,z)}}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const cap=new T.Mesh(geometry,cut);scene.add(cap);return cap;
}
function cylinder(x,y,z,r,h,mat='wood',parent=scene,r2=r){const m=new T.Mesh(new T.CylinderGeometry(r2,r,h,32),mats[mat]);m.position.set(x,y,z);parent.add(m);return m}
function sphere(x,y,z,r,mat='ivory',parent=scene){const m=new T.Mesh(new T.SphereGeometry(r,20,12),mats[mat]);m.position.set(x,y,z);parent.add(m);return m}
function stroke(points,color=0x707679,parent=scene){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new T.Line(g,new T.LineBasicMaterial({color}));parent.add(l);return l}
function room(){const g=new T.Group();scene.add(g);return g}
const groups={about:room(),portfolio:room(),awards:room(),other:room()};
// Refined envelope: section faces are all on z=1.9, openings behind remain real voids.
section(-4.14,.02,0,6.22,.26,3.8);section(.255,.02,0,2.57,.26,3.8);
section(4.42,-.14,0,5.5,.3,3.8);section(-4.1975,4.02,0,6.335,.36,3.8);section(4.42,3.72,0,5.5,.36,3.8);
section(-4.2125,7.46,0,6.345,.38,3.8);
// One rectangular roof aperture directly over the gallery; the passage roof is closed.
section(2.86,7.46,0,2.28,.38,3.8);
section(6.58,7.46,0,.96,.38,3.8);
section(5.05,7.46,1.425,2.10,.38,.95);
box(5.05,7.46,-1.425,2.10,.38,.95,'ivory',scene,false);
const skylightShape=new T.Shape();skylightShape.moveTo(4,-.95);skylightShape.lineTo(6.1,-.95);skylightShape.lineTo(6.1,.95);skylightShape.lineTo(4,.95);skylightShape.closePath();

section(1.67,1.77,1.72,.26,4.24,.36);section(2.88,5.585,1.72,.22,3.37,.36);section(-1.05,7.81,0,.3,1.05,3.8);
// Front jambs are cut, rather than covering glazed side walls with solid blocks.
section(-6.08,2.0,1.74,.29,3.7,.32);section(-7.23,5.735,1.74,.29,3.07,.32);
section(6.88,1.7,0,.27,3.7,3.8);section(6.88,5.585,1.74,.27,3.37,.32);
const glassMaterial=new T.MeshBasicMaterial({color:0xe3edef,transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide});
// Rectangular sloped skylight with four continuous frames and sealed curbs.
const roofOutline=[[4,-.95],[6.1,-.95],[6.1,.95],[4,.95]];
const roofHeight=z=>7.78+(.95-z)*.25;
const roofGeo=new T.ShapeGeometry(skylightShape),rp=roofGeo.attributes.position;
for(let i=0;i<rp.count;i++){const x=rp.getX(i),z=rp.getY(i);rp.setXYZ(i,x,roofHeight(z),z);}roofGeo.computeVertexNormals();
scene.add(new T.Mesh(roofGeo,glassMaterial));
function roofBeam(a,b){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const m=new T.Mesh(new T.BoxGeometry(.09,delta.length()+.09,.09),mats.ink);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());scene.add(m);}
const curbMaterial=mats.ivory.clone();curbMaterial.side=T.DoubleSide;
for(let i=0;i<roofOutline.length;i++){
 const [x1,z1]=roofOutline[i],[x2,z2]=roofOutline[(i+1)%roofOutline.length],y1=roofHeight(z1),y2=roofHeight(z2);
 roofBeam([x1,y1,z1],[x2,y2,z2]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([x1,7.65,z1,x2,7.65,z2,x2,y2-.045,z2,x1,7.65,z1,x2,y2-.045,z2,x1,y1-.045,z1],3));g.computeVertexNormals();scene.add(new T.Mesh(g,curbMaterial));
 roofBeam([x1,7.67,z1],[x2,7.67,z2]);roofBeam([x1,7.67,z1],[x1,y1,z1]);
}
roofBeam([5.05,roofHeight(-.95),-.95],[5.05,roofHeight(.95),.95]);
const windowRecords=[];
function windowFrame(parent,name,x,y,z,w,h,side=false){
 const win=new T.Group();win.name=name;win.position.set(x,y,z);if(side)win.rotation.y=Math.PI/2;parent.add(win);windowRecords.push({name,width:w,height:h});
 for(const xx of [-w/2,w/2])box(xx,0,0,.075,h+.075,.30,'ink',win,false);
 for(const yy of [-h/2,h/2])box(0,yy,0,w+.075,.075,.30,'ink',win,false);
 box(0,0,-.014,w-.06,h-.06,.015,glassMaterial,win,false);
 box(w*.15,0,.016,.033,h-.06,.06,'blue',win,false);
 box(0,-h/2-.065,.02,w+.17,.09,.26,'paper',win,false);
 box(w*.15+.045,-.1,.065,.025,.13,.035,'ink',win,false);
 return win;
}
// Solid wall pieces surround side openings. They never occupy the glazing aperture.
function sideOpening(parent,x,y0,y1,right=false){
 const h=y1-y0,cy=(y0+y1)/2;
 box(x,cy,-1.67,.27,h,.30,'ivory',parent,false);
 if(right)box(x,y0+.18,-.04,.27,.36,3.28,'ivory',parent,false);
 box(x,y1-.105,-.04,.27,.21,3.28,'ivory',parent,false);
 const openingBottom=y0+(right?.38:.045),openingTop=y1-.235;
 windowFrame(parent,'side-window',x,(openingBottom+openingTop)/2,-.04,2.96,openingTop-openingBottom,true);
}
sideOpening(groups.about,-7.23,4.2,7.27);sideOpening(groups.portfolio,-6.08,.15,3.84);sideOpening(groups.awards,6.88,3.9,7.27,true);
// Rear walls are split around actual windows; furniture does not mask their openings.
function rearWall(parent,x0,x1,y0,y1,wx,wy,ww,wh){
 const left=wx-ww/2,right=wx+ww/2,bottom=wy-wh/2,top=wy+wh/2;
 box((x0+left)/2,(y0+y1)/2,-1.84,left-x0,y1-y0,.12,'ivory',parent,false);
 box((right+x1)/2,(y0+y1)/2,-1.84,x1-right,y1-y0,.12,'ivory',parent,false);
 if(bottom>y0)box(wx,(y0+bottom)/2,-1.84,ww,bottom-y0,.12,'ivory',parent,false);
 if(y1>top)box(wx,(y1+top)/2,-1.84,ww,y1-top,.12,'ivory',parent,false);
 windowFrame(parent,'rear-window',wx,wy,-1.81,ww,wh);
}
rearWall(groups.about,-7.08,-1.1,4.2,7.27,-5.75,5.79,1.15,2.65);
rearWall(groups.portfolio,-5.93,-1.1,.15,3.84,-5.18,2.0,1.25,3.15);
rearWall(groups.awards,3.0,6.74,3.9,7.27,6.25,5.77,.75,2.54);
box(4.26,1.7,-1.84,5.3,3.35,.12,'dark',groups.other,false);
// Ground doorway and upper gallery wall with a full-height passage opening.
box(1.67,1.82,-1.74,.26,3.84,.30,'ivory',scene,false);
box(1.67,3.50,-.15,.26,.68,3.0,'ivory',scene,false);
box(2.88,5.585,-1.60,.22,3.37,.48,'ivory',scene,false);
box(2.88,7.08,0,.22,.38,3.0,'ivory',scene,false);
// Upper passage floor: 1.08 m clear between atrium and gallery.
box(2.25,4.14,0,1.04,.12,3.35,'paper',scene,false);
// Thin internal skirtings and a quiet vertical reveal give the rooms finished edges.
for(const [g,x,w,y] of [[groups.about,-4.105,5.9,4.27],[groups.portfolio,-3.53,4.75,.23],[groups.awards,4.26,4.9,3.97],[groups.other,4.26,4.9,.08]])box(x,y,-1.755,w,.09,.035,g===groups.other?'ink':'paper',g,false);
// Glazed double-height atrium and skylight: a generous clear opening above the stairs.
windowFrame(scene,'atrium-window',.29,4.23,-2.84,2.40,7.64);
section(-1.05,8.13,0,.34,.42,3.8);section(1.67,8.13,0,.34,.42,3.8);
box(.31,8.23,0,2.38,.025,3.42,glassMaterial,scene,false);
for(const z of [-1.72,1.77])box(.31,8.255,z,2.47,.05,.065,'ink',scene,false);
for(const x of [-.91,1.53])box(x,8.235,0,.065,.12,3.51,'ink',scene,false);
box(.31,8.235,-.02,.035,.055,3.48,'blue',scene,false);
// Two flights: 1.10 m clear width, 0.26 m going, 0.184 m rise.
// The 1.20 m deep turning landing is behind the room envelope.
const stairGroup=new T.Group();stairGroup.name='switchback-stair';scene.add(stairGroup);
function rod(a,b,r=.021,mat='blue',parent=stairGroup){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const m=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),10),mats[mat]);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(m);return m}
const riser=4.05/22,run=.26,midY=.15+11*riser;
function flight(x,z0,dir,y0){
 for(let i=0;i<11;i++){const z=z0+dir*run*(i+.5),y=y0+riser*(i+1);
 box(x,y-.04,z,1.16,.08,run,'wood',stairGroup,false);
 box(x,y-riser/2-.025,z-dir*run/2,1.12,riser-.025,.025,'ivory',stairGroup,false);
 for(const xx of [x-.56,x+.56])if(i%2===0)rod([xx,y,z],[xx,y+.9,z],.014,'blue');}
 for(const xx of [x-.56,x+.56]){rod([xx,y0+.93,z0],[xx,y0+11*riser+.93,z0+dir*2.86],.024,'wood');rod([xx,y0-.04,z0],[xx,y0+11*riser-.04,z0+dir*2.86],.04,'blue');}
}
flight(.91,1.30,-1,.15);flight(-.38,-1.56,1,midY);
box(.265,midY-.06,-2.16,2.45,.12,1.20,'wood',stairGroup,false);
for(const x of [-.93,-.33,.27,.87,1.47])rod([x,midY,-2.75],[x,midY+.92,-2.75],.015,'blue');
rod([-.94,midY+.92,-2.75],[1.48,midY+.92,-2.75],.024,'wood');
box(.79,4.14,1.86,3.70,.12,1.12,'wood',stairGroup,false);
for(const x of [-.94,-.34,.26,.86,1.46,2.06,2.63])rod([x,4.2,2.39],[x,5.25,2.39],.015,'blue');
rod([-.94,5.25,2.39],[2.65,5.25,2.39],.024,'wood');

// The gallery corridor has a continuous guard along its open west edge.
// Stop at the upper landing connection so the route remains unobstructed.
function guardSegment(x1,z1,x2,z2){
 const length=Math.hypot(x2-x1,z2-z1),count=Math.ceil(length/.28);
 for(let i=0;i<=count;i++){const t=i/count,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;rod([x,4.20,z],[x,5.25,z],.017,'blue',scene);}
 rod([x1,5.25,z1],[x2,5.25,z2],.027,'wood',scene);
 rod([x1,4.27,z1],[x2,4.27,z2],.018,'blue',scene);
}
guardSegment(1.76,-1.61,1.76,1.29);
guardSegment(1.76,-1.61,2.75,-1.61);
guardSegment(2.65,1.69,2.65,2.39);
// Two full-width, equal-height steps link the upper passage to the lower gallery.
box(2.96,4.125,.60,.36,.15,1.16,'wood',scene,false);
box(3.31,3.975,.60,.34,.15,1.16,'wood',scene,false);

// Extend the atrium back to keep the turning landing inside its envelope.
box(.28,midY-.14,-2.20,2.55,.16,1.28,'ivory',scene,false);
// Small repeating slats, limited to one wall in each upper room.
for(let i=0;i<10;i++){box(-1.65+i*.038,5.76,-1.59,.017,3.02,.11,'wood',groups.about,false);box(3.25+i*.038,5.6,-1.59,.018,3.24,.1,'wood',groups.awards,false)}
function softBox(x,y,z,w,h,d,mat='ivory',parent=scene,r=.045){
 r=Math.min(r,w/3,h/3,d/3);const geo=new T.BoxGeometry(w,h,d,6,6,6),p=geo.attributes.position,n=geo.attributes.normal;
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i),q=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r)),normal=v.clone().sub(q).normalize();v.copy(q).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z)}p.needsUpdate=true;n.needsUpdate=true;const mesh=new T.Mesh(geo,mats[mat]);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
// Bedroom: simplified bed, pillows, artwork, lamp.
const a=groups.about;box(-3.64,4.33,-.18,2.95,.28,2.4,'wood',a);softBox(-3.64,4.54,-.18,2.89,.27,2.34,'paper',a,.10);softBox(-3.64,4.83,-1.43,3.18,1.22,.16,'wood',a,.045);softBox(-3.64,4.735,.25,2.91,.15,1.5,'ivory',a,.065);softBox(-3.27,4.821,.3,.67,.025,1.53,'blue',a,.009);softBox(-3.27,4.68,1.055,.67,.30,.024,'blue',a,.009);softBox(-4.27,4.82,-.96,.93,.22,.56,'paper',a,.095);softBox(-3.15,4.82,-.96,.93,.22,.56,'paper',a,.095);softBox(-5.6,4.54,-.76,1.0,.7,.71,'wood',a,.025);box(-5.6,4.52,-.392,.86,.012,.012,'soft',a,false);box(-5.6,4.66,-.388,.14,.019,.026,'ink',a,false);cylinder(-5.91,5,-.76,.045,.25,'ink',a);const bedsideBulb=sphere(-5.91,5.23,-.76,.19,'paper',a);
function picture(x,y,z,w,h,parent,abstract=false){box(x,y,z,w,h,.08,'ink',parent);box(x,y,z+.048,w-.075,h-.075,.021,'paper',parent);if(abstract){box(x-.1,y+.11,z+.07,w*.27,h*.54,.015,'blue',parent);box(x+.19,y-.15,z+.073,w*.28,h*.37,.015,'wood',parent);}else for(let j=0;j<6;j++)box(x,y+.22-j*.09,z+.065,w*.55,.009,.006,'soft',parent,false)}
picture(-4.05,6.25,-1.68,1.16,1.45,a,true);
// Study: one desk, architectural model and a bookshelf.
const p=groups.portfolio;box(-3.66,.18,.04,4.26,.025,2.9,'soft',p);softBox(-3.95,1.2,.58,3.7,.14,1.24,'wood',p,.065);cylinder(-5.05,.65,.58,.24,1.06,'wood',p);cylinder(-2.85,.65,.58,.24,1.06,'wood',p);// Chair on the near side, facing the computer, with the back toward the viewer.
softBox(-3.16,.83,1.47,.87,.15,.78,'blue',p,.06);
softBox(-3.16,1.28,1.79,.87,.9,.15,'blue',p,.065);
cylinder(-3.16,.48,1.47,.06,.55,'ink',p);
box(-3.16,.2,1.47,.82,.06,.09,'ink',p);box(-3.16,.2,1.47,.09,.06,.72,'ink',p);
// The lamp base rests directly on the 1.27 m desktop surface.
cylinder(-5.57,1.295,.43,.13,.05,'ink',p);
cylinder(-5.57,1.69,.43,.022,.74,'ink',p);box(-5.28,2.06,.43,.63,.04,.09,'ink',p);
// Desktop computer: screen, stand, keyboard and mouse all have physical support.
box(-3.16,1.285,.20,.48,.03,.32,'ink',p,false);box(-3.16,1.46,.20,.07,.34,.08,'blue',p,false);
softBox(-3.16,1.88,.16,1.15,.72,.075,'ink',p,.025);box(-3.16,1.88,.202,1.06,.63,.012,'blue',p,false);
box(-3.30,1.88,.212,.39,.32,.009,'paper',p,false);box(-2.99,1.78,.214,.27,.13,.009,'wood',p,false);
box(-3.16,1.29,.71,.84,.035,.29,'ivory',p,false);for(let i=0;i<3;i++)box(-3.16,1.312,.63+i*.07,.72,.006,.012,'soft',p,false);
softBox(-2.56,1.30,.73,.12,.05,.19,'paper',p,.02);
// A working architectural maquette, on a cutting mat rather than a row of books.
box(-4.65,1.279,.65,1.55,.014,.92,'blue',p,false);
const miniature=new T.Group();miniature.position.set(-4.65,1.295,.65);p.add(miniature);
box(0,.015,0,1.21,.03,.72,'paper',miniature,false);
box(-.34,.15,-.12,.35,.27,.39,'ivory',miniature,false);box(.29,.10,-.16,.32,.17,.30,'wood',miniature,false);
for(const x of [-.11,.10,.31]){box(x,.23,.15,.025,.43,.025,'paper',miniature,false);box(x,.23,-.15,.025,.43,.025,'paper',miniature,false);}
box(.10,.45,0,.53,.035,.39,'paper',miniature,false);box(.10,.24,0,.53,.025,.39,'paper',miniature,false);
// A ruler and spare model strips beside the maquette.
box(-4.30,1.30,1.08,.62,.018,.055,'wood',p,false);for(let i=0;i<3;i++)box(-5.27+i*.05,1.30,.67,.026,.022,.48-i*.07,'paper',p,false);
// Asymmetric open shelving: alternating spans, two closed volumes and open bays.
const shelf=new T.Group();shelf.name='study-bookcase';p.add(shelf);
for(const [x,y,w] of [[-2.85,.71,2.85],[-3.15,1.39,2.25],[-2.65,2.09,2.65],[-2.91,2.79,2.85]])box(x,y,-1.47,w,.065,.50,'wood',shelf,false);
for(const [x,y,h] of [[-4.24,1.75,2.15],[-1.52,1.76,2.12],[-3.40,1.05,.61],[-2.60,1.74,.64],[-3.10,2.44,.64]])box(x,y,-1.47,.06,h,.50,'wood',shelf,false);
box(-3.68,.39,-1.46,1.14,.56,.58,'wood',shelf,false);box(-1.96,1.04,-1.46,.84,.59,.51,'blue',shelf,false);
for(let i=0;i<5;i++)box(-3.9+i*.13,1.58+(i%2)*.045,-1.44,.08,.31+(i%2)*.09,.24,i%2?'paper':'blue',shelf,false);
for(let i=0;i<4;i++)box(-2.72+i*.14,2.29+(i%3)*.03,-1.44,.09,.33+(i%3)*.06,.24,i%2?'wood':'paper',shelf,false);
box(-3.73,2.16,-1.44,.62,.065,.28,'paper',shelf,false);box(-3.77,2.22,-1.44,.49,.055,.25,'blue',shelf,false);
// Awards: two sculptural trophies and three framed documents.
const aw=groups.awards,awStart=aw.children.length;box(4.1,4.12,-1.25,3.55,.59,.78,'wood',aw);box(4.1,3.91,-1.25,3.36,.14,.67,'ink',aw,false);for(let j=1;j<4;j++)box(2.325+j*.8875,4.18,-.849,.011,.43,.016,'soft',aw,false);box(4.08,5.26,-1.41,3.55,.06,.6,'paper',aw);box(4.08,6.53,-1.41,3.55,.06,.6,'paper',aw);for(let i=0;i<3;i++)picture(3.06+i*1.08,5.9,-1.62,.8,1.04,aw);
box(3.23,6.61,-1.32,.48,.11,.34,'ink',aw);const trophy=new T.Mesh(new T.ConeGeometry(.2,.69,4),mats.wood);trophy.position.set(3.23,7,-1.32);trophy.rotation.z=-.15;aw.add(trophy);box(4.99,6.61,-1.32,.46,.11,.33,'ink',aw);cylinder(4.99,6.87,-1.32,.041,.43,'wood',aw);const hoop=new T.Mesh(new T.TorusGeometry(.2,.04,10,40),mats.wood);hoop.position.set(4.99,7.14,-1.32);aw.add(hoop);
// Keep display objects inside the recessed gallery and below the ceiling.
for(const m of aw.children.slice(awStart)){if(m.name.includes('window'))continue;if(m.position.z> -1.75){m.position.x=3.44+(m.position.x-2.30)*.70;m.scale.x*=.70;if(m.position.y>5)m.position.y-=.36;}}
// Cinema: screen, planar image, low lounge seating.
const o=groups.other;box(4.15,2.13,-1.59,3.66,2.13,.13,'ink',o);box(4.15,2.13,-1.51,3.44,1.92,.026,'blue',o);const screenShape=box(4.03,2.18,-1.48,1.7,.63,.02,'soft',o);const screenShape2=box(4.71,1.79,-1.45,1.27,.61,.02,'dark',o);box(4.21,.56,-1.34,4.57,.42,.65,'ink',o);box(4.32,.1,.26,4.35,.02,2.55,'soft',o);softBox(4.73,.33,1,2.8,.24,.82,'ivory',o,.055);for(let k=0;k<3;k++)softBox(3.82+k*.9,.53,.96,.86,.20,.69,'paper',o,.065);softBox(4.73,.79,1.34,2.83,.60,.19,'paper',o,.07);softBox(6.19,.56,.58,.24,.7,1.65,'paper',o,.055);softBox(5.84,.39,.07,.66,.37,.92,'ivory',o,.055);softBox(5.84,.61,.07,.66,.13,.92,'paper',o,.055);softBox(3.24,.57,1.0,.23,.71,.96,'paper',o,.065);cylinder(4.35,.48,-.08,.6,.09,'ink',o);cylinder(4.35,.28,-.08,.19,.32,'ink',o);cylinder(4.51,.57,-.08,.092,.1,'paper',o);// Wall sconce: backplate meets the inner face of the right wall.
box(6.72,2.15,.18,.06,.50,.28,'ink',o,false);
box(6.62,2.15,.18,.18,.07,.09,'wood',o,false);
const cinemaBulb=softBox(6.51,2.15,.18,.18,.38,.24,'paper',o,.035);
// One sparse linework plant; no photoreal vegetation.
function plant(x,y,z,s=1){
 cylinder(x,y+.18*s,z,.20*s,.35*s,'ivory',scene,.23*s);
 rod([x,y+.34*s,z],[x+.05*s,y+1.62*s,z],.012*s,'wood',scene);
 for(let i=0;i<7;i++){const dir=i%2?1:-1,h=.61+i*.145,dx=dir*(.15+(i%3)*.055)*s;
 rod([x+.02*s,y+h*s,z],[x+dx,y+(h+.19)*s,z+(i%2?.07:-.06)*s],.007*s,'wood',scene);
 for(let j=0;j<3;j++){const leaf=new T.Mesh(new T.SphereGeometry(.045*s,8,6),mats.soft);leaf.scale.set(1.6,.60,.48);leaf.rotation.z=dir*.6;leaf.position.set(x+dx+dir*j*.031*s,y+(h+.19+j*.029)*s,z+(i%2?.07:-.06)*s);scene.add(leaf)}}
}
plant(-1.42,4.2,-.92,.72);plant(7.34,-.11,-.85,1.35);
// Terraces step out of the regular silhouette with restrained planters.
section(-8.05,4.08,0,1.65,.24,3.8);section(-7.995,.035,0,2.85,.17,3.8);
for(const z of [-1.75,1.76]){rod([-8.85,4.2,z],[-8.85,5.2,z],.018,'blue',scene);rod([-8.85,5.2,z],[-7.42,5.2,z],.022,'wood',scene);}
for(const z of [-1.75,-.9,0,.9,1.76])rod([-8.85,4.2,z],[-8.85,5.2,z],.015,'blue',scene);
rod([-8.85,5.2,-1.75],[-8.85,5.2,1.76],.022,'wood',scene);
plant(-8.37,4.2,-1.30,.65);plant(-8.53,4.2,-.53,.43);plant(-8.24,.15,-1.26,.74);
box(-8.66,-.055,.10,.38,.11,1.30,'wood',scene,false);
// A tree under the upper landing; foliage stays out of the lower flight.
cylinder(-.54,.26,.50,.34,.22,'ivory',scene,.38);
rod([-.54,.37,.50],[-.61,2.70,.48],.038,'wood',scene);
for(let i=0;i<6;i++){const dx=(i%2?1:-1)*(.21+(i%3)*.07),y=1.5+i*.20;
rod([-.58,y-.28,.49],[-.58+dx,y,.45],.014,'wood',scene);
const leaf=sphere(-.58+dx,y,.45,.26,'soft');leaf.scale.set(.88,.68,.65);}
// A small guest book beside the tree, clear of the stair approach.
box(-.63,.65,1.38,.44,.07,.40,'wood',scene,false);box(-.63,.35,1.38,.08,.60,.08,'ink',scene,false);
box(-.63,.70,1.38,.35,.035,.27,'paper',scene,false);box(-.63,.723,1.38,.012,.008,.24,'blue',scene,false);
// Outdoor chair, facing the section; all four legs reach the terrace deck.
const chair=new T.Group();chair.name='terrace-contact-chair';a.add(chair);chair.position.set(-8.10,4.20,.62);
for(const x of [-.27,.27])for(const z of [-.27,.27])cylinder(x,.22,z,.023,.44,'ink',chair);
for(let i=0;i<5;i++)box(-.26+i*.13,.46,0,.105,.055,.64,'wood',chair,false);
for(const x of [-.30,.30]){box(x,.68,-.25,.035,.47,.035,'ink',chair,false);box(x,.68,0,.055,.05,.66,'wood',chair,false);}
for(let i=0;i<4;i++)box(0,.62+i*.10,-.30,.64,.072,.04,'wood',chair,false);
// Three aligned posts carry the outer terrace edge down to the lower platform.
for(const z of [-1.50,0,1.50]){
 box(-8.75,2.04,z,.14,3.84,.14,'ink',scene,false);
 box(-8.75,.15,z,.23,.06,.23,'ink',scene,false);
 box(-8.75,3.93,z,.23,.06,.23,'ink',scene,false);
}
// Earth band and foundations, not a floating platform.
box(-.725,-.56,-.02,17.45,.90,3.8,'soil',scene,false);
box(-7.64,-.11,-.02,.72,.015,3.8,'ink',scene,false);box(7.59,-.11,-.02,.82,.015,3.8,'ink',scene,false);
for(const x of [-6.08,1.67,6.87]){section(x,-.47,0,.26,.72,3.8);section(x,-.87,0,.66,.2,3.8)}
unifiedSection();
let seed=43;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const pts=[];for(let i=0;i<600;i++)pts.push((rand()-.5)*16,-.16-rand()*.81,1.895);const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(pts,3));scene.add(new T.Points(pg,new T.PointsMaterial({size:.014,color:0xa9aaa3,sizeAttenuation:true})));
// Small bedside frame: real photos can be selected locally without uploading.
box(-5.35,5.16,-.56,.41,.54,.055,'ink',a);box(-5.35,5.16,-.526,.35,.48,.015,'paper',a);
const portraitMaterial=new T.MeshBasicMaterial({color:0xc4c9ca});
const portrait=new T.Mesh(new T.PlaneGeometry(.31,.44),portraitMaterial);portrait.position.set(-5.35,5.16,-.512);a.add(portrait);
applyPortrait=async img=>{const texture=new T.Texture(img);texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;if(portraitMaterial.map)portraitMaterial.map.dispose();portraitMaterial.map=texture;portraitMaterial.color.set(0xffffff);portraitMaterial.needsUpdate=true;const aspect=img.naturalWidth/img.naturalHeight,frameAspect=.31/.44;portrait.scale.set(aspect<frameAspect?aspect/frameAspect:1,aspect>frameAspect?frameAspect/aspect:1,1)};
loadPortrait(applyPortrait);
const rooms={atrium:{center:[.45,3.25,0],w:4.5,h:6.4},about:{center:[-4.875,5.7,0],w:8.05,h:3.12},portfolio:{center:[-4.55,2,0],w:7.4,h:3.5},awards:{center:[4.9,5.6,0],w:4.3,h:3.22},other:{center:[4.18,1.69,0],w:5.19,h:3.35}};
const targets=[],furniture=[];const hitMaterial=new T.MeshBasicMaterial({visible:false});
Object.entries(rooms).forEach(([id,r])=>{const m=box(r.center[0],r.center[1],1.95,r.w,r.h,.04,hitMaterial,scene,false);m.userData.room=id;if(id!=='atrium')targets.push(m)});
function hotspot(room,key,x,y,z,w,h,d){const m=box(x,y,z,w,h,d,hitMaterial,scene,false);m.userData={room,key};furniture.push(m)}
hotspot('about','aboutArt',-4.05,6.25,-1.58,1.20,1.50,.20);hotspot('about','contact',-8.10,4.72,.62,.77,1.10,.80);hotspot('portfolio','computer',-3.16,1.88,.20,1.18,.76,.18);
hotspot('about','photo',-5.35,5.16,-.50,.49,.62,.14);hotspot('about','lamp',-5.91,5.13,-.76,.45,.65,.45);
hotspot('portfolio','model',-4.65,1.55,.65,1.3,.60,.78);hotspot('portfolio','books',-2.84,1.8,-1.3,2.85,2.35,.6);
hotspot('other','screen',4.15,2.13,-1.48,3.5,1.94,.15);hotspot('other','cinemaLamp',6.50,2.15,.18,.36,.54,.40);
hotspot('awards','trophy',4.72,6.59,-1.27,2.1,.94,.6);hotspot('awards','certificates',4.8,5.54,-1.53,2.6,1.08,.25);hotspot('atrium','guestbook',-.63,.76,1.38,.65,.55,.60);
const bedsideLight=new T.PointLight(0xffdeb0,0,3,2);bedsideLight.position.set(-5.91,5.27,-.6);scene.add(bedsideLight);
const cinemaLight=new T.PointLight(0xffdeb0,0,4,2);cinemaLight.position.set(6.28,2.15,.18);scene.add(cinemaLight);
bedsideBulb.material=bedsideBulb.material.clone();cinemaBulb.material=cinemaBulb.material.clone();
let screenIndex=0;const states={lamp:false,cinemaLamp:false};
interact=key=>{
 const hint=document.querySelector('#interaction-hint');
 if(key==='contact'){document.querySelector('#contact-dialog').showModal();return}
 if(key==='aboutArt'){fillDirectory();setDirectory(true);return}
 if(key==='guestbook'){openGuestbook();return}
 if(key==='photo'){photoDialog.showModal();return}
 if(key==='lamp'||key==='cinemaLamp'){states[key]=!states[key];const on=states[key],bulb=key==='lamp'?bedsideBulb:cinemaBulb,light=key==='lamp'?bedsideLight:cinemaLight;bulb.material.emissive.set(on?0xffc785:0x000000);bulb.material.emissiveIntensity=on?.5:0;light.intensity=on?3:0;hint.textContent=(key==='lamp'?'床头灯':'右墙壁灯')+(on?'已打开':'已关闭');return}
 if(key==='screen'){screenIndex=(screenIndex+1)%3;screenShape.position.x=4.03+[0,.4,-.4][screenIndex];screenShape2.position.y=1.79+[0,.4,.2][screenIndex];hint.textContent='空间构成 '+(screenIndex+1)+' / 3 · 再次点击屏幕切换';return}
 if(key==='trophy'){trophy.rotation.y+=Math.PI/4;hoop.rotation.y+=Math.PI/6}
 if(key==='model'){modelTurn();hint.textContent='模型已转动 · 再次点击换个方向';return}
 fillDirectory();setDirectory(true);
};
function modelTurn(){miniature.rotation.y+=Math.PI/4}
let hover=null,hoverObject=null,mouse=new T.Vector2(),pointer=new T.Vector2(0,0),view={x:-.725,y:3.67,yaw:0,pitch:0,distance:29},desired={...view},baseDistance=29,roomDistance=14,zoomFactor=1;
setHover=id=>{hover=id;document.querySelectorAll('.room-label').forEach(el=>el.classList.toggle('active',el.id==='label-'+id));host.style.cursor=id?'pointer':active?'grab':'default'};
const atriumEntry=box(.1,1.0,2.01,1.35,1.60,.04,hitMaterial,scene,false);atriumEntry.userData.room='atrium';targets.push(atriumEntry);
const ray=new T.Raycaster();
function hitAt(e){const rect=host.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);pointer.copy(mouse);ray.setFromCamera(mouse,camera);return ray.intersectObjects(active?furniture.filter(m=>m.userData.room===active):targets)[0]?.object}
function hoverAt(e){const hit=hitAt(e);if(!active){setHover(hit?.userData.room||null);return}hoverObject=hit?.userData.key||null;host.style.cursor=hoverObject?'pointer':'grab';document.querySelectorAll('[data-object]').forEach(b=>b.classList.toggle('active',b.dataset.object===hoverObject))}
let drag=null;
host.addEventListener('pointerdown',e=>{if(e.button!==0)return;host.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};host.setPointerCapture(e.pointerId)});
host.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;drag.lastX=e.clientX;drag.lastY=e.clientY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;if(active&&drag.moved){adjustView(-dx*.004,dy*.003,0);host.style.cursor='grabbing';return}}hoverAt(e)});
host.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=!drag.moved;drag=null;if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);if(click){const hit=hitAt(e);if(active&&hit)interact(hit.userData.key);else if(hit)selectRoom(hit.userData.room)}hoverAt(e)});
host.addEventListener('pointercancel',()=>{drag=null});host.addEventListener('lostpointercapture',()=>{drag=null});host.addEventListener('pointerleave',()=>{if(!drag){pointer.set(0,0);setHover(null);hoverObject=null}});
host.addEventListener('wheel',e=>{if(!active)return;e.preventDefault();adjustView(0,0,-Math.sign(e.deltaY)*.055)},{passive:false});
host.addEventListener('keydown',e=>{if(!active)return;const keys={ArrowLeft:[-.07,0,0],ArrowRight:[.07,0,0],ArrowUp:[0,.04,0],ArrowDown:[0,-.04,0],'+':[0,0,.1],'=':[0,0,.1],'-':[0,0,-.1]};if(keys[e.key]){e.preventDefault();adjustView(...keys[e.key])}});
function fitDistance(id){const r=rooms[id],tangent=Math.tan(T.MathUtils.degToRad(camera.fov/2));return Math.max((r.h/2+.9)/tangent,(r.w/2+.5)/(tangent*camera.aspect))+1.9}
focusRoom=id=>{setHover(null);zoomFactor=1;roomDistance=fitDistance(id);const r=rooms[id];desired={x:r.center[0],y:r.center[1],yaw:0,pitch:0,distance:roomDistance}};
returnView=()=>{desired={x:-.725,y:3.67,yaw:0,pitch:0,distance:baseDistance};setHover(null)};
adjustView=(yaw,pitch,zoom)=>{if(!active)return;desired.yaw=T.MathUtils.clamp(desired.yaw+yaw,-.32,.32);desired.pitch=T.MathUtils.clamp(desired.pitch+pitch,-.12,.23);zoomFactor=T.MathUtils.clamp(zoomFactor+zoom,.82,1.42);desired.distance=roomDistance/zoomFactor};resetCamera=()=>{if(active)focusRoom(active)};
let firstFit=true;
function resize(){
 const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
 renderer.setSize(w,h);camera.aspect=w/h;
 const tangent=Math.tan(T.MathUtils.degToRad(camera.fov/2));
 // Reserve equal text gutters; include the terrace and foundation in the centre.
 let gutter=20;
 if(w>700){const bounds=host.getBoundingClientRect();gutter=w*.16;
 document.querySelectorAll('.room-label.left').forEach(el=>{gutter=Math.max(gutter,el.getBoundingClientRect().right-bounds.left+30)});
 document.querySelectorAll('.room-label.right').forEach(el=>{gutter=Math.max(gutter,bounds.right-el.getBoundingClientRect().left+30)});}
 const usable=Math.max(w*.25,w-2*gutter);
 baseDistance=Math.max(5.45/tangent,8.95/(tangent*camera.aspect*(usable/w)))+2.45;
 camera.updateProjectionMatrix();
 if(active){roomDistance=fitDistance(active);desired.distance=roomDistance/zoomFactor;}
 else{desired.x=-.725;desired.distance=baseDistance;if(firstFit){view.x=desired.x;view.distance=baseDistance;}}
 firstFit=false;
}
new ResizeObserver(resize).observe(host);window.addEventListener('resize',resize);resize();
let previous=performance.now();function render(now){const dt=Math.min((now-previous)/1000,.05);previous=now;const t=motion?1-Math.exp(-dt*7):1;for(const k of Object.keys(view))view[k]+=(desired[k]-view[k])*t;const dx=motion&&!active?pointer.x*.10:0;const horizontal=view.distance*Math.cos(view.pitch);camera.position.set(view.x+Math.sin(view.yaw)*horizontal+dx,view.y+Math.sin(view.pitch)*view.distance,Math.cos(view.yaw)*horizontal);camera.lookAt(view.x,view.y,0);renderer.render(scene,camera);requestAnimationFrame(render)}requestAnimationFrame(render);document.querySelector('#loading').hidden=true;
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#fallback').hidden=false;host.hidden=true});
}catch(error){console.error('3D scene unavailable',error);document.querySelector('#canvas').hidden=true;document.querySelector('#fallback').hidden=false;document.querySelector('#loading').hidden=true;motionButton.hidden=true;}

// Same-origin bridge: existing project slugs are supplied by the Next page.
let linkedProjects=[];
const originalFillDirectory=fillDirectory;
function kind(project){return categoryBySlug[project.slug] || (project.category.some(c=>/graphic|visual|平面|视觉/i.test(c))?'graphic':'spatial');}
fillDirectory=function(){
 originalFillDirectory();
 if(active==='portfolio'||active==='other'){
 const container=document.querySelector('#detail-body');container.replaceChildren();
 const items=linkedProjects.filter(p=>kind(p)===(active==='portfolio'?'spatial':'graphic')).sort((a,b)=>a.order-b.order);
 if(!items.length){const text=document.createElement('p');text.textContent=language==='en'?'No projects in this category yet.':'此分类暂未添加项目。';text.dataset.noTranslate='';container.append(text);return;}
 const list=document.createElement('ul');list.dataset.noTranslate='';
 for(const project of items){const li=document.createElement('li'),link=document.createElement('a'),meta=document.createElement('small');link.textContent=project.title[language]||project.title.zh;link.href='/projects/'+encodeURIComponent(project.slug)+'?lang='+language;link.target='_top';link.onclick=e=>{if(parent!==window){e.preventDefault();parent.postMessage({type:'house-project',slug:project.slug,language},location.origin);}};meta.textContent=project.year;li.append(link,meta);list.append(li);}container.append(list);
 }
 renderProfile(active, document.querySelector('#detail-body'), language);
 if(active==='about'&&profile.resumeUrl){const old=document.querySelector('.resume-download');if(old){const a=document.createElement('a');a.className='resume-download';a.textContent=language==='en'?'Download CV PDF':'下载简历 PDF';a.href=profile.resumeUrl;a.download='Zoya-Yin-CV.pdf';old.replaceWith(a);}}
};
window.addEventListener('house-language-change',()=>{if(active)fillDirectory();requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||!event.data)return;
 if(event.data.type==='house-ping'){parent.postMessage({type:'house-ready'},location.origin);return;}
 if(event.data.type!=='house-init'||!Array.isArray(event.data.projects))return;
 linkedProjects=event.data.projects.filter(p=>typeof p.slug==='string'&&p.title&&Array.isArray(p.category));setLanguage(event.data.language);if(active)fillDirectory();
});
if(parent!==window)parent.postMessage({type:'house-ready'},location.origin);
if(profile.email||profile.socials.length){const dl=document.querySelector('#contact-dialog dl');dl.replaceChildren();
 const add=(label,text,href)=>{const dt=document.createElement('dt'),dd=document.createElement('dd'),a=document.createElement('a');dt.textContent=label;a.textContent=text;a.href=href;a.target='_blank';a.rel='noopener noreferrer';dd.append(a);dl.append(dt,dd);};
 if(profile.email)add('邮箱',profile.email,'mailto:'+profile.email);
 for(const social of profile.socials)if(/^https?:\/\//.test(social.url))add(social.label,social.account,social.url);
}
