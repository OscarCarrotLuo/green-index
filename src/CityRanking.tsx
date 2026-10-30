import {ArrowUpRight} from 'lucide-react';
import {cities,type City} from './data';
import {useResearchRows} from './research';
import {rankCities} from './ranking';

export default function CityRanking({onSelect}:{onSelect:(city:City)=>void}){
 const {rows,loading,error}=useResearchRows();
 const ranking=rankCities(cities.map(c=>c.msaCode),rows);
 const status=loading?'Loading index…':error?'Index unavailable':ranking.comparable?`${ranking.scored} cities · common reference`:ranking.incompatible?'Comparable study scopes required':'Scores pending';
 return <section className="city-ranking" aria-label="City green index ranking"><div className="ranking-title"><h2>City green index</h2><p>One shared lens on urban change.</p><span className="ranking-status"><span className="status-dot"/>{status}</span></div><div className="ranking-surface glass"><div className="ranking-labels"><span>Metropolitan areas</span><span>GTI / 100</span></div><ol className="ranking-list" tabIndex={0} aria-label="Green index for 20 metropolitan areas; scroll to explore">{ranking.entries.map(entry=>{const city=cities.find(c=>c.msaCode===entry.msaCode)!;return <li key={city.id}><button onClick={()=>onSelect(city)} aria-label={`Explore ${city.name}, ${entry.rank?`rank ${entry.rank}`:'not ranked'}`}><span className="rank-position">{entry.rank?String(entry.rank).padStart(2,'0'):'—'}</span><span className="rank-city">{city.name}<small>{city.region} · MSA {city.msaCode}</small></span><span className="rank-score">{entry.score===null?'—':entry.score.toFixed(1)}</span><ArrowUpRight size={16}/></button></li>})}</ol><p className="ranking-note">{ranking.comparable?'Validated values within a common reference.':'Validated results will appear here. Population order is not a green ranking.'}</p></div></section>;
}
