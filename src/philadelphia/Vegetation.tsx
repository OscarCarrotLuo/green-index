import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,Download,MapPin,X} from 'lucide-react';
import type {ExpressionSpecification} from 'maplibre-gl';
import type {FeatureCollection,Geometry} from 'geojson';
import {researchAsset,vegetationBase as base} from './assets';
import type {Bounds} from './mapLayout';
export type Metric='vegetation'|'tree'|'low_vegetation';
export type Source='official'|'model'|'difference';
type Tab='districts'|'model'|'examples';
type Experiment={id:string;label:string;mean_iou:number|null;vegetation_iou:number;vegetation_mae_pp:number};
export type Example={id:string;center:[number,number];rgb:string;reference:string;unet:string;random_forest:string};
type Summary={period:string;test_patches:number;test_blocks:number;minimum_gap_m:number;models:Experiment[];examples:Example[];tile_bounds:[number,number,number,number]};
type DistrictProps={id:string;name:string;places:string;tracts:number;[key:string]:unknown};
type Agreement={tracts:number;mean_abs_pp:number;within_5pp_share:number};
type Districts=FeatureCollection<Geometry,DistrictProps>&{metadata:{citywide:Record<'official'|'model',Record<string,number>>;tract_agreement:Agreement;tracts_below_90pct_share:number}};
type Report={models:Record<string,{confusion_matrix:number[][]}>};

export const names:Record<Metric,string>={vegetation:'All vegetation',tree:'Tree canopy',low_vegetation:'Grass / shrub'};
const sources:Record<Source,string>={official:'Official',model:'U-Net',difference:'Difference'};
// Sequential (one hue, dark to light on the dark map) and diverging (orange = U-Net lower,
// blue = U-Net higher, grey midpoint) steps, each at least 11 ΔE (OKLab) from its neighbour.
const SEQ=['#325033','#48764a','#5f9e61','#7fc581','#aee9af'];
const DIV=['#c56c21','#d7a57d','#8d939a','#8fbee0','#4493d0'];
const DIFF_BREAKS=[-2,-.5,.5,2];
const CLASSES=[['Other land','#747a76'],['Tree canopy','#28734c'],['Grass / shrub','#afc76b'],['Water','#6f9eb8']];
const fmt=(n:number|null|undefined,d=1)=>n==null||!Number.isFinite(n)?'—':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const signed=(n:number|null|undefined,d=1)=>n==null||!Number.isFinite(n)?'—':`${n>=.05?'+':n<=-.05?'−':''}${fmt(Math.abs(n),d)}`;
const ordinal=(n:number)=>`${n}${[,'st','nd','rd'][n%100>10&&n%100<14?0:n%10]||'th'}`;
const field=(metric:Metric,source:Source)=>source==='difference'?`difference_${metric}_pp`:`${source}_${metric}_pct`;
function quantileBreaks(values:number[]){
 const sorted=[...values].sort((a,b)=>a-b),out:number[]=[];
 for(const q of [.2,.4,.6,.8]){const v=Math.round(sorted[Math.round(q*(sorted.length-1))]);if(!out.length||v>out[out.length-1])out.push(v)}
 return out;
}
export function boundsOf(geometry:Geometry):Bounds{
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 const walk=(c:unknown):void=>{if(Array.isArray(c)&&typeof c[0]==='number'){x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);y0=Math.min(y0,c[1] as number);y1=Math.max(y1,c[1] as number)}else if(Array.isArray(c))c.forEach(walk)};
 walk('coordinates' in geometry?geometry.coordinates:[]);return [[x0,y0],[x1,y1]];
}

