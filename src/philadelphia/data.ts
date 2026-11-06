import {useEffect,useState} from 'react';
import {researchAsset} from './assets';
export type EnergyUse={id:string;name:string;n:number;median:number;q25:number;q75:number;displayable_tracts:number};
export type SolarSite={group_id:string;center:[number,number];reference_coverage_pct:number;predicted_coverage_pct:number;coverage_error_pp:number};
export type PhiladelphiaData={period:string;scope:string;vegetation:{coverage_pct:number;source_coverage_pct:number;area_km2:number;land_km2:number;tracts:number};energy:{properties:number;groups:number;groups_n10:number;uses:EnergyUse[]};solar:{metrics:{iou:number;precision:number;recall:number;pv_area_bias_fraction:number};weight:number;best_epoch:number;comparison:{label:string;iou:number}[];sites:SolarSite[];old_test_iou:number;human_reviewed:false;citywide_coverage_pct:null;test_evaluated:false}};
export function usePhiladelphia(){
 const [data,setData]=useState<PhiladelphiaData|null>(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();setError(false);fetch(researchAsset('data/philadelphia/summary.json'),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Research export unavailable');return r.json()}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(true)});return()=>controller.abort()},[attempt]);
 return {data,error,retry:()=>setAttempt(n=>n+1)};
}
export const SOURCE_LINKS=[
 {label:'Philadelphia land cover',url:'https://www.pasda.psu.edu/uci/DataSummary.aspx?dataset=1587'},
 {label:'Energy benchmarking',url:'https://opendataphilly.org/datasets/large-building-energy-benchmarking-data/'},
 {label:'2018 aerial imagery',url:'https://imagery.pasda.psu.edu/arcgis/rest/services/pasda/PhiladelphiaImagery2018/MapServer'},
 {label:'2018 tract boundaries',url:'https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.2018.html'}
];
