import {useEffect,useRef,useState} from 'react';
import maplibregl, {type Map, type StyleSpecification, type GeoJSONSource} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {type City,type Lens} from './data';
import type {FeatureCollection,Feature,Polygon} from 'geojson';
const EMPTY:FeatureCollection={type:'FeatureCollection',features:[]};
const mapStyle:StyleSpecification={version:8,glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{
 satellite:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, GIS User Community'},
 context:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'<a href="https://openfreemap.org/">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'},
 solar:{type:'geojson',data:EMPTY}
},layers:[
 {id:'background',type:'background',paint:{'background-color':'#101c1b'}},
 {id:'land',type:'fill',source:'context','source-layer':'landcover',paint:{'fill-color':'#20302a','fill-opacity':.7}},
 {id:'water',type:'fill',source:'context','source-layer':'water',paint:{'fill-color':'#0b171b'}},
 {id:'roads',type:'line',source:'context','source-layer':'transportation',paint:{'line-color':'#53615a','line-width':.75,'line-opacity':.45}},
 {id:'satellite',type:'raster',source:'satellite',paint:{'raster-opacity':.82,'raster-saturation':-.24,'raster-contrast':.12,'raster-fade-duration':500}},
 {id:'building-context',type:'fill',source:'context','source-layer':'building',minzoom:11,paint:{'fill-color':'#adbbd4','fill-opacity':.01}},
 {id:'green-cover',type:'fill',source:'context','source-layer':'landcover',filter:['match',['get','class'],['wood','grass'],true,false],paint:{'fill-color':['match',['get','class'],'wood','#73bf86','#c8db8b'],'fill-opacity':0}},
 {id:'green-use',type:'fill',source:'context','source-layer':'landuse',filter:['match',['get','class'],['park','grass','forest','recreation_ground','garden','village_green'],true,false],paint:{'fill-color':'#92d7a4','fill-opacity':0}},
 {id:'building-data',type:'fill-extrusion',source:'context','source-layer':'building',minzoom:11,paint:{'fill-extrusion-color':'#b6c2dd','fill-extrusion-height':0,'fill-extrusion-base':0,'fill-extrusion-opacity':0}},
 {id:'building-outline',type:'line',source:'context','source-layer':'building',minzoom:12,paint:{'line-color':'#e0e5f2','line-width':.55,'line-opacity':0}},
 {id:'solar-area',type:'fill',source:'solar',paint:{'fill-color':'#f4ca73','fill-opacity':0}},
 {id:'solar-outline',type:'line',source:'solar',paint:{'line-color':'#ffe3a8','line-width':1,'line-opacity':0}},
 {id:'place-labels',type:'symbol',source:'context','source-layer':'place',minzoom:9,filter:['match',['get','class'],['suburb','neighbourhood','quarter'],true,false],layout:{'text-field':['coalesce',['get','name:en'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':11,'text-letter-spacing':.1,'text-transform':'uppercase','text-max-width':12},paint:{'text-color':'#dce4dc','text-halo-color':'#17241d','text-halo-width':1.5,'text-opacity':.78}}
]};
export default function CityMap({city,lens,opacity,satellite,threeD,command,onInspect}:{city:City;lens:Lens;opacity:number;satellite:boolean;threeD:boolean;command:{id:number;action:string};onInspect:(text:string)=>void}){
 const el=useRef<HTMLDivElement>(null),map=useRef<Map|null>(null),lensRef=useRef(lens),inspectRef=useRef(onInspect);const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null),[retry,setRetry]=useState(0);
 lensRef.current=lens;inspectRef.current=onInspect;
 useEffect(()=>{
  if(!el.current)return;let m:Map;let timer:ReturnType<typeof setTimeout>;let lastSignature='';
  try{m=new maplibregl.Map({container:el.current,style:mapStyle,center:city.center,zoom:13.7,pitch:0,bearing:-12,attributionControl:{compact:true},maxPitch:65,minZoom:3,maxZoom:19,canvasContextAttributes:{preserveDrawingBuffer:true}})}catch{setError('WebGL is unavailable. Try a browser with hardware acceleration enabled.');return}
  map.current=m;setError(null);setReady(false);m.addControl(new maplibregl.ScaleControl({maxWidth:100,unit:'metric'}),'top-right');
  timer=setTimeout(()=>{if(!m.areTilesLoaded())setError('Some map tiles are taking longer to load. Check your connection or retry.')},18000);
  m.on('load',()=>{setReady(true);clearTimeout(timer)});
  // Sample shapes are derived from contextual building geometry, never treated as detected PV.
  const sampleRoofs=()=>{
   if(!m.isStyleLoaded()||!m.getSource('context'))return;
   const roofs=m.queryRenderedFeatures({layers:['building-context']});const seen=new Set<string>();const samples:Feature<Polygon>[]=[];
   const rings=roofs.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates[0]]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates.map(p=>p[0]):[]);
   for(const ring of rings){if(ring.length<4)continue;const key=JSON.stringify(ring[0]);if(seen.has(key))continue;seen.add(key);const hash=Array.from(key).reduce((a,c)=>Math.imul(a,31)+c.charCodeAt(0)|0,7);if(Math.abs(hash)%17!==0)continue;const points=ring.slice(0,-1);const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cy=points.reduce((s,p)=>s+p[1],0)/points.length;samples.push({type:'Feature',properties:{name:'Illustrative rooftop PV sample',status:'illustrative'},geometry:{type:'Polygon',coordinates:[ring.map(p=>[cx+(p[0]-cx)*.55,cy+(p[1]-cy)*.55])]}});if(samples.length>=500)break}
   if(el.current)el.current.dataset.solarSamples=String(samples.length);
   const signature=JSON.stringify(samples.map(s=>s.geometry.coordinates[0][0]));if(signature===lastSignature)return;lastSignature=signature;(m.getSource('solar') as GeoJSONSource).setData({type:'FeatureCollection',features:samples});
  };
  m.on('idle',sampleRoofs);
  m.on('idle',()=>{if(el.current){el.current.dataset.renderedLens=lensRef.current;el.current.dataset.tilesLoaded=String(m.areTilesLoaded())}});
  m.on('movestart',()=>{if(el.current)el.current.dataset.tilesLoaded='false'});
  m.on('click',e=>{const current=lensRef.current;const ids=current==='solar'?['solar-area']:current==='buildings'?['building-data','building-context']:current==='vegetation'?['green-cover','green-use']:[];if(!ids.length)return;const fs=m.queryRenderedFeatures(e.point,{layers:ids});if(fs.length){const name=fs[0].properties?.name||fs[0].properties?.class;inspectRef.current(current==='solar'?'Illustrative rooftop PV sample':name?String(name):current==='buildings'?'Mapped building footprint':'Mapped green area')}});
  m.on('mousemove',e=>{const ids=lensRef.current==='solar'?['solar-area']:lensRef.current==='buildings'?['building-data']:lensRef.current==='vegetation'?['green-cover','green-use']:[];if(m.isStyleLoaded())m.getCanvas().style.cursor=ids.length&&m.queryRenderedFeatures(e.point,{layers:ids}).length?'pointer':''});
  let errorCount=0;m.on('error',()=>{errorCount++;if(errorCount>8)setError('A map service is unavailable. Retry to reconnect.')});
  return()=>{clearTimeout(timer);m.remove();map.current=null};
 },[city.id,retry]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;if(el.current)el.current.dataset.renderedLens='updating';const apply=()=>{if(!m.isStyleLoaded()){m.once('idle',apply);return;}const alpha=opacity/100;const change=(id:string,property:string,value:any)=>m.setPaintProperty(id,property,value);
  change('satellite','raster-opacity',satellite?(lens==='satellite'?alpha:alpha*.52):0);change('satellite','raster-saturation',lens==='satellite'?-.24:-.7);
  change('building-data','fill-extrusion-opacity',lens==='buildings'?alpha:0);change('building-outline','line-opacity',lens==='buildings'?alpha*.8:0);
  change('green-cover','fill-opacity',lens==='vegetation'?alpha:0);change('green-use','fill-opacity',lens==='vegetation'?alpha:0);
  change('solar-area','fill-opacity',lens==='solar'?alpha:0);change('solar-outline','line-opacity',lens==='solar'?alpha:0);};apply();return()=>{m.off('idle',apply)};
 },[lens,opacity,satellite,ready]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;const apply=()=>{if(!m.isStyleLoaded()){m.once('idle',apply);return;}const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;m.easeTo({pitch:threeD?52:0,duration:reduce?0:900});m.setPaintProperty('building-data','fill-extrusion-height',threeD?['coalesce',['get','render_height'],12]:0)};apply();return()=>{m.off('idle',apply)}},[threeD,ready]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;const opts={duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:650};if(command.action==='in')m.zoomIn(opts);else if(command.action==='out')m.zoomOut(opts);else m.flyTo({center:city.center,zoom:13.7,bearing:-12,...opts})},[command]);
 return <><div ref={el} className="city-map" aria-label={`${city.name} interactive map`}/>{!ready&&!error&&<div className="map-loading"><span className="loading-dot"/> Opening the urban landscape…</div>}{error&&<div className="map-error" role="alert">{error}<button onClick={()=>setRetry(n=>n+1)}>Retry map</button></div>}</>;
}
