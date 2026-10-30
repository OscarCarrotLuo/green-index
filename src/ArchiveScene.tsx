import {useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer} from '@react-three/drei';
import * as THREE from 'three';
import {cities,satelliteThumbnail,type City} from './data';

const FILES=cities.length,WIDTH=2.12,HEIGHT=2.9;
const wrap=(value:number)=>THREE.MathUtils.euclideanModulo(value+FILES/2,FILES)-FILES/2;
type Props={selected:number;dragPosition:number;dragging:boolean;score:string;metricLabel?:string;metricUnit?:string;activeHeader?:string;onChoose:(index:number)=>void;onReady:()=>void};

// One physical rack, viewed through one camera. The side files keep a shared
// lean; the chosen file leaves the rack and turns to face the viewer.
function makeOutline(){
  const x=-WIDTH/2,y=-HEIGHT/2,r=.11,w=WIDTH,h=HEIGHT;
  const shape=new THREE.Shape();
  shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
  shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
  shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
  return shape;
}

function drawFile(city:City,active:boolean,score:string,image?:HTMLImageElement,metricLabel='Green Transition Index',metricUnit='/ 100',activeHeader?:string){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=700;
  const c=canvas.getContext('2d')!;c.scale(2/3,2/3);
  c.beginPath();c.roundRect(3,3,762,1044,39);c.clip();
  const glass=c.createLinearGradient(0,0,768,1050);
  if(active){glass.addColorStop(0,'rgba(178,250,185,.63)');glass.addColorStop(.35,'rgba(40,153,76,.68)');glass.addColorStop(1,'rgba(15,65,38,.91)')}
  else{glass.addColorStop(0,'rgba(237,248,240,.36)');glass.addColorStop(.3,'rgba(218,234,222,.14)');glass.addColorStop(.72,'rgba(220,239,225,.11)');glass.addColorStop(1,'rgba(237,250,241,.3)')}
  c.fillStyle=glass;c.fillRect(0,0,768,1050);
  const shine=c.createLinearGradient(0,0,768,380);
  shine.addColorStop(0,'rgba(255,255,255,.28)');shine.addColorStop(.32,'rgba(255,255,255,0)');shine.addColorStop(.72,'rgba(255,255,255,.03)');shine.addColorStop(1,'rgba(255,255,255,.17)');
  c.fillStyle=shine;c.fillRect(0,0,768,1050);
  c.strokeStyle=active?'rgba(228,255,231,.92)':'rgba(244,255,248,.75)';c.lineWidth=4;
  c.beginPath();c.roundRect(6,6,756,1038,37);c.stroke();
  c.strokeStyle='rgba(245,255,248,.22)';c.lineWidth=1.5;c.beginPath();c.roundRect(17,17,734,1016,31);c.stroke();
  c.fillStyle=active?'#eaffdf':'#edf4ef';c.font='400 25px Manrope, sans-serif';c.fillText(active&&activeHeader?activeHeader:`MSA ${city.msaCode}`,62,89);
  // Draw the launch icon in the same stroke vocabulary as the DOM controls.
  c.strokeStyle=c.fillStyle;c.lineWidth=5;c.beginPath();c.moveTo(666,69);c.lineTo(701,69);c.lineTo(701,104);c.moveTo(701,69);c.lineTo(663,107);c.stroke();
  if(image){
    c.save();c.globalAlpha=active?.5:.19;c.filter=active?'grayscale(0.7) contrast(1.1)':'grayscale(1) brightness(1.7)';
    c.drawImage(image,0,170,768,390);c.restore();
  }
  c.save();c.strokeStyle=active?'rgba(219,255,223,.3)':'rgba(237,255,242,.18)';c.lineWidth=2;
  c.beginPath();c.arc(384,355,62,0,Math.PI*2);c.moveTo(384,270);c.lineTo(384,440);c.moveTo(299,355);c.lineTo(469,355);c.stroke();c.restore();
  c.fillStyle=active?'rgba(235,255,231,.72)':'rgba(243,255,245,.24)';c.font='500 104px Manrope, sans-serif';c.textAlign='right';c.fillText(city.short,708,535);c.textAlign='left';
  c.fillStyle=active?'#f1ffea':'rgba(240,246,241,.8)';let fontSize=64;c.font=`400 ${fontSize}px Manrope, sans-serif`;while(c.measureText(city.name).width>648&&fontSize>32){fontSize-=2;c.font=`400 ${fontSize}px Manrope, sans-serif`}c.fillText(city.name,60,active?660:925);
  c.fillStyle=active?'#c6e9bd':'rgba(211,223,213,.65)';c.font='400 22px Manrope, sans-serif';c.fillText('CITY ARCHIVE',62,active?711:977);
  if(!active)return canvas;
  c.strokeStyle='rgba(230,255,232,.24)';c.lineWidth=2;c.beginPath();c.moveTo(62,785);c.lineTo(706,785);c.stroke();
  c.fillStyle=active?'#d1ecc7':'#d7e2d9';c.font='400 24px Manrope, sans-serif';c.fillText(metricLabel,62,845);
  c.fillStyle=active?'#efffe8':'#edf5ee';c.font='400 68px Manrope, sans-serif';c.fillText(active?score:'—',62,948);
  const scoreWidth=c.measureText(score).width;
  c.font='400 22px Manrope, sans-serif';c.fillStyle=active?'#c6e9bd':'#c9d8cd';c.fillText(metricUnit,78+scoreWidth,944);
  return canvas;
}

