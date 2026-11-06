import {useEffect,useState} from 'react';
import {ArrowLeft,Globe2,Sun,Building2,Leaf,SlidersHorizontal,X,Plus,Minus,Maximize2} from 'lucide-react';
import {lenses,type Lens} from '../data';
import {usePhiladelphia} from './data';
import ResearchMap,{type Pick,type MapCommand} from './ResearchMap';
import {useVegetation,VegetationPanel,VegetationLegend,DistrictTooltip,boundsOf,type Example} from './Vegetation';
import {PhiladelphiaResults} from './Results';
import './philadelphia.css';
const icons={satellite:Globe2,solar:Sun,buildings:Building2,vegetation:Leaf};
const titles:Record<Lens,string>={satellite:'Philadelphia research',vegetation:'Vegetation & tree canopy',buildings:'Energy, within each use',solar:'Rooftop solar research'};

// The results panel is docked beside the map for every lens; there is no
// separate summary bar or launcher, so each value appears in one place.
export default function PhiladelphiaWorkspace({lens,onData}:{lens:Lens;onData:()=>void}){
 const {data,error,retry}=usePhiladelphia(),v=useVegetation(lens==='vegetation');
 const [opacity,setOpacity]=useState(80),[satellite,setSatellite]=useState(true),[settings,setSettings]=useState(false);
 const [energyUse,setEnergyUse]=useState('0'),[pick,setPick]=useState<Pick|null>(null),[site,setSite]=useState('phl_04'),[command,setCommand]=useState<MapCommand>({id:0,action:'reset'});
 useEffect(()=>{setPick(null);setSettings(false)},[lens,energyUse]);
 // One map serves every lens, so a lens change returns to the whole city.
 const [shownLens,setShownLens]=useState(lens);
 if(shownLens!==lens){setShownLens(lens);v.setPixels(false);setCommand(c=>({id:c.id+1,action:'reset'}))}
 const control=(action:string,extra:Omit<MapCommand,'id'|'action'>={})=>setCommand(c=>({id:c.id+1,action,...extra}));
 const districtBounds=(id:string)=>{const f=v.districts?.features.find(x=>x.properties.id===id);return f?boundsOf(f.geometry):undefined};
 // Selecting a district highlights it in place; only the pixel view moves the camera to it.
 const chooseDistrict=(id:string)=>{v.setSelected(id);const bounds=id&&districtBounds(id);if(v.pixels&&bounds)control('area',{bounds,zoom:14.5})};
 // Pixels are only legible close up: open them on the chosen district, or Center City.
 const setPixels=(on:boolean)=>{v.setPixels(on);const bounds=districtBounds(v.selected||'CTR');on&&bounds?control('area',{bounds,zoom:14.5}):control('reset')};
 const changeSource:typeof v.changeSource=s=>{if(v.pixels&&s!=='model')control('reset');v.changeSource(s)};
 const showExample=(x:Example)=>{v.changeSource('model');v.setPixels(true);control('point',{center:x.center,zoom:16})};
 const panel={...v,setPixels,changeSource};
 const loading=lens==='vegetation'?!v.summary||!v.districts:!data,failed=lens==='vegetation'?v.error:error;
 return <main className={`workspace phl-workspace lens-${lens}`} style={{'--lens-color':lenses[lens].color} as React.CSSProperties}>
  <div className="phl-stage">
   <ResearchMap lens={lens} energyUse={energyUse} opacity={opacity} satellite={satellite} command={command} onPick={setPick} onSite={setSite}
    districts={v.districts} districtFill={v.fill} pixels={v.pixels} tileBounds={v.summary?.tile_bounds??null} selected={v.selected} hovered={v.hovered} onHover={v.setHovered} onDistrict={chooseDistrict}
    tooltip={properties=><DistrictTooltip v={v} properties={properties}/>}/>
   <div className="workspace-vignette"/>
   <div className="workspace-heading"><a href="#/" className="back-link"><ArrowLeft size={16}/>Back to atlas</a><h1>Philadelphia</h1><p>City boundary · 2017–2018 historical research</p></div>
   {lens==='vegetation'&&!loading&&<VegetationLegend v={v}/>}
   {lens==='buildings'&&<div className="phl-legend glass"><p>Median site EUI · kBtu/ft²/year</p><div className="phl-legend-ramp"/><div className="phl-legend-ends"><span>0</span><span>50</span><span>100</span><span>200</span><span>500+</span></div><div className="phl-legend-classes"><span><i style={{background:'#48524e'}}/>Fewer than 5 properties</span></div></div>}
   <div className="layer-dock">{settings&&<section className="layer-settings glass" aria-label="Map appearance"><div className="settings-title">Map appearance<button aria-label="Close map appearance" onClick={()=>setSettings(false)}><X size={16}/></button></div><label>Layer opacity <span>{opacity}%</span><input aria-label="Layer opacity" type="range" min="10" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)}/></label><label className="switch-row">Satellite basemap<button role="switch" aria-checked={satellite} aria-label="Satellite basemap" onClick={()=>setSatellite(!satellite)} className={`switch ${satellite?'on':''}`}><span/></button></label></section>}
    <nav className="layer-rail glass" aria-label="Map layers">{(Object.keys(lenses) as Lens[]).map(l=>{const LayerIcon=icons[l];return <a key={l} href={`#/city/philadelphia/${l}`} className={lens===l?'selected':''} aria-current={lens===l?'page':undefined}><LayerIcon size={18}/><span>{lenses[l].name}</span></a>})}<button aria-label="Map appearance" aria-expanded={settings} onClick={()=>setSettings(!settings)} className={settings?'settings-active':''}><SlidersHorizontal size={19}/></button></nav>
   </div>
   <div className="map-control-stack"><button className="map-north" aria-label="Reset map to north" onClick={()=>control('north')}><span>N</span><svg viewBox="0 0 22 30" aria-hidden="true"><path d="m11 2 8 24-8-5-8 5Z" fill="none" stroke="currentColor"/><path d="m11 2 0 19-8 5Z" fill="currentColor"/></svg></button><div className="map-tools glass"><button aria-label="Zoom in" onClick={()=>control('in')}><Plus size={20}/></button><button aria-label="Zoom out" onClick={()=>control('out')}><Minus size={20}/></button><button aria-label="Reset map view" onClick={()=>control('reset')}><Maximize2 size={18}/></button></div></div>
   {loading&&<div className="map-loading" role="status">{failed?<>Research data could not load. <button onClick={()=>{retry();v.setRetry(n=>n+1)}}>Try again</button></>:'Loading research layers…'}</div>}
  </div>
  <aside className="phl-results glass" aria-label={`${titles[lens]} results`}>
   {lens==='vegetation'?<VegetationPanel v={panel} onDistrict={chooseDistrict} onExample={showExample} onData={onData}/>:<><div className="phl-panel-head"><h2>{titles[lens]}</h2></div><PhiladelphiaResults lens={lens} data={data} error={error} retry={retry} energyUse={energyUse} setEnergyUse={setEnergyUse} pick={pick} setPick={setPick} site={site} setSite={setSite} control={(action,center)=>control(action,{center})}/></>}
  </aside>
 </main>;
}
