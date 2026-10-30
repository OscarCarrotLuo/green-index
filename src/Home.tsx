import {useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowDown,ArrowUpRight,MapPin} from 'lucide-react';
import NationalMap from './NationalMap';
import CityArchive from './CityArchive';
import CityRanking from './CityRanking';
import {cities,type City} from './data';

export default function Home({selected,setSelected,onSelect,onCatalog}:{selected:number;setSelected:Dispatch<SetStateAction<number>>;onSelect:(city:City)=>void;onCatalog:()=>void}){
 const [hovered,setHovered]=useState<number|null>(null);
 const city=cities[hovered??selected];
 return <main className="home">
  <section className="hero" aria-label="United States metropolitan atlas">
   <div className="hero-copy"><h1>The green <br/>transition,<br/><em>mapped.</em></h1><p>Twenty cities. Three perspectives.<br/>A new way to read the urban landscape.</p><a className="explore-action" href="#city-archives" onClick={e=>{e.preventDefault();document.getElementById('city-archives')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}>Explore the atlas <span><ArrowDown size={18}/></span></a></div>
   <div className="national-map"><NationalMap selected={hovered??selected} onSelect={onSelect} onPreview={setHovered}/></div>
   <div className="map-selection glass"><span className="locator-icon"><MapPin size={19}/></span><div key={city.id} className="locator-copy"><strong>{city.name}</strong><span>{city.region} <i/> MSA {city.msaCode}</span></div><button onClick={()=>onSelect(city)} aria-label={`Open ${city.name} map`}><ArrowUpRight size={20}/></button></div>
   <div className="atlas-scope"><span className="scope-orbit" aria-hidden="true"/>The 20 largest U.S. metropolitan areas</div>
  </section>
  <CityArchive selected={selected} setSelected={setSelected} onSelect={onSelect} onCatalog={onCatalog}/>
  <CityRanking onSelect={onSelect}/>
 </main>;
}