function useFileTextures(score:string,metricLabel?:string,metricUnit?:string,activeHeader?:string){
  const invalidate=useThree(s=>s.invalidate);
  const images=useRef<(HTMLImageElement|undefined)[]>([]);
  const textures=useMemo(()=>cities.map(city=>[false,true].map(active=>{
    const texture=new THREE.CanvasTexture(drawFile(city,active,score,undefined,metricLabel,metricUnit,activeHeader));
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
  })),[]);
  useEffect(()=>{
    let alive=true;
    const redraw=(only?:number)=>{
      if(!alive)return;
      cities.forEach((city,i)=>{if(only!==undefined&&i!==only)return;textures[i].forEach((texture,j)=>{
        texture.image=drawFile(city,!!j,score,images.current[i],metricLabel,metricUnit,activeHeader);texture.needsUpdate=true;
      })});invalidate();
    };
    redraw();document.fonts.ready.then(()=>redraw());
    cities.forEach((city,i)=>{
      if(images.current[i])return;
      const image=new Image();image.crossOrigin='anonymous';image.onload=()=>{if(alive){images.current[i]=image;redraw(i)}};
      image.src=satelliteThumbnail(city);
    });
    return()=>{alive=false};
  },[score,metricLabel,metricUnit,activeHeader,textures,invalidate]);
  useEffect(()=>()=>textures.flat().forEach(t=>t.dispose()),[textures]);
  return textures;
}