export function useVegetation(active:boolean){
 const [summary,setSummary]=useState<Summary|null>(null),[districts,setDistricts]=useState<Districts|null>(null),[report,setReport]=useState<Report|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [metric,setMetric]=useState<Metric>('vegetation'),[source,setSource]=useState<Source>('official'),[pixels,setPixels]=useState(false);
 const [selected,setSelected]=useState(''),[hovered,setHovered]=useState(''),[tab,setTab]=useState<Tab>('districts');
 const [example,setExample]=useState(0),[exampleModel,setExampleModel]=useState<'unet'|'random_forest'>('unet');
 const loaded=!!summary&&!!districts;
 useEffect(()=>{if(!active||loaded)return;const abort=new AbortController();setError('');
  Promise.all(['summary.json','districts.geojson','test_report.json'].map(file=>fetch(`${base}/${file}`,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error(file);return r.json()})))
   .then(([s,d,r])=>{setSummary(s);setDistricts(d);setReport(r)}).catch(e=>{if(e.name!=='AbortError')setError('The vegetation results could not load. Check the connection and try again.')});
  return()=>abort.abort()},[active,loaded,retry]);
 const key=field(metric,source),features=districts?.features??[];
 // Official and U-Net maps share one classification so the two can be compared.
 const breaks=useMemo(()=>quantileBreaks(features.map(f=>Number(f.properties[`official_${metric}_pct`]))),[districts,metric]);
 const cuts=source==='difference'?DIFF_BREAKS:breaks;
 const palette=source==='difference'?DIV:cuts.map((_,i)=>SEQ[Math.round(i*4/cuts.length)]).concat(SEQ[4]);
 const fill=useMemo(()=>cuts.length?['step',['get',key],palette[0],...cuts.flatMap((b,i)=>[b,palette[i+1]])] as ExpressionSpecification:null,[key,cuts.join(),palette.join()]);
 const valueOf=(p:DistrictProps)=>Number(p[key]);
 const colorOf=(value:number)=>palette[cuts.filter(b=>value>=b).length];
 const ranked=[...features].sort((a,b)=>valueOf(b.properties)-valueOf(a.properties));
 const district=features.find(f=>f.properties.id===selected);
 const city=districts?.metadata.citywide;
 const cityValue=!city?null:source==='difference'?city.model[`${metric}_pct`]-city.official[`${metric}_pct`]:city[source][`${metric}_pct`];
 const changeSource=(s:Source)=>{setSource(s);if(s!=='model')setPixels(false)};
 return {summary,districts,report,error,setRetry,metric,setMetric,source,changeSource,pixels,setPixels:(on:boolean)=>setPixels(on),selected,setSelected,hovered,setHovered,tab,setTab,example,setExample,exampleModel,setExampleModel,fill,cuts,palette,valueOf,colorOf,ranked,district,cityValue};
}
export type VegetationState=ReturnType<typeof useVegetation>;

function context(v:VegetationState,p?:DistrictProps){
 const value=p?v.valueOf(p):v.cityValue,what=v.metric==='vegetation'?'vegetation':names[v.metric].toLowerCase();
 if(v.source==='difference')return value==null?'':Math.abs(value)<.05?'U-Net matches the official map':`U-Net finds ${fmt(Math.abs(value))} pp ${value<0?'less':'more'} ${what} than the official map`;
 if(!p)return v.source==='official'?'Official land cover · 2017 imagery + 2018 LiDAR':'U-Net estimate · 2017 NAIP at 1 m';
 return `Citywide ${fmt(v.cityValue)}% · ${ordinal(v.ranked.findIndex(f=>f.properties.id===p.id)+1)} of ${v.ranked.length} districts`;
}
const shown=(v:VegetationState,value:number|null)=>v.source==='difference'?signed(value):fmt(value);
const unit=(v:VegetationState)=>v.source==='difference'?'pp':'%';

export function DistrictTooltip({v,properties}:{v:VegetationState;properties:Record<string,unknown>}){
 const p=properties as DistrictProps;
 return <><b>{p.name}</b><span>{p.places}</span><strong>{shown(v,v.valueOf(p))}<small>{unit(v)}</small></strong><em>{context(v,p)}</em></>;
}

