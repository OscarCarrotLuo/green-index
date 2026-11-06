import {useEffect} from 'react';
import {ArrowUpRight,Sun,Building2,Leaf} from 'lucide-react';
import {lenses} from './data';

const components:{icon:typeof Sun;lens:keyof typeof lenses;name:string;text:string;formula:string}[]=[
 {icon:Sun,lens:'solar',name:'Solar PV',text:'Detected photovoltaic area divided by visible, observed rooftop area.',formula:'S = PV area / observed roof area'},
 {icon:Building2,lens:'buildings',name:'Building energy',text:'Observed annual site energy relative to a fixed reference for the same eligible properties and uses. Lower ratios indicate lower relative consumption.',formula:'R = observed energy / reference energy'},
 {icon:Leaf,lens:'vegetation',name:'Urban vegetation',text:'Tree, grass and shrub area divided by observed land area, excluding water.',formula:'V = vegetation / observed land'},
];
const pilot:{icon:typeof Sun;lens:keyof typeof lenses;name:string;formula:string;paragraphs:string[]}[]=[
 {icon:Leaf,lens:'vegetation',name:'Vegetation & tree canopy',formula:'V = (tree + grass/shrub) / observed non-water land',paragraphs:[
  'NDVI (Lab 3), Random Forest (Lab 6.2) and the Lab 8 U-Net use four-band 2017 NAIP. Official 2018 land cover supplies tree, grass/shrub, other-land and water labels; the U-Net extends the classroom architecture to four input bands and four classes.',
  'Training, validation and test patches are separated by spatial blocks at least 256 m apart. Validation chose the model before the test was opened. IoU measures agreement with the official reference, not field observation. The citywide map includes training areas and is not itself a test result.',
  'The atlas reports planning districts. Each 2018 census tract joins the district holding most of its area, and district values pool class area over observed land; they are not averages of tract percentages. No tree species, height or cooling effect is inferred.',
 ]},
 {icon:Building2,lens:'buildings',name:'Reported building energy',formula:'E = median site EUI within the same property use',paragraphs:[
  '2018 site EUI is summarised within primary property use after screening duplicate, multi-building and geographically conflicting records. Tract/use medians are mapped only where n ≥ 5. Lower EUI across different uses does not establish greater efficiency.',
  'The result uses disclosed property-use categories. It is not a land-use prediction or a citywide per-capita energy estimate.',
 ]},
 {icon:Sun,lens:'solar',name:'Rooftop solar development',formula:'Target S = visible PV area / observed roof area',paragraphs:[
  'The classroom U-Net uses weighted cross-entropy and is compared with Random Forest. Six Philadelphia sites support training and two development sites select settings. Labels remain provisional AI interpretations.',
  'A new independent holdout and reviewed roof masks are required before citywide inference. The frozen original RF test does not evaluate the revised U-Net, and no citywide solar prevalence has been calculated.',
 ]},
];

export default function MethodPage({focus}:{focus:string}){
 useEffect(()=>{const t=setTimeout(()=>{if(focus)document.getElementById(`method-${focus}`)?.scrollIntoView({behavior:'instant'})},0);return()=>clearTimeout(t)},[focus]);
 return <main className="page method-page">
  <header className="page-intro">
   <p className="page-kicker">Methodology</p>
   <h1>One city.<br/>Three perspectives.</h1>
   <p className="two-tone">A <strong>descriptive, conditional pilot index</strong> that brings together <strong>solar adoption, building energy and vegetation.</strong> Missing components stay missing.</p>
  </header>
  <ol className="method-components">{components.map(({icon:Icon,lens,name,text,formula},i)=><li key={name} className="frost"><span className="method-step">{String(i+1).padStart(2,'0')}</span><Icon size={22} color={lenses[lens].color}/><h2>{name}</h2><p>{text}</p><code>{formula}</code></li>)}</ol>
  <section className="method-index" aria-labelledby="method-index-title">
   <h2 id="method-index-title">Combining the three</h2>
   <div className="method-formula green-surface">GTI = [ P(S) + 100 − P(R) + P(V) ] / 3</div>
   <p>P is the percentile within a common, frozen reference, so energy enters inverted: lower relative consumption scores higher. Year, footprint and observation coverage must align before results are combined; a city with a missing component has no index.</p>
   <p>The catalog holds the 20 largest U.S. MSAs by Census Vintage 2025 population. Population order does not indicate green performance, and map centers are navigation anchors, not MSA boundaries.</p>
  </section>
  <section className="method-pilot" id="method-philadelphia" aria-labelledby="method-pilot-title">
   <div className="method-pilot-head green-surface"><p className="page-kicker">Philadelphia pilot · 2017–2018</p><h2 id="method-pilot-title">Philadelphia, layer by layer.</h2><p>Separate indicators describe different observed populations. The study covers the City of Philadelphia, not its full MSA, and no composite score or ranking is calculated.</p><a href="#/city/philadelphia/vegetation">Open the Philadelphia map<ArrowUpRight size={15}/></a></div>
   <div className="method-pilot-layers">{pilot.map(({icon:Icon,lens,name,formula,paragraphs})=><article key={name}><h3><Icon size={20} color={lenses[lens].color}/>{name}</h3><code>{formula}</code>{paragraphs.map(p=><p key={p}>{p}</p>)}</article>)}</div>
   <p className="method-footnote">All research describes 2017–2018. Basemap imagery is contextual and may differ in date. Downloads on the data page preserve the original research exports.</p>
  </section>
 </main>;
}