function Rack({selected,dragPosition,dragging,score,metricLabel,metricUnit,activeHeader,onChoose,onReady}:Props){
  const {camera,size,invalidate,gl}=useThree();
  const files=useRef<(THREE.Group|null)[]>([]),faces=useRef<(THREE.MeshBasicMaterial|null)[]>([]);
  const progress=useRef(selected),reduced=useRef(false);
  const textures=useFileTextures(score,metricLabel,metricUnit,activeHeader);
  const geometry=useMemo(()=>{
    const shape=makeOutline();
    const body=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:1,steps:1,curveSegments:12});
    body.translate(0,0,-.0225);
    const line=new THREE.BufferGeometry().setFromPoints(shape.getPoints(48).map(p=>new THREE.Vector3(p.x,p.y,.03)));
    return {body,line,face:new THREE.PlaneGeometry(WIDTH,HEIGHT)};
  },[]);
  const scratch=useMemo(()=>({lean:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),.23),yaw:new THREE.Quaternion(),q:new THREE.Quaternion(),axis:new THREE.Vector3(0,1,0),position:new THREE.Vector3(),front:new THREE.Vector3(0,.8,1.7)}),[]);
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{reduced.current=motion.matches;invalidate()};update();motion.addEventListener('change',update);
    return()=>motion.removeEventListener('change',update);
  },[invalidate]);
  useEffect(()=>{
    const ortho=camera as THREE.OrthographicCamera;
    ortho.position.set(0,4.6,12);ortho.lookAt(0,0,0);
    ortho.zoom=Math.min(size.width/11.6,size.height/4.1);ortho.updateProjectionMatrix();invalidate();
  },[camera,size,invalidate]);
  useEffect(()=>{onReady()},[onReady]);
  useEffect(()=>{invalidate()},[selected,dragPosition,dragging,invalidate]);
  useEffect(()=>()=>{Object.values(geometry).forEach(g=>g.dispose());gl.domElement.style.cursor=''},[geometry,gl]);
  useFrame((_,delta)=>{
    const target=selected-dragPosition,difference=wrap(target-progress.current);
    progress.current+=dragging||reduced.current?difference:difference*(1-Math.exp(-delta*13));
    if(Math.abs(difference)>.001)invalidate();
    else progress.current=target;
    files.current.forEach((file,i)=>{
      if(!file)return;
      const offset=wrap(i-progress.current),distance=Math.abs(offset),side=Math.sign(offset);
      file.visible=distance<8.1;if(!file.visible)return;
      const angle=.10+Math.max(0,distance-1)*.125;
      const pull=1-THREE.MathUtils.smoothstep(distance,0,1);
      const spread=Math.min(distance,1);
      scratch.position.set(side*(1.37+3.55*Math.sin(angle))*spread,.18,-.35+4*(1-Math.cos(angle)));
      file.position.copy(scratch.position.lerp(scratch.front,pull));
      scratch.yaw.setFromAxisAngle(scratch.axis,-side*(Math.PI/2-angle));
      scratch.q.copy(scratch.lean).multiply(scratch.yaw).slerp(camera.quaternion,pull);
      file.quaternion.copy(scratch.q);file.scale.setScalar(1+pull*(size.width<950?.28:.18));
      // Sort each translucent file as a unit, from the back of the rack forward.
      file.renderOrder=100-Math.round(distance*10);
      const face=faces.current[i];
      if(face){face.map=textures[i][pull>.5?1:0];face.opacity=THREE.MathUtils.smoothstep(8.1-distance,0,.9)}
    });
  });
  return <>
    <ambientLight intensity={.8}/><directionalLight position={[-4,8,6]} intensity={2}/>
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} color="#effff1" position={[-4,4,3]} scale={[4,9,1]} rotation-y={Math.PI/4}/>
      <Lightformer form="rect" intensity={2} position={[5,1,4]} scale={[2,7,1]} rotation-y={-Math.PI/4}/>
    </Environment>
    {Array.from({length:FILES},(_,i)=><group key={i} ref={el=>{files.current[i]=el}} onClick={e=>{e.stopPropagation();onChoose(i)}} onPointerOver={e=>{e.stopPropagation();gl.domElement.style.cursor='pointer'}} onPointerOut={()=>{gl.domElement.style.cursor='grab'}}>
      <mesh geometry={geometry.body}>
        <meshPhysicalMaterial color="#d3e6da" transparent opacity={.1} roughness={.18} metalness={.05} clearcoat={1} clearcoatRoughness={.1} depthWrite={false}/>
      </mesh>
      <mesh geometry={geometry.face} position-z={.034}>
        <meshBasicMaterial ref={el=>{faces.current[i]=el}} map={textures[i][0]} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
      </mesh>
      <lineLoop geometry={geometry.line}><lineBasicMaterial color="#e6fff0" transparent opacity={.44} depthWrite={false}/></lineLoop>
    </group>)}
  </>;
}

export default function ArchiveScene(props:Props){
  return <Canvas orthographic camera={{position:[0,4.6,12],near:.1,far:60,zoom:90}} dpr={[1,1.5]} frameloop="demand" gl={{alpha:true,antialias:true,powerPreference:'low-power'}}><Rack {...props}/></Canvas>;
}