export function VegetationLegend({v}:{v:VegetationState}){
 if(v.pixels)return <div className="phl-legend glass"><p>U-Net classes · 1 m</p><div className="phl-legend-classes">{CLASSES.slice(1,3).map(([label,color])=><span key={label}><i style={{background:color}}/>{label}</span>)}</div></div>;
 const n=v.palette.length,diff=v.source==='difference';
 return <div className="phl-legend glass"><p>{diff?`U-Net − official · ${names[v.metric]}, pp`:`${names[v.metric]} · % of land`}</p>
  <div className="phl-legend-scale"><div>{v.palette.map((color,i)=><i key={i} style={{background:color}}/>)}</div>
   <div>{v.cuts.map((b,i)=><span key={i} style={{left:`${(i+1)/n*100}%`}}>{diff?signed(b,b%1?1:0):b}</span>)}</div></div>
  {diff&&<div className="phl-legend-ends"><span>U-Net lower</span><span>U-Net higher</span></div>}</div>;
}

function Segmented<T extends string>({label,value,options,onChange}:{label:string;value:T;options:Record<T,string>;onChange:(value:T)=>void}){
 return <div className="veg-segment" role="group" aria-label={label}><span>{label}</span><div>{(Object.keys(options) as T[]).map(k=><button key={k} aria-pressed={value===k} onClick={()=>onChange(k)}>{options[k]}</button>)}</div></div>;
}

export function VegetationPanel({v,onDistrict,onExample,onData}:{v:VegetationState;onDistrict:(id:string)=>void;onExample:(example:Example)=>void;onData:()=>void}){
 if(!v.summary||!v.districts)return <div className="phl-empty" role="status">{v.error||'Loading vegetation results…'}{v.error&&<button className="veg-action" onClick={()=>v.setRetry(n=>n+1)}>Try again</button>}</div>;
 const p=v.district?.properties,tabs:Record<Tab,string>={districts:'Districts',model:'Model check',examples:'Examples'};
 return <>
  <header className="veg-head"><h2>Vegetation & tree canopy</h2><p>Share of observed non-water land · {v.summary.period}</p></header>
  <Segmented label="Measure" value={v.metric} options={names} onChange={v.setMetric}/>
  <Segmented label="Map" value={v.source} options={sources} onChange={v.changeSource}/>
  {v.source==='model'&&<label className="veg-toggle"><input type="checkbox" checked={v.pixels} onChange={e=>v.setPixels(e.target.checked)}/>Show U-Net pixels on the map (1 m)</label>}
  <section className="veg-figure" aria-live="polite">
   <div className="veg-figure-top"><div><b>{p?p.name:'Philadelphia'}</b><span>{p?p.places:'Citywide · 18 planning districts'}</span></div>{p&&<button aria-label="Back to citywide" onClick={()=>onDistrict('')}><X size={16}/></button>}</div>
   <strong>{shown(v,p?v.valueOf(p):v.cityValue)}<small>{unit(v)}</small></strong>
   <p>{context(v,p)}</p>
  </section>
  <div className="veg-tabs" role="tablist" aria-label="Vegetation results">{(Object.keys(tabs) as Tab[]).map(t=><button key={t} role="tab" id={`veg-tab-${t}`} aria-selected={v.tab===t} aria-controls="veg-tabpanel" tabIndex={v.tab===t?0:-1} onClick={()=>v.setTab(t)} onKeyDown={e=>{const order=Object.keys(tabs) as Tab[];const i=order.indexOf(t);if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=order[(i+(e.key==='ArrowRight'?1:order.length-1))%order.length];v.setTab(next);(e.currentTarget.parentElement?.querySelector(`#veg-tab-${next}`) as HTMLElement)?.focus()}}}>{tabs[t]}</button>)}</div>
  <div id="veg-tabpanel" role="tabpanel" aria-labelledby={`veg-tab-${v.tab}`} className="veg-tabpanel">
   {v.tab==='districts'?<DistrictList v={v} onDistrict={onDistrict} onData={onData}/>:v.tab==='model'?<ModelCheck v={v} onDistrict={onDistrict}/>:<Examples v={v} onExample={onExample}/>}
  </div>
 </>;
}

