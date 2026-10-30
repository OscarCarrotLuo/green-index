import {lazy,Suspense,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Globe2,Sun,Building2,Leaf,SlidersHorizontal,X,Plus,Minus,Maximize2,Database} from 'lucide-react';
import {lenses,type City,type Lens} from './data';
import {useResearch} from './research';
const CityMap=lazy(()=>import('./CityMap'));
const icons={satellite:Globe2,solar:Sun,buildings:Building2,vegetation:Leaf};

export default function Workspace({city,lens,onData}:{city:City;lens:Lens;onData:()=>void}){
 const [opacity,setOpacity]=useState(75),[satellite,setSatellite]=useState(true),[threeD,setThreeD]=useState(false),[settings,setSettings]=useState(false),[command,setCommand]=useState({id:0,action:'reset'}),[inspect,setInspect]=useState<string|null>(null);
 const info=lenses[lens],Icon=icons[lens];
 const {row,multiple}=useResearch(city.msaCode);
 const raw=row?(lens==='solar'?row.solar_share:lens==='buildings'?row.energy_ratio:lens==='vegetation'?row.vegetation_share:row.score_status==='conditional_pilot'?row.index_equal:null):null;
 const metric=typeof raw==='number'&&Number.isFinite(raw)?(raw*(lens==='solar'||lens==='vegetation'?100:1)).toFixed(lens==='buildings'?2:1):'—';
 const coverage=row?(lens==='solar'?row.solar_coverage:lens==='buildings'?row.energy_coverage:lens==='vegetation'?row.vegetation_coverage:null):null;
 const control=(action:string)=>setCommand(c=>({id:c.id+1,action}));
 return <main className={`workspace lens-${lens}`} style={{'--lens-color':info.color} as React.CSSProperties}>
  <Suspense fallback={<div className="map-loading">Opening {city.name}…</div>}><CityMap city={city} lens={lens} opacity={opacity} satellite={satellite} threeD={threeD} command={command} onInspect={setInspect}/></Suspense><div className="workspace-vignette"/>
  <div className="workspace-heading"><a href="#/" className="back-link"><ArrowLeft size={16}/>Back to atlas</a><h1>{city.name}</h1><p>{city.msaName}</p></div>
  <button className="workspace-status glass" onClick={onData}><span className="status-dot"/>Research preview<ArrowUpRight size={14}/></button>
  <div className="layer-dock">
   {settings&&<section className="layer-settings glass" aria-label="Map appearance"><div className="settings-title">Map appearance<button aria-label="Close map appearance" onClick={()=>setSettings(false)}><X size={16}/></button></div><label>Layer opacity <span>{opacity}%</span><input aria-label="Layer opacity" type="range" min="10" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)}/></label><label className="switch-row">Satellite basemap<button role="switch" aria-checked={satellite} aria-label="Satellite basemap" onClick={()=>setSatellite(!satellite)} className={`switch ${satellite?'on':''}`}><span/></button></label></section>}
   <nav className="layer-rail glass" aria-label="Map layers">{(Object.keys(lenses) as Lens[]).map(l=>{const LayerIcon=icons[l];return <a key={l} href={`#/city/${city.id}/${l}`} className={lens===l?'selected':''} aria-current={lens===l?'page':undefined}><LayerIcon size={18}/><span>{lenses[l].name}</span></a>})}<button aria-label="Map appearance" aria-expanded={settings} onClick={()=>setSettings(!settings)} className={settings?'settings-active':''}><SlidersHorizontal size={19}/></button></nav>
  </div>
  <div className="map-control-stack"><button className="map-north" aria-label="Reset map to north" onClick={()=>control('north')}><span>N</span><svg viewBox="0 0 22 30" aria-hidden="true"><path d="m11 2 8 24-8-5-8 5Z" fill="none" stroke="currentColor"/><path d="m11 2 0 19-8 5Z" fill="currentColor"/></svg></button><div className="map-tools glass"><button aria-label="Zoom in" onClick={()=>control('in')}><Plus size={20}/></button><button aria-label="Zoom out" onClick={()=>control('out')}><Minus size={20}/></button><button aria-label="Reset map view" onClick={()=>control('reset')}><Maximize2 size={18}/></button><button aria-label="Toggle 3D view" aria-pressed={threeD} onClick={()=>setThreeD(!threeD)} className={threeD?'tool-active':''}>3D</button></div></div>
  {inspect&&<div className="inspect-card glass" role="status"><button aria-label="Close feature detail" onClick={()=>setInspect(null)}><X size={16}/></button><Icon size={22}/><h3>{inspect}</h3><p>{lens==='solar'?'Illustrative polygon. No detection result is attached.':'Contextual map feature. Research metrics are not yet attached.'}</p></div>}
  <section className="insight-bar glass"><div className="insight-intro"><span className="lens-symbol"><Icon size={24}/></span><div><h2>{info.label}</h2><p>{info.description}</p><span className="map-legend"><i style={{background:info.color}}/>{info.legend[0]}</span></div></div><div className="metric-block"><span>{info.metric}</span><div key={lens}>{metric}<small>{info.unit}</small></div><span className="pending-label">{multiple?'Study scope required':row?`${row.score_status.replaceAll('_',' ')}${typeof coverage==='number'?` · ${(coverage*100).toFixed(0)}% coverage`:''}`:'Awaiting validated results'}</span></div><div className="study-block"><span>Study scope</span><strong>MSA {city.msaCode}</strong><p>{row?`${row.year} · ${row.scope_type.replaceAll('_',' ')}`:'Year & boundary to be confirmed'}</p><button onClick={onData}><Database size={14}/>View source data<ArrowUpRight size={15}/></button></div></section>
  <div className="map-source">{info.source}</div>
 </main>;
}
