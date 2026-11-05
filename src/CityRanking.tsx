import {memo} from 'react';
import {cities,type City} from './data';
import {useResearchRows} from './research';
import {rankCities} from './ranking';

const GRID=[100,75,50,25,0];
// Until comparable scores exist, the chart shows a labelled schematic silhouette.
// It is not attached to any city, so it cannot be read as a result.
const PREVIEW=cities.map((_,i)=>84-i*2.9);

export default memo(function CityRanking({onSelect}:{onSelect:(city:City)=>void}){
 const {rows,loading,error}=useResearchRows();
 const ranking=rankCities(cities.map(c=>c.msaCode),rows);
 const status=loading?'Loading index…':error?'Index unavailable':ranking.comparable?`${ranking.scored} cities · common reference`:ranking.incompatible?'Comparable study scopes required':'Scores pending';
 const scored=ranking.comparable?ranking.entries.filter(entry=>entry.score!==null):[];
 return <section className="city-ranking" aria-label="City green index ranking">
  <div className="ranking-title"><h2>City green index</h2><p>One shared lens on urban change.</p><span className="ranking-status"><span className={`status-dot ${ranking.comparable?'filled':''}`}/>{status}</span><p className="ranking-note">{ranking.comparable?`Validated values within a common reference.${scored.length<cities.length?` ${cities.length-scored.length} areas have no comparable score.`:''}`:'Validated results will appear here. Population order is not a green ranking.'}</p></div>
  <figure className="ranking-chart glass">
   <figcaption className="chart-head"><span>{scored.length?`${scored.length} metropolitan areas, ranked`:'Twenty metropolitan areas'}</span><span>GTI / 100</span></figcaption>
   <div className="chart-plot">
    {GRID.map(value=><span key={value} className={`chart-grid ${value===0?'base':''}`} style={{bottom:`${value}%`}}><i>{value}</i></span>)}
    {scored.length?<ol className="chart-bars">{scored.map(entry=>{const city=cities.find(c=>c.msaCode===entry.msaCode)!,score=entry.score!;return <li key={city.id}><button onClick={()=>onSelect(city)} aria-label={`${city.name}, rank ${entry.rank}, index ${score.toFixed(1)}. Explore city`} style={{'--score':`${score}%`} as React.CSSProperties}><span className="chart-bar"/><span className="chart-tip">{city.name}<b>{score.toFixed(1)}</b></span><span className="chart-label">{city.short}</span></button></li>})}</ol>
    :<><div className="chart-bars preview" aria-hidden="true">{PREVIEW.map((height,i)=><span key={i} style={{'--score':`${height}%`} as React.CSSProperties}><span className="chart-bar"/></span>)}</div><span className="chart-badge"><span className="status-dot"/>Illustrative layout · no scores yet</span></>}
   </div>
   <p className="chart-axis-note">{scored.length?'Select a bar to open that city.':'One bar per metropolitan area, ordered by score once validated results arrive.'}</p>
  </figure>
 </section>;
});