function DistrictList({v,onDistrict,onData}:{v:VegetationState;onDistrict:(id:string)=>void;onData:()=>void}){
 const features=v.districts!.features,diff=v.source==='difference';
 const scale=diff?Math.max(...features.map(f=>Math.abs(v.valueOf(f.properties))),1):Math.max(...features.flatMap(f=>[Number(f.properties[`official_${v.metric}_pct`]),Number(f.properties[`model_${v.metric}_pct`])]));
 const split=v.districts!.metadata.tracts_below_90pct_share;
 return <>
  <ol className={`veg-bars ${diff?'diverging':''}`} aria-label={`${names[v.metric]} by planning district`}>{v.ranked.map(f=>{const p=f.properties,value=v.valueOf(p),width=diff?Math.abs(value)/scale*50:value/scale*100;
   return <li key={p.id}><button aria-pressed={v.selected===p.id} className={v.hovered===p.id?'hover':''} onMouseEnter={()=>v.setHovered(p.id)} onMouseLeave={()=>v.setHovered('')} onFocus={()=>v.setHovered(p.id)} onBlur={()=>v.setHovered('')} onClick={()=>onDistrict(v.selected===p.id?'':p.id)}>
    <span className="veg-bar-name">{p.name}<small>{p.places}</small></span>
    <span className="veg-bar"><i style={{width:`${width}%`,background:v.colorOf(value),...(diff?value<0?{right:'50%'}:{left:'50%'}:{})}}/></span>
    <b>{shown(v,value)}</b></button></li>})}</ol>
  <p className="veg-note">Planning districts from the City Planning Commission, built from whole 2018 census tracts{split?` (${split} of 384 tracts have more than 10% of their area in a neighbouring district)`:''}. Values pool land area; they are not tract averages. Includes private land; does not measure canopy height, access or cooling.</p>
  <div className="veg-links">
   <a href={`${base}/districts.csv`} download><Download size={14}/>District values (CSV)</a>
   <a href={`${base}/tracts.geojson`} download><Download size={14}/>Tract values (GeoJSON)</a>
   <a href="https://www.pasda.psu.edu/uci/DataSummary.aspx?dataset=1587" target="_blank" rel="noreferrer">Land cover source<ArrowUpRight size={13}/></a>
   <button onClick={onData}>All data sources<ArrowUpRight size={13}/></button>
   <a href="#/method/philadelphia">Method<ArrowUpRight size={13}/></a>
  </div>
 </>;
}

