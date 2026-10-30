import {Component,Suspense,lazy,useCallback,useEffect,useRef,useState,type ReactNode,type Dispatch,type SetStateAction,type CSSProperties} from 'react';
import {ArrowUpRight,Layers3} from 'lucide-react';
import {cities,satelliteThumbnail,type City} from './data';
import {useResearch} from './research';
const count=cities.length;
const ArchiveScene=lazy(()=>import('./ArchiveScene'));
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onFailure()}
  render(){return this.state.failed?null:this.props.children}
}
export default function CityArchive({selected,setSelected,onSelect}:{selected:number;setSelected:Dispatch<SetStateAction<number>>;onSelect:(city:City)=>void}){
  const deck=useRef<HTMLDivElement>(null);
  const drag=useRef({x:0,until:0,pointer:-1,step:174,moved:false});
  const [dragPosition,setDragPosition]=useState(0),[dragging,setDragging]=useState(false);
  const [desktop,setDesktop]=useState(false),[sceneReady,setSceneReady]=useState(false);
  const sceneDidLoad=useCallback(()=>setSceneReady(true),[]);
  const sceneFailed=useCallback(()=>setSceneReady(false),[]);
  useEffect(()=>{
    const query=matchMedia('(min-width:761px)');
    const update=()=>{setDesktop(query.matches);if(!query.matches)setSceneReady(false)};
    update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
  },[]);
  const stride=()=>174*(Number(getComputedStyle(deck.current!.querySelector('.archive-files')!).getPropertyValue('--archive-scale'))||1);
  const city=cities[selected];
  const {row}=useResearch(city.msaCode);
  const score=row?.score_status==='conditional_pilot'&&typeof row.index_equal==='number'&&Number.isFinite(row.index_equal)?row.index_equal.toFixed(1):'—';
  const move=(step:number)=>setSelected(value=>((value+step)%count+count)%count);
  useEffect(()=>{
    const element=deck.current;
    if(!element)return;
    let distance=0,timer:ReturnType<typeof setTimeout>|undefined;
    const finish=()=>{
      const steps=Math.round(distance/stride());
      setSelected(value=>((value+steps)%count+count)%count);
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
    <div className="archive-heading"><div><h2>A city. A living system.</h2><p>Discover the cities, one layer at a time.</p></div></div>
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
      }} onPointerCancel={()=>{drag.current.pointer=-1;setDragPosition(0);setDragging(false)}} onClickCapture={e=>{if(Date.now()<drag.current.until){e.preventDefault();e.stopPropagation()}}}>
      <div className="archive-orbit" aria-hidden="true"/><div className="archive-light" aria-hidden="true"/>
      {desktop&&<SceneBoundary onFailure={sceneFailed}><Suspense fallback={null}><div className="archive-scene" aria-hidden="true"><ArchiveScene selected={selected} dragPosition={dragPosition} dragging={dragging} score={score} onReady={sceneDidLoad} onChoose={index=>{
        if(Date.now()<drag.current.until||drag.current.moved)return;
        const offset=((index-selected+count*1.5)%count)-count/2;
        if(offset===0)onSelect(cities[index]);else move(offset);
      }}/></div></Suspense></SceneBoundary>}
      <span className="archive-announcement" role="status">{city.name}, {selected+1} of {count}, selected</span>
      <div className="archive-files" aria-hidden={sceneReady||undefined}>{Array.from({length:count},(_,i)=>{
        const step=(i-selected+count)%count,offset=step>Math.floor(count/2)?step-count:step;
        const position=((offset+dragPosition+count*1.5)%count+count)%count-count/2;
        const c=cities[i],distance=Math.abs(position),active=offset===0,wing=Math.sign(position),spread=Math.min(distance,1);
        const tail=Math.min(Math.max(0,distance-1),6);
        // The reference is a curved file rack seen obliquely. Both wings share
        // a rightward lean; yaw alone opens each successive leaf toward the ends.
        const yaw=wing<0?-(78-tail*9):(82-tail*4);
        const x=wing*(spread*154+Math.max(0,distance-1)*28);
        const style={'--file-x':`${x}px`,'--file-y':`${-14+spread*32+tail*2}px`,'--file-z':`${120-spread*134-tail*16}px`,'--file-angle':`${yaw*spread}deg`,'--file-roll':`${-17*spread}deg`,'--file-pitch':`${24*spread}deg`,'--file-alpha':Math.max(.3,1-distance*.085),zIndex:Math.round(30-distance)} as CSSProperties;
        return <button key={i} data-offset={offset} style={style} className={`city-card slot-${offset+2} ${distance>7.5?'offstage':''} ${active?'active':''}`} onClick={()=>active?onSelect(c):move(offset)} tabIndex={active&&!sceneReady?0:-1} aria-label={`Open ${c.name} city archive`} aria-hidden={!active||undefined}>
          <span className="file-back" aria-hidden="true"/><span className="file-edge" aria-hidden="true"/>
          <span className="file-front"><span className="card-top"><span>MSA {c.msaCode}</span><ArrowUpRight size={17}/></span><span className="card-image"><img src={satelliteThumbnail(c)} alt="" loading="lazy"/><span className="file-grid"/><span className="file-monogram">{c.short}</span><span className="image-crosshair"/></span><span className="card-bottom"><Layers3 size={20}/><span className="card-city">{c.name}</span><span className="card-meta">CITY ARCHIVE <span>·</span> {c.short}</span></span>{active&&<span className="card-index"><span className="card-index-label">Green Transition Index</span><span className="card-index-score">{score}<small>/ 100</small><span className="status-dot"/></span></span>}<span className="card-spine">{c.msaCode}</span></span>
        </button>;
      })}</div>
    </div>
    <div className="archive-footer"><div className="archive-pagination" role="group" aria-label="Choose a city archive">{cities.map((c,i)=><button key={c.id} onClick={()=>setSelected(i)} aria-label={`Select ${c.name}, ${i+1} of ${count}`} aria-pressed={selected===i}><span className="pagination-bead"/><span className="pagination-label" aria-hidden="true">{c.name}</span></button>)}</div></div>
  </section>;
}
