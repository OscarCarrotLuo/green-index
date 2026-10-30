import {ArrowUpRight} from 'lucide-react';
import {cities,type City} from './data';
import {useResearchRows} from './research';
import {rankCities} from './ranking';

export default function CityRanking({onSelect}:{onSelect:(city:City)=>void}){
  const {rows,loading,error}=useResearchRows();
  const ranking=rankCities(cities.map(c=>c.msaCode),rows);
  const status=loading?'Loading index…':error?'Index unavailable':ranking.comparable?`${ranking.scored} cities · common reference`:ranking.incompatible?'Comparable study scopes required':'Scores pending';
  return <section className="city-ranking glass" aria-label="City green index ranking">
    <div className="ranking-title"><h2>City green index</h2><p>Metropolitan ranking <span>GTI / 100</span></p></div>
    <ol className="ranking-list" tabIndex={0} aria-label="Green index for 20 metropolitan areas; scroll to explore">{ranking.entries.map(entry=>{const city=cities.find(c=>c.msaCode===entry.msaCode)!;return <li key={city.id}><button onClick={()=>onSelect(city)} aria-label={`Explore ${city.name}, ${entry.rank?`rank ${entry.rank}`:'not ranked'}`}><span className="rank-position">{entry.rank?String(entry.rank).padStart(2,'0'):'—'}</span><span className="rank-city">{city.name}<small>MSA {city.msaCode}</small></span><span className="rank-score">{entry.score===null?'—':entry.score.toFixed(1)}</span><ArrowUpRight size={15}/></button></li>})}</ol>
    <div className="ranking-status"><span className="status-dot"/>{status}</div>
  </section>;
}
