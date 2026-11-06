import type {Map} from 'maplibre-gl';
export type Bounds=[[number,number],[number,number]];
const CITY:Bounds=[[-75.283,39.866],[-74.954,40.139]];
/** Space the docked results panel, heading, legend and lens rail leave for the city. */
export function mapPadding(map:Map){
 const width=map.getContainer().clientWidth;
 if(width<761)return {top:190,bottom:250,left:24,right:24};
 const page=Math.min(80,Math.max(28,width*.045)),panel=width<1100?360:400;
 return {top:200,bottom:170,left:page+60,right:panel+page+48};
}
export function fitArea(map:Map,bounds:Bounds,duration=0,maxZoom=15.5){
 // fitBounds already incorporates its padding; clear persistent camera padding first.
 map.setPadding({top:0,bottom:0,left:0,right:0});
 map.fitBounds(bounds,{padding:mapPadding(map),duration,bearing:0,pitch:0,maxZoom});
}
export function fitCity(map:Map,duration=0){fitArea(map,CITY,duration)}
