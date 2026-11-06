import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import Home from './Home';
import Workspace from './Workspace';
import DataPage from './DataPage';
import MethodPage from './MethodPage';
import {Globe2,Search} from 'lucide-react';
import {cities,lenses,type City,type Lens} from './data';
import './styles.css';

function Mark(){return <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3 27 10v10L15 27 3 20V10Z"/><path d="m15 3 0 24M3 10l12 7 12-7M3 20l12-7 12 7"/></svg>}
function App(){
 const [route,setRoute]=useState(location.hash),[selected,setSelected]=useState(0);
 useEffect(()=>{let previous=location.hash;const f=()=>{const changeCity=previous.split('/')[2]!==location.hash.split('/')[2];previous=location.hash;const update=()=>{flushSync(()=>setRoute(location.hash));window.scrollTo(0,0)};if(changeCity&&document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(update);else update()};window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f)},[]);
 const parts=route.split('/');
 const city=cities.find(c=>parts[1]===c.id);
 const lens=(parts[2] in lenses?parts[2]:'satellite') as Lens;
 const navigate=(c:City)=>{location.hash=`/city/${c.id}`};
 // The route stores the city at segment 2; retain direct-link compatibility.
 const activeCity=parts[1]==='city'?cities.find(c=>parts[2]===c.id):city;
 const activeLens=(parts[3] in lenses?parts[3]:lens) as Lens;
 // Data collection and methodology are pages of their own: #/data[/city|find] and #/method[/philadelphia].
 const page=parts[1]==='data'?'data':parts[1]==='method'?'method':activeCity?'city':'atlas';
 const openCity=(c:City)=>{setSelected(cities.indexOf(c));navigate(c)};
 useEffect(()=>{document.title=activeCity?`${activeCity.name} · Green Transition Atlas`:page==='data'?'Data collection · Green Transition Atlas':page==='method'?'Methodology · Green Transition Atlas':'Green Transition Atlas'},[activeCity,page]);
 const current=(p:string)=>p===page||(p==='atlas'&&page==='city')?{className:'current','aria-current':'page' as const}:{};
 return <><header className={`site-header ${page==='city'?'over-map':''}`}><a href="#/" className="brand" aria-label="Green Transition Atlas home"><span className="brand-symbol"><Mark/></span><span>green transition<span className="brand-atlas">Atlas</span></span></a><nav aria-label="Main navigation"><a href="#/" {...current('atlas')}><Globe2 size={15}/>Atlas</a><a href="#/data" {...current('data')}>Data collection</a><a href="#/method" {...current('method')}>Methodology</a></nav><a href="#/data/find" className="catalog-action" aria-label="Find a city"><Search size={16}/><span>Find a city</span></a></header>
 {page==='data'?<DataPage focus={parts[2]??''}/>:page==='method'?<MethodPage focus={parts[2]??''}/>:activeCity?<Workspace key={activeCity.id} city={activeCity} lens={activeLens} onData={()=>{location.hash=`/data/${activeCity.id}`}}/>:<Home selected={selected} setSelected={setSelected} onSelect={openCity} onCatalog={()=>{location.hash='/data'}}/>}
 </>;
}
// Routes manage their own scroll position (top, or a focused card or section).
history.scrollRestoration='manual';
createRoot(document.getElementById('root')!).render(<App/>);