function ModelCheck({v,onDistrict}:{v:VegetationState;onDistrict:(id:string)=>void}){
 const s=v.summary!,features=v.districts!.features,agreement=v.districts!.metadata.tract_agreement;
 const points=features.map(f=>({id:f.properties.id,name:f.properties.name,x:Number(f.properties[`official_${v.metric}_pct`]),y:Number(f.properties[`model_${v.metric}_pct`])}));
 const top=Math.ceil(Math.max(...points.flatMap(p=>[p.x,p.y]))/10)*10,W=344,H=244,L=34,B=30,T=8,R=8;
 const sx=(n:number)=>L+n/top*(W-L-R),sy=(n:number)=>H-B-n/top*(H-B-T);
 const gaps=[...points].sort((a,b)=>(a.y-a.x)-(b.y-b.x)).filter(p=>p.y-p.x<=-.5).slice(0,2);
 const cm=v.report?.models.unet?.confusion_matrix;
 const misses=(cm??[]).flatMap((row,i)=>{const total=row.reduce((a,b)=>a+b,0);return row.map((n,j)=>({from:CLASSES[i][0],to:CLASSES[j][0],share:total?n/total:0,off:i!==j}))}).filter(x=>x.off).sort((a,b)=>b.share-a.share).slice(0,2);
 return <>
  <h3 className="veg-h">Official vs U-Net, by district</h3>
  <svg className="veg-scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${names[v.metric]}: official map against U-Net estimate for ${points.length} districts`}>
   {[0,top/2,top].map(t=><g key={t}><line x1={L} x2={W-R} y1={sy(t)} y2={sy(t)} className="grid"/><text x={L-8} y={sy(t)+4} textAnchor="end">{t}</text><text x={sx(t)} y={H-B+18} textAnchor="middle">{t}</text></g>)}
   <line x1={sx(0)} y1={sy(0)} x2={sx(top)} y2={sy(top)} className="diagonal"/>
   {points.map(p=><circle key={p.id} cx={sx(p.x)} cy={sy(p.y)} r={v.selected===p.id||v.hovered===p.id?7:5} className={v.selected===p.id?'selected':v.hovered===p.id?'hover':''} onMouseEnter={()=>v.setHovered(p.id)} onMouseLeave={()=>v.setHovered('')} onClick={()=>onDistrict(v.selected===p.id?'':p.id)}><title>{`${p.name}: official ${fmt(p.x)}%, U-Net ${fmt(p.y)}%`}</title></circle>)}
  </svg>
  <div className="veg-axes"><span>Official land cover, %</span><span>U-Net, % ↑</span></div>
  <p className="veg-note">Each dot is a district. Below the diagonal, U-Net finds less {v.metric==='vegetation'?'vegetation':names[v.metric].toLowerCase()} than the official map{gaps.length?`; the largest gaps are ${gaps.map(g=>`${g.name} (${signed(g.y-g.x)} pp)`).join(' and ')}`:''}.{v.metric==='vegetation'?` Across all ${agreement.tracts} tracts the mean absolute gap is ${fmt(agreement.mean_abs_pp)} pp, and ${fmt(agreement.within_5pp_share*100,0)}% are within 5 pp.`:''}</p>
  <h3 className="veg-h">Held-out test · {s.test_patches} patches, {s.test_blocks} spatial blocks</h3>
  <div className="veg-models">
   <div className="veg-models-head"><span/><span>Vegetation IoU</span><span>4-class mIoU</span></div>
   {s.models.map(m=><div key={m.id} className={m.id==='unet'?'chosen':''}><span>{m.label}{m.id==='unet'&&<small>Selected on validation</small>}</span>
    <span className="veg-meter"><i style={{width:`${m.vegetation_iou*100}%`}}/><b>{fmt(m.vegetation_iou,3)}</b></span>
    <span className="veg-meter">{m.mean_iou==null?<b className="muted">n/a</b>:<><i style={{width:`${m.mean_iou*100}%`}}/><b>{fmt(m.mean_iou,3)}</b></>}</span></div>)}
  </div>
  <p className="veg-note">NDVI separates vegetation from other land but cannot tell trees from grass, so it has no four-class score. Patches in different splits are at least {s.minimum_gap_m} m apart.</p>
  {cm&&<><h3 className="veg-h">Where U-Net confuses classes</h3>
   <div className="veg-matrix" role="table" aria-label="U-Net confusion matrix, share of each official class">
    <div role="row"><span role="columnheader">Official ↓ · U-Net →</span>{CLASSES.map(([label])=><span key={label} role="columnheader">{label}</span>)}</div>
    {cm.map((row,i)=>{const total=row.reduce((a,b)=>a+b,0);return <div role="row" key={i}><span role="rowheader">{CLASSES[i][0]}</span>{row.map((n,j)=>{const share=total?n/total:0;return <span role="cell" key={j} className={i===j?'hit':''} style={{background:`rgba(${i===j?'127,197,129':'236,242,250'},${(.08+share*.62).toFixed(3)})`}}>{fmt(share*100,0)}%</span>})}</div>})}
   </div>
   <p className="veg-note">Each row is an official class and sums to 100%. The largest confusions are {misses.map(x=>`${x.from.toLowerCase()} read as ${x.to.toLowerCase()} (${fmt(x.share*100,0)}%)`).join(' and ')}. Scores measure agreement with the official 2018 land cover, not field validation; the model was chosen before the test set was opened.</p></>}
  <div className="veg-links"><a href={`${base}/test_report.json`} download><Download size={14}/>Test report (JSON)</a><a href={`${base}/provenance.json`} download><Download size={14}/>Provenance (JSON)</a></div>
 </>;
}

