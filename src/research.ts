import {useEffect,useState} from 'react';
export interface ResearchRow {
 scope_id:string;msa_code:string|number;year:number;scope_type:string;footprint_id:string;
 reference_id:string;score_status:'conditional_pilot'|'insufficient_data';
 solar_share:number|null;energy_ratio:number|null;vegetation_share:number|null;index_equal:number|null;
 solar_coverage:number|null;energy_coverage:number|null;vegetation_coverage:number|null;
}
export function useResearchRows(){
 const [rows,setRows]=useState<ResearchRow[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 useEffect(()=>{let live=true;fetch(`${import.meta.env.BASE_URL}data/msa_indices.json`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(!Array.isArray(data))throw Error();if(live)setRows(data.filter(r=>r&&typeof r==='object'))}).catch(()=>{if(live)setError(true)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
 return {rows,loading,error};
}
export function useResearch(msaCode:string){
 const data=useResearchRows();
 const rows=data.rows.filter(row=>String(row.msa_code)===msaCode);
 // Multiple study scopes require explicit selection; never silently aggregate them.
 return {row:rows.length===1?rows[0]:null,multiple:rows.length>1};
}
