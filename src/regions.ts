import {cities,type City} from './data';

// Census Bureau regions of each metro's principal city. Grouping the archive by
// region keeps the population order from reading as a performance ranking.
export const regionOrder=['Northeast','Midwest','South','West'] as const;
export type Region=typeof regionOrder[number];
const regionOf:Record<string,Region>={
  'new-york':'Northeast',philadelphia:'Northeast',boston:'Northeast',
  chicago:'Midwest',detroit:'Midwest',minneapolis:'Midwest',
  'dallas-fort-worth':'South',houston:'South',atlanta:'South',washington:'South',miami:'South',tampa:'South',orlando:'South',
  'los-angeles':'West',phoenix:'West',riverside:'West','san-francisco':'West',seattle:'West','san-diego':'West',denver:'West',
};
export const censusRegion=(city:City)=>regionOf[city.id];

/** Archive order: by region, then by population rank within each region. */
export const rack=[...cities].sort((a,b)=>regionOrder.indexOf(censusRegion(a))-regionOrder.indexOf(censusRegion(b))||a.populationRank-b.populationRank);
const slots=cities.map(city=>rack.indexOf(city));
/** Position of a `cities` index within the archive rack. */
export const rackSlot=(cityIndex:number)=>slots[cityIndex];
/** `cities` index of an archive rack position; wraps around the rack. */
export const cityAtSlot=(slot:number)=>cities.indexOf(rack[((slot%rack.length)+rack.length)%rack.length]);
