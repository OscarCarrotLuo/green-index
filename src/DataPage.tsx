import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Download,Search,Sun,Building2,Leaf} from 'lucide-react';
import {cities,lenses,populationSource,satelliteThumbnail,type City,type Lens} from './data';
import {censusRegion,regionOrder,type Region} from './regions';
import {useResearchRows,type ResearchRow} from './research';
import {usePhiladelphia,SOURCE_LINKS,type PhiladelphiaData} from './philadelphia/data';
import {researchAsset,vegetationBase} from './philadelphia/assets';

const layers:{id:Lens;icon:typeof Sun}[]=[{id:'solar',icon:Sun},{id:'buildings',icon:Building2},{id:'vegetation',icon:Leaf}];
const fmt=(n:number,d=1)=>n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
// A layer is "attached" only when a validated value exists; otherwise it stays pending.
function layerStatus(city:City,lens:Lens,row:ResearchRow|undefined,phl:PhiladelphiaData|null):string|null{
 if(city.id==='philadelphia'&&phl)return lens==='vegetation'?`${fmt(phl.vegetation.coverage_pct)}% · 18 districts`:lens==='buildings'?`${phl.energy.properties.toLocaleString('en-US')} properties`:'2 validation sites';
 const value=!row?null:lens==='solar'?row.solar_share:lens==='buildings'?row.energy_ratio:row.vegetation_share;
 return typeof value==='number'&&Number.isFinite(value)?lens==='buildings'?fmt(value,2):`${fmt(value*100)}%`:null;
}

export default function DataPage({focus}:{focus:string}){
 const [query,setQuery]=useState(''),[region,setRegion]=useState<Region|'all'>('all');
 const {rows}=useResearchRows(),{data:phl}=usePhiladelphia(),search=useRef<HTMLInputElement>(null);
 // Runs after the router's scroll reset on navigation.
 useEffect(()=>{const t=setTimeout(()=>{if(focus==='find')search.current?.focus({preventScroll:true});else if(focus)document.getElementById(`data-${focus}`)?.scrollIntoView({block:'center',behavior:'instant'})},0);return()=>clearTimeout(t)},[focus]);
 const term=query.trim().toLowerCase();
 const shown=cities.filter(c=>(region==='all'||censusRegion(c)===region)&&(!term||(c.name+c.msaName+c.msaCode+c.region).toLowerCase().includes(term)));
 return <main className="page data-page">
  <header className="page-intro">
   <p className="page-kicker">Data collection</p>
   <h1>Every city,<br/>with its sources.</h1>
   <p className="two-tone">The <strong>20 largest U.S. metropolitan areas</strong> by 2025 population, and the state of <strong>each research layer</strong>. Cards follow population order; it is not a green ranking.</p>
  </header>
  <div className="data-toolbar frost-smoke">
   <label className="search"><Search size={16}/><input ref={search} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a city or MSA code" aria-label="Find a city or MSA code"/></label>
   <div className="data-chips" role="group" aria-label="Filter by Census region">{(['all',...regionOrder] as const).map(r=><button key={r} aria-pressed={region===r} onClick={()=>setRegion(r)}>{r==='all'?'All':r}<span>{r==='all'?cities.length:cities.filter(c=>censusRegion(c)===r).length}</span></button>)}</div>
   <button className="data-download" onClick={downloadCatalog}><Download size={16}/>City catalog (JSON)</button>
  </div>
  {shown.length?<ol className="city-cards">{shown.map(c=>{const row=rows.find(r=>String(r.msa_code)===c.msaCode);return <li key={c.id} id={`data-${c.id}`} className={focus===c.id?'focused':''}>
   <article className={`data-card ${c.id==='philadelphia'?'pilot':''}`}>
    <img className="data-card-image" src={satelliteThumbnail(c)} alt="" loading="lazy"/>
    <a className="data-card-top" href={`#/city/${c.id}`} tabIndex={-1} aria-hidden="true"><span className="frost-chip">{String(c.populationRank).padStart(2,'0')}</span><span className="data-card-code">{c.short}</span></a>
    <div className="data-card-glass frost">
     <h2><a href={`#/city/${c.id}`}>{c.name}</a></h2>
     <p>{c.region} · {censusRegion(c)}</p>
     <dl><div><dt>MSA</dt><dd>{c.msaCode}</dd></div><div><dt>Population 2025</dt><dd>{fmt(c.population/1e6,2)} M</dd></div></dl>
     <ul aria-label={`${c.name} research layers`}>{layers.map(({id,icon:Icon})=>{const status=layerStatus(c,id,row,phl);return <li key={id}><a href={`#/city/${c.id}/${id}`}><Icon size={16}/>{lenses[id].name}</a><span className={status?'attached':''}><span className={`status-dot ${status?'filled':''}`}/>{status??'Pending'}</span></li>})}</ul>
     {c.id==='philadelphia'&&<p className="data-card-scope">City boundary · 2017–2018 · not the full MSA</p>}
     <a className="data-card-open" href={`#/city/${c.id}`}>Open map<ArrowUpRight size={16}/></a>
    </div>
   </article></li>})}</ol>:<p className="data-empty">No matching cities. Try “Chicago” or “16980”.</p>}
  <section className="data-notes" aria-labelledby="data-notes-title">
   <h2 id="data-notes-title">About the data</h2>
   <div className="data-notes-grid">
    <div className="frost-smoke"><h3>Population catalog</h3><p>Census Vintage 2025, July 1 estimates. Metropolitan divisions and counties are excluded. Map centers are navigation anchors, not MSA boundaries.</p><a href={populationSource.url} target="_blank" rel="noreferrer">Census source<ArrowUpRight size={14}/></a></div>
    <div className="frost-smoke"><h3>Research layers</h3><p>Solar: PV share of observed roof. Buildings: site energy against a common use-based reference. Vegetation: tree and grass/shrub share of observed land. A layer stays pending until validated, comparable results exist.</p><a href="#/method">How each layer is measured<ArrowUpRight size={14}/></a></div>
    <div id="data-exports" className="green-surface"><h3>Philadelphia pilot exports</h3><ul>{[[`${vegetationBase}/districts.csv`,'Vegetation by planning district'],[`${vegetationBase}/official_tracts.csv`,'Official vegetation by tract'],[`${vegetationBase}/model_tracts.csv`,'U-Net vegetation by tract'],[`${vegetationBase}/test_report.json`,'Vegetation held-out evaluation'],[researchAsset('data/philadelphia/energy_by_tract_use.csv'),'Energy by tract and property use'],[researchAsset('data/philadelphia/solar_development_comparison.csv'),'Solar development comparison']].map(([href,label])=><li key={href}><a href={href} download><Download size={14}/>{label}</a></li>)}</ul></div>
    <div className="frost-smoke"><h3>Official sources</h3><ul>{[...SOURCE_LINKS,{label:'Planning districts',url:'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Planning_Districts/FeatureServer/0'},{label:'2017 NAIP imagery',url:'https://planetarycomputer.microsoft.com/dataset/naip'}].map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}<ArrowUpRight size={14}/></a></li>)}</ul></div>
   </div>
  </section>
 </main>;
}

function downloadCatalog(){const payload={status:'population_selected_geographies',population_source:populationSource,results_available:false,cities:cities.map(c=>({msa_code:c.msaCode,msa_name:c.msaName,website_id:c.id,navigation_center:c.center,population:c.population,population_rank:c.populationRank,score:null,year:null,scope_type:null})),source:populationSource.download};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='green-transition-city-catalog.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
