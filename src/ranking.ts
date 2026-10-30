import type {ResearchRow} from './research';

export type RankedCity = {msaCode:string; score:number|null; rank:number|null};
export function rankCities(msaCodes:string[], rows:ResearchRow[]) {
  const entries=msaCodes.map(msaCode=>{
    const matches=rows.filter(row=>String(row.msa_code)===msaCode);
    const row=matches.length===1?matches[0]:null;
    const score=row?.score_status==='conditional_pilot'&&typeof row.index_equal==='number'&&Number.isFinite(row.index_equal)&&row.index_equal>=0&&row.index_equal<=100?row.index_equal:null;
    return {msaCode,row,score};
  });
  const scored=entries.filter(e=>e.score!==null);
  const referenceKeys=new Set(scored.map(e=>JSON.stringify([e.row!.year,e.row!.reference_id,e.row!.scope_type])));
  const completeMetadata=scored.every(e=>Number.isFinite(e.row!.year)&&e.row!.reference_id&&e.row!.scope_type);
  const comparable=scored.length>=2&&referenceKeys.size===1&&completeMetadata;
  const ranked:RankedCity[]=entries.map(e=>({msaCode:e.msaCode,score:e.score,rank:comparable&&e.score!==null?1+scored.filter(other=>other.score!>e.score!).length:null}));
  if(comparable)ranked.sort((a,b)=>(a.rank??Infinity)-(b.rank??Infinity));
  return {entries:ranked,comparable,scored:scored.length,incompatible:scored.length>=2&&!comparable};
}