// Pixels where the prediction class differs from the official reference, computed in the browser.
function useDisagreement(reference:string,prediction:string){
 const [out,setOut]=useState<{src:string;agree:number}|null>(null);
 useEffect(()=>{let live=true;setOut(null);
  const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
  Promise.all([load(reference),load(prediction)]).then(([a,b])=>{
   const size=a.naturalWidth,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d',{willReadFrequently:true})!;
   c.drawImage(a,0,0);const A=c.getImageData(0,0,size,size).data;c.clearRect(0,0,size,size);c.drawImage(b,0,0);const P=c.getImageData(0,0,size,size).data;
   const O=c.createImageData(size,size);let valid=0,same=0;
   for(let i=0;i<A.length;i+=4){if(!A[i+3])continue;valid++;if(A[i]===P[i]&&A[i+1]===P[i+1]&&A[i+2]===P[i+2])same++;else{O.data[i]=255;O.data[i+1]=79;O.data[i+2]=216;O.data[i+3]=235}}
   c.putImageData(O,0,0);if(live)setOut({src:canvas.toDataURL(),agree:valid?same/valid:0});
  }).catch(()=>{if(live)setOut(null)});
  return()=>{live=false}},[reference,prediction]);
 return out;
}

function Examples({v,onExample}:{v:VegetationState;onExample:(example:Example)=>void}){
 const examples=v.summary!.examples,current=examples[v.example],model=v.exampleModel==='unet'?'U-Net':'Random Forest';
 const diff=useDisagreement(researchAsset(current.reference),researchAsset(current[v.exampleModel]));
 return <>
  <p className="veg-note first">Six held-out test patches, 256 × 256 m each, chosen in ID order rather than by accuracy.</p>
  <div className="veg-thumbs">{examples.map((x,i)=><button key={x.id} aria-pressed={v.example===i} aria-label={`Test patch ${i+1}`} onClick={()=>v.setExample(i)}><img src={researchAsset(x.rgb)} alt="" loading="lazy"/></button>)}</div>
  <div className="veg-segment compact" role="group" aria-label="Prediction method"><div>{(['unet','random_forest'] as const).map(k=><button key={k} aria-pressed={v.exampleModel===k} onClick={()=>v.setExampleModel(k)}>{k==='unet'?'U-Net':'Random Forest'}</button>)}</div></div>
  <div className="veg-pair"><figure><img src={researchAsset(current.reference)} alt="Official reference classes"/><figcaption>Official reference</figcaption></figure><figure><img src={researchAsset(current[v.exampleModel])} alt={`${model} predicted classes`}/><figcaption>{model}</figcaption></figure></div>
  <div className="veg-legend-row">{CLASSES.map(([label,color])=><span key={label}><i style={{background:color}}/>{label}</span>)}</div>
  <figure className="veg-diff"><div><img src={researchAsset(current.rgb)} alt={`2017 aerial image of test patch ${v.example+1}`}/>{diff&&<img src={diff.src} alt=""/>}</div>
   <figcaption><span><i/>Where {model} differs from the reference</span><b>{diff?`${fmt(diff.agree*100)}% agree`:'…'}</b></figcaption></figure>
  <button className="veg-locate" onClick={()=>onExample(current)}><MapPin size={15}/>Show this patch on the map</button>
 </>;
}
