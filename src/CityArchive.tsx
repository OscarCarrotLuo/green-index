import {Component,Suspense,lazy,memo,useCallback,useEffect,useRef,useState,type ReactNode,type Dispatch,type SetStateAction,type CSSProperties} from 'react';
import {ArrowUpRight,Layers3,Sun,Building2,Leaf,FolderOpen} from 'lucide-react';
import {cities,satelliteThumbnail,type City} from './data';
import {rack,rackSlot,cityAtSlot,censusRegion} from './regions';
const count=cities.length;
const populationScore=(city:City)=>(city.population/1e6).toFixed(2);
const ArchiveScene=lazy(()=>import('./ArchiveScene'));
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onFailure()}
  render(){return this.state.failed?null:this.props.children}
}
export default memo(function CityArchive({selected,setSelected,onSelect,onCatalog}:{selected:number;setSelected:Dispatch<SetStateAction<number>>;onSelect:(city:City)=>void;onCatalog:()=>void}){
  const deck=useRef<HTMLDivElement>(null);
  const drag=useRef({x:0,until:0,pointer:-1,step:174,moved:false});
  const [dragPosition,setDragPosition]=useState(0),[dragging,setDragging]=useState(false);
  const [desktop,setDesktop]=useState(false),[sceneReady,setSceneReady]=useState(false);
  const sceneDidLoad=useCallback(()=>setSceneReady(true),[]);
  const sceneFailed=useCallback(()=>setSceneReady(false),[]);
  useEffect(()=>{
    const query=matchMedia('(min-width:761px), (min-width:560px) and (hover:hover) and (pointer:fine)');
    const update=()=>{setDesktop(query.matches);if(!query.matches)setSceneReady(false)};
    update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
  },[]);
  const stride=()=>174*(Number(getComputedStyle(deck.current!.querySelector('.archive-files')!).getPropertyValue('--archive-scale'))||1);
  // `selected` indexes `cities`; the rack and ruler are ordered by region.
  const city=cities[selected],slot=rackSlot(selected);
  const move=(step:number)=>setSelected(value=>cityAtSlot(rackSlot(value)+step));
  useEffect(()=>{
    const element=deck.current;
    if(!element)return;
    let distance=0,timer:ReturnType<typeof setTimeout>|undefined;
    const finish=()=>{
      const steps=Math.round(distance/stride());
      setSelected(value=>cityAtSlot(rackSlot(value)+steps));
      distance=0;setDragPosition(0);setDragging(false);
    };
    const wheel=(event:WheelEvent)=>{
      if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)||!event.deltaX)return;
      event.preventDefault();
      if(element.contains(document.activeElement))element.focus({preventScroll:true});
      distance+=event.deltaX;
      setDragging(true);setDragPosition(-distance/stride());
      drag.current.until=Date.now()+400;
      clearTimeout(timer);timer=setTimeout(finish,140);
    };
    element.addEventListener('wheel',wheel,{passive:false});
    return()=>{element.removeEventListener('wheel',wheel);clearTimeout(timer)};
  },[setSelected]);
  return <section className="archives" id="city-archives" aria-label="City archives">
    <div className="archive-heading"><div><h2>A city. A living system.</h2><p>Pull a city closer. Look beneath the surface.</p></div><button className="archive-catalog glass" onClick={onCatalog}><FolderOpen size={16}/>All cities<span>{count}</span></button></div>
    <div ref={deck} className={`archive-deck ${sceneReady?'scene-ready':''} ${dragging?'dragging':''}`} tabIndex={0} aria-label={`City carousel. ${city.name} selected. Use left and right arrow keys to switch cities, and Enter to open.`} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.currentTarget.focus();move(e.key==='ArrowRight'?1:-1)}else if(e.key==='Enter'&&e.target===e.currentTarget){e.preventDefault();onSelect(city)}}} onPointerDown={e=>{if(e.button!==0)return;drag.current={x:e.clientX,until:0,pointer:e.pointerId,step:stride(),moved:false}}} onPointerMove={e=>{
        if(drag.current.pointer!==e.pointerId)return;
        const delta=e.clientX-drag.current.x;
        if(!drag.current.moved&&Math.abs(delta)<6)return;
        drag.current.moved=true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);setDragPosition(delta/drag.current.step);
      }} onPointerUp={e=>{
        if(drag.current.pointer!==e.pointerId)return;
        if(drag.current.moved){
          drag.current.until=Date.now()+400;
          e.currentTarget.focus({preventScroll:true});
          move(-Math.round((e.clientX-drag.current.x)/drag.current.step));
        }
        drag.current.pointer=-1;setDragPosition(0);setDragging(false);
        if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      }} onPointerCancel={()=>{drag.current.pointer=-1;setDragPosition(0);setDragging(false)}} onLostPointerCapture={()=>{if(drag.current.pointer!==-1){drag.current.pointer=-1;setDragPosition(0);setDragging(false)}}} onClickCapture={e=>{if(Date.now()<drag.current.until){e.preventDefault();e.stopPropagation()}}}>
      <div className="archive-floor" aria-hidden="true"/>
      {desktop&&<SceneBoundary onFailure={sceneFailed}><Suspense fallback={null}><div className="archive-scene" aria-hidden="true"><ArchiveScene selected={slot} dragPosition={dragPosition} dragging={dragging} scoreOf={populationScore} metricLabel="Metropolitan population" metricUnit="million residents" onReady={sceneDidLoad} onChoose={index=>{
        if(Date.now()<drag.current.until||drag.current.moved)return;
        const offset=((index-slot+count*1.5)%count)-count/2;
        if(offset===0)onSelect(rack[index]);else move(offset);
      }}/></div></Suspense></SceneBoundary>}
      <span className="archive-announcement" role="status">{city.name}, {censusRegion(city)}, {slot+1} of {count}, selected</span>
      <div className="archive-files" aria-hidden={sceneReady||undefined}>{!sceneReady&&Array.from({length:count},(_,i)=>{
        const step=(i-slot+count)%count,offset=step>Math.floor(count/2)?step-count:step;
        const position=((offset+dragPosition+count*1.5)%count+count)%count-count/2;
        const c=rack[i],distance=Math.abs(position),active=offset===0,wing=Math.sign(position),spread=Math.min(distance,1);
        const tail=Math.min(Math.max(0,distance-1),6);
        // The reference is a curved file rack seen obliquely. Both wings share
        // a rightward lean; yaw alone opens each successive leaf toward the ends.
        const yaw=wing<0?-(78-tail*9):(82-tail*4);
        const x=wing*(spread*154+Math.max(0,distance-1)*28);
        const style={'--file-x':`${x}px`,'--file-y':`${-14+spread*32+tail*2}px`,'--file-z':`${120-spread*134-tail*16}px`,'--file-angle':`${yaw*spread}deg`,'--file-roll':`${-17*spread}deg`,'--file-pitch':`${24*spread}deg`,'--file-alpha':Math.max(.3,1-distance*.085),zIndex:Math.round(30-distance)} as CSSProperties;
        return <button key={i} data-offset={offset} style={style} className={`city-card slot-${offset+2} ${distance>7.5?'offstage':''} ${active?'active':''}`} onClick={()=>active?onSelect(c):move(offset)} tabIndex={active&&!sceneReady?0:-1} aria-label={`Open ${c.name} city archive`} aria-hidden={!active||undefined}>
          <span className="file-back" aria-hidden="true"/><span className="file-edge" aria-hidden="true"/>
          <span className="file-front"><span className="card-top"><span>MSA {c.msaCode}</span><ArrowUpRight size={17}/></span><span className="card-image"><img src={satelliteThumbnail(c)} alt="" loading="lazy"/><span className="file-grid"/><span className="file-monogram">{c.short}</span><span className="image-crosshair"/></span><span className="card-bottom"><Layers3 size={20}/><span className="card-city">{c.name}</span><span className="card-meta">{c.region}</span></span>{active&&<span className="card-index"><span className="card-index-label">Metropolitan population</span><span className="card-index-score">{(c.population/1e6).toFixed(2)}<small>million residents</small></span></span>}<span className="card-spine">{c.msaCode}</span></span>
        </button>;
      })}</div>
    </div>
    <div className="archive-footer"><ArchiveRuler selected={selected} onPick={setSelected}/></div>
    <div className="archive-dossier glass"><div className="dossier-city" key={city.id}><span className="dossier-code">{city.short}</span><div><h3>{city.name}</h3><p>{city.region} · MSA {city.msaCode}</p></div></div><div className="dossier-lenses"><a href={`#/city/${city.id}/solar`}><Sun size={20}/><span>Solar PV<small>Energy from above</small></span><ArrowUpRight size={15}/></a><a href={`#/city/${city.id}/buildings`}><Building2 size={20}/><span>Buildings<small>The places we shape</small></span><ArrowUpRight size={15}/></a><a href={`#/city/${city.id}/vegetation`}><Leaf size={20}/><span>Vegetation<small>Room for nature</small></span><ArrowUpRight size={15}/></a></div><button className="dossier-open" onClick={()=>onSelect(city)} aria-label={`Explore ${city.name} map`}><ArrowUpRight size={23}/></button></div>
  </section>;
});
// One evenly spaced tick per city, in archive order. Drag along the ruler,
// click a tick or use the arrow keys; the selected city rides above in a pill.
function ArchiveRuler({selected,onPick}:{selected:number;onPick:(index:number)=>void}){
  const ruler=useRef<HTMLDivElement>(null),[scrubbing,setScrubbing]=useState(false);
  const city=cities[selected],slot=rackSlot(selected);
  const x=`calc(${slot} * var(--tick) + var(--tick) / 2)`;
  const pick=(clientX:number)=>{
    let nearest=selected,distance=Infinity;
    ruler.current!.querySelectorAll<HTMLElement>('[data-city]').forEach(tick=>{const r=tick.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-clientX);if(d<distance){distance=d;nearest=Number(tick.dataset.city)}});
    onPick(nearest);
  };
  const release=(e:React.PointerEvent<HTMLDivElement>)=>{setScrubbing(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
  return <div ref={ruler} className={`archive-ruler ${scrubbing?'scrubbing':''}`} role="slider" tabIndex={0} aria-label="City archive" aria-valuemin={1} aria-valuemax={count} aria-valuenow={slot+1} aria-valuetext={city.name}
    onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);setScrubbing(true);pick(e.clientX)}}
    onPointerMove={e=>{if(scrubbing)pick(e.clientX)}} onPointerUp={release} onPointerCancel={release}
    onKeyDown={e=>{
      const target=e.key==='ArrowRight'||e.key==='ArrowUp'?slot+1:e.key==='ArrowLeft'||e.key==='ArrowDown'?slot-1:e.key==='Home'?0:e.key==='End'?count-1:null;
      if(target===null)return;e.preventDefault();onPick(cityAtSlot(Math.max(0,Math.min(count-1,target))));
    }}>
    <span className="ruler-pill" style={{'--x':x} as CSSProperties} aria-hidden="true">{city.name}</span>
    {rack.map(c=>{const i=cities.indexOf(c);return <span key={c.id} data-city={i} className={`ruler-tick ${i===selected?'active':''}`} aria-hidden="true"><span className="ruler-name">{c.name}</span></span>})}
  </div>;
}
