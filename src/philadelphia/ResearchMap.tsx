import {useEffect,useRef,useState,type ReactNode} from 'react';
import maplibregl,{type Map,type StyleSpecification,type ExpressionSpecification,type GeoJSONSource} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {FeatureCollection} from 'geojson';
import type {Lens} from '../data';
import {researchAsset,vegetationBase} from './assets';
import {fitArea,fitCity,type Bounds} from './mapLayout';
export type Pick={name:string;geoid:string;vegetation:number;coverage:number;eui:number|null;n:number};
export type MapCommand={id:number;action:string;center?:[number,number];zoom?:number;bounds?:Bounds};
const EMPTY:FeatureCollection={type:'FeatureCollection',features:[]};
const hidden=['==',['get','id'],''] as ExpressionSpecification;

// One map for every Philadelphia lens: switching lenses toggles layers instead
// of rebuilding the map. Building tracts load only when that lens is first used.
export default function ResearchMap({lens,energyUse,opacity,satellite,command,onPick,onSite,districts,districtFill,pixels,tileBounds,selected,hovered,onHover,onDistrict,tooltip}:{lens:Lens;energyUse:string;opacity:number;satellite:boolean;command:MapCommand;onPick:(p:Pick|null)=>void;onSite:(id:string)=>void;districts:FeatureCollection|null;districtFill:ExpressionSpecification|null;pixels:boolean;tileBounds:[number,number,number,number]|null;selected:string;hovered:string;onHover:(id:string)=>void;onDistrict:(id:string)=>void;tooltip:(properties:Record<string,unknown>)=>ReactNode}){
 const container=useRef<HTMLDivElement>(null),map=useRef<Map|null>(null),tracts=useRef(false);
 const current=useRef({lens,energyUse,onPick,onSite,onHover,onDistrict,hovered});current.current={lens,energyUse,onPick,onSite,onHover,onDistrict,hovered};
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[tip,setTip]=useState<{x:number;y:number;properties:Record<string,unknown>}|null>(null);
 useEffect(()=>{
  if(!container.current)return;
  const style:StyleSpecification={version:8,glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{
   imagery:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Context imagery © Esri, Maxar, Earthstar Geographics'},
   districts:{type:'geojson',data:EMPTY,attribution:'Planning districts: City of Philadelphia'},
   'district-points':{type:'geojson',data:EMPTY},
   tracts:{type:'geojson',data:EMPTY,attribution:'Research: Philadelphia / PASDA · Census 2018'},
   sites:{type:'geojson',data:researchAsset('data/philadelphia/solar-sites.geojson')},
  },layers:[
   {id:'background',type:'background',paint:{'background-color':'#1b222b'}},
   {id:'imagery',type:'raster',source:'imagery',paint:{'raster-opacity':.38,'raster-saturation':-.65}},
   {id:'tract-fill',type:'fill',source:'tracts',layout:{visibility:'none'},paint:{'fill-color':'#59705f','fill-opacity':.8}},
   {id:'tract-line',type:'line',source:'tracts',layout:{visibility:'none'},paint:{'line-color':'#d5e8da','line-width':.6,'line-opacity':.38}},
   {id:'tract-selection',type:'line',source:'tracts',filter:['==',['get','GEOID'],''],paint:{'line-color':'#f5ead0','line-width':2.5}},
   {id:'district-fill',type:'fill',source:'districts',layout:{visibility:'none'},paint:{'fill-color':'#5f9e61','fill-opacity':.8}},
   {id:'district-line',type:'line',source:'districts',layout:{visibility:'none'},paint:{'line-color':'#0f151e','line-width':1.2,'line-opacity':.85}},
   {id:'district-hover',type:'line',source:'districts',filter:hidden,paint:{'line-color':'#ecf2fa','line-width':1.6}},
   {id:'district-selection',type:'line',source:'districts',filter:hidden,paint:{'line-color':'#f5ead0','line-width':3}},
   {id:'district-labels',type:'symbol',source:'district-points',layout:{visibility:'none','text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':12,'text-max-width':8,'text-padding':4},paint:{'text-color':'#ecf2fa','text-halo-color':'#0f151ecc','text-halo-width':1.4}},
   {id:'sites',type:'circle',source:'sites',layout:{visibility:'none'},paint:{'circle-color':'#f4cc75','circle-radius':8,'circle-stroke-color':'#162019','circle-stroke-width':2}},
  ]};
  let m:Map;try{m=new maplibregl.Map({container:container.current,style,center:[-75.14,40],zoom:10.4,attributionControl:{compact:true}})}catch{setError('Interactive map needs WebGL. All research results remain available in the panel.');return}
  map.current=m;setReady(false);m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'top-right');
  m.on('load',()=>{fitCity(m);setReady(true)});
  m.on('idle',()=>{if(container.current)container.current.dataset.loaded='true'});
  m.on('click',e=>{const c=current.current;
   if(c.lens==='solar'){const f=m.queryRenderedFeatures(e.point,{layers:['sites']})[0];if(f)c.onSite(String(f.properties.site));return}
   if(c.lens==='vegetation'){const f=m.queryRenderedFeatures(e.point,{layers:['district-fill']})[0];c.onDistrict(f?String(f.properties.id):'');return}
   if(c.lens!=='buildings')return;
   const f=m.queryRenderedFeatures(e.point,{layers:['tract-fill']})[0];if(!f){m.setFilter('tract-selection',['==',['get','GEOID'],'']);c.onPick(null);return}const p=f.properties;
   m.setFilter('tract-selection',['==',['get','GEOID'],p.GEOID]);c.onPick({name:String(p.NAME),geoid:String(p.GEOID),vegetation:Number(p.vegetation_pct),coverage:Number(p.observed_coverage_pct),eui:typeof p['eui_'+c.energyUse]==='number'?p['eui_'+c.energyUse]:null,n:Number(p['n_'+c.energyUse]||0)});
  });
  m.on('mousemove',e=>{if(!m.isStyleLoaded())return;const c=current.current;
   if(c.lens==='vegetation'){const f=m.queryRenderedFeatures(e.point,{layers:['district-fill']})[0];const id=f?String(f.properties.id):'';if(id!==c.hovered)c.onHover(id);setTip(f?{x:e.point.x,y:e.point.y,properties:f.properties}:null);m.getCanvas().style.cursor=f?'pointer':'';return}
   const layer=c.lens==='solar'?'sites':c.lens==='buildings'?'tract-fill':'';m.getCanvas().style.cursor=layer&&m.queryRenderedFeatures(e.point,{layers:[layer]}).length?'pointer':'';
  });
  m.on('mouseout',()=>{setTip(null);if(current.current.hovered)current.current.onHover('')});
  m.on('error',e=>{if('sourceId' in e&&['tracts','sites','classes'].includes(String(e.sourceId)))setError(e.sourceId==='classes'?'The pixel layer could not load. District values remain available.':'Research map data could not load. Reload the page to try again.')});
  return()=>{m.remove();map.current=null};
 },[]);
 useEffect(()=>{const m=map.current;if(!m||!ready||!districts)return;(m.getSource('districts') as GeoJSONSource).setData(districts);
  // One label per district at its precomputed interior point; polygon labels repeat across tiles.
  (m.getSource('district-points') as GeoJSONSource).setData({type:'FeatureCollection',features:districts.features.map(f=>({type:'Feature',properties:{name:f.properties?.name},geometry:{type:'Point',coordinates:f.properties?.label}}))});
 },[ready,districts]);
 // The U-Net display tiles join the style once their bounds are known.
 useEffect(()=>{const m=map.current;if(!m||!ready||!tileBounds||m.getSource('classes'))return;
  m.addSource('classes',{type:'raster',tiles:[`${location.origin}${vegetationBase}/tiles/{z}/{x}/{y}.png`],tileSize:256,minzoom:10,maxzoom:15,bounds:tileBounds,attribution:'U-Net classes from 2017 NAIP'});
  m.addLayer({id:'classes',type:'raster',source:'classes',layout:{visibility:'none'},paint:{'raster-resampling':'nearest','raster-opacity':.9}},'district-fill');
 },[ready,tileBounds]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;
  const apply=()=>{if(!m.isStyleLoaded()){m.once('idle',apply);return}
   if(lens==='buildings'&&!tracts.current){tracts.current=true;(m.getSource('tracts') as GeoJSONSource).setData(researchAsset('data/philadelphia/tracts.geojson'))}
   const show=(id:string,on:boolean)=>{if(m.getLayer(id))m.setLayoutProperty(id,'visibility',on?'visible':'none')};
   const veg=lens==='vegetation',outline=lens==='satellite'||lens==='solar';
   show('tract-fill',lens==='buildings');show('tract-line',lens==='buildings');show('tract-selection',lens==='buildings');
   show('district-fill',veg&&!pixels);show('district-line',veg||outline);show('district-labels',veg&&!pixels||lens==='satellite');show('district-hover',veg);show('district-selection',veg);
   show('classes',veg&&pixels);show('sites',lens==='solar');
   if(lens==='buildings')m.setPaintProperty('tract-fill','fill-color',['case',['==',['get','eui_'+energyUse],null],'#48524e',['interpolate',['linear'],['coalesce',['get','eui_'+energyUse],0],0,'#dbe7f4',50,'#b0c6e5',100,'#7a9bc8',200,'#446496',500,'#263d67']]);
   m.setPaintProperty('tract-fill','fill-opacity',opacity/100);
   if(districtFill)m.setPaintProperty('district-fill','fill-color',districtFill);
   m.setPaintProperty('district-fill','fill-opacity',opacity/100);
   m.setPaintProperty('district-line','line-color',veg&&!pixels?'#0f151e':'#ecf2fa');m.setPaintProperty('district-line','line-opacity',veg&&!pixels?.85:.32);
   if(m.getLayer('classes'))m.setPaintProperty('classes','raster-opacity',Math.min(1,opacity/100+.1));
   m.setPaintProperty('imagery','raster-opacity',satellite?(lens==='satellite'?.9:veg&&pixels?.6:.38):0);
   m.setPaintProperty('imagery','raster-saturation',lens==='satellite'?-.2:-.65);
  };apply();return()=>{m.off('idle',apply)};
 },[ready,lens,energyUse,opacity,satellite,districtFill,pixels,tileBounds]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;m.setFilter('district-hover',['==',['get','id'],hovered||'']);m.setFilter('district-selection',['==',['get','id'],selected||''])},[ready,hovered,selected]);
 useEffect(()=>{if(lens!=='vegetation'||pixels)setTip(null)},[lens,pixels]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
  if(command.action==='in')m.zoomIn({duration});else if(command.action==='out')m.zoomOut({duration});else if(command.action==='north')m.easeTo({bearing:0,pitch:0,duration});
  else if(command.action==='site'&&command.center)m.flyTo({center:command.center,zoom:17,padding:window.innerWidth<761?{top:220,bottom:300,left:25,right:25}:{top:160,bottom:200,left:60,right:520},duration});
  else if(command.action==='point'&&command.center)m.flyTo({center:command.center,zoom:command.zoom??15.5,duration});
  else if(command.action==='area'&&command.bounds)fitArea(m,command.bounds,duration,command.zoom);
  else fitCity(m,duration);
 },[command,ready]);
 return <><div ref={container} className="city-map" aria-label="Philadelphia research map"/>
  {tip&&lens==='vegetation'&&!pixels&&<div className="phl-tooltip" style={{left:tip.x,top:tip.y}} role="presentation">{tooltip(tip.properties)}</div>}
  {error&&<div className="phl-map-error" role="alert">{error}</div>}</>;
}
