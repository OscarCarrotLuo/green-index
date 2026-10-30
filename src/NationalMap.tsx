import {useEffect,useState} from 'react';
import {geoAlbersUsa} from 'd3-geo';
import {cities,type City} from './data';

const projection=geoAlbersUsa().scale(1120).translate([500,260]);
// Label endpoints are in the same projected coordinates as the geographic dots.
// Explicit callouts keep the Northeast, Southern California and Florida readable.
const labels:Record<string,[number,number,'start'|'end']>={
  'new-york':[899,178,'start'],'los-angeles':[94,286,'end'],
  chicago:[606,228,'end'],'dallas-fort-worth':[449,351,'end'],
  houston:[480,465,'end'],atlanta:[731,330,'start'],
  washington:[849,264,'start'],miami:[837,493,'start'],
  philadelphia:[899,213,'start'],phoenix:[291,365,'start'],
  boston:[906,129,'start'],riverside:[218,294,'start'],
  'san-francisco':[148,202,'start'],detroit:[726,147,'start'],
  seattle:[211,48,'start'],minneapolis:[522,99,'end'],
  tampa:[691,471,'end'],'san-diego':[175,399,'start'],
  denver:[409,208,'start'],orlando:[808,409,'start'],
};
export default function NationalMap({selected,onSelect,onPreview}:{selected:number;onSelect:(city:City)=>void;onPreview?:(index:number|null)=>void}){
  const [map,setMap]=useState<{dots:[number,number,number][];borders:string}|null>(null);
  const [error,setError]=useState(false);
  useEffect(()=>{const controller=new AbortController();fetch(`${import.meta.env.BASE_URL}data/national-map.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setMap).catch(e=>{if(e.name!=='AbortError')setError(true)});return()=>controller.abort()},[]);
  return <svg className="usa-map top20-map" viewBox="0 0 1000 530" aria-label="The 20 largest U.S. metropolitan areas by 2025 population. Select a city to open its archive.">
    <defs><radialGradient id="map-light"><stop stopColor="#bad4b7"/><stop offset="1" stopColor="#536b5a"/></radialGradient></defs>

    {map?<><path d={map.borders} className="state-borders"/>{map.dots.map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill="url(#map-light)" opacity={.45+((i*17)%50)/100}/>)}</>:<text x="500" y="280" textAnchor="middle" fill="#b4c5b9">{error?'Map unavailable — choose a city below.':'Drawing the atlas…'}</text>}
    {cities.map((city,i)=>{
      const [x,y]=projection(city.center)!;
      const [lx,ly,anchor]=labels[city.id];
      const end=lx+(anchor==='end'?7:-7);
      return <a key={city.id} href={`#/city/${city.id}`} aria-label={`Explore ${city.name}, population rank ${city.populationRank}`} onMouseEnter={()=>onPreview?.(i)} onMouseLeave={()=>onPreview?.(null)} onFocus={()=>onPreview?.(i)} onBlur={()=>onPreview?.(null)} onClick={e=>{e.preventDefault();onSelect(city)}} className={`map-city ${selected===i?'active':''}`}>
        <title>{city.msaName} · {city.population.toLocaleString('en-US')} residents</title>
        <path d={`M${x},${y} L${x+(end-x)*.48},${ly-4} H${end}`} className="marker-leader"/>
        <circle cx={x} cy={y} r="13" className="marker-aura"/><circle cx={x} cy={y} r="6.5" className="marker-ring"/><circle cx={x} cy={y} r="2.6" className="marker-core"/>
        <circle cx={x} cy={y} r="12" fill="transparent" pointerEvents="all"/>
        <text x={lx} y={ly} textAnchor={anchor}>{city.name}</text>
      </a>;
    })}
  </svg>;
}
