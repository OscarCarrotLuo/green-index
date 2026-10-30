import fs from 'node:fs';
import {geoAlbersUsa,geoPath,geoContains} from 'd3-geo';
import {feature,mesh} from 'topojson-client';
const topo=JSON.parse(fs.readFileSync(new URL('../public/data/us-states.json',import.meta.url),'utf8'));
const projection=geoAlbersUsa().scale(1120).translate([500,260]);
const states=feature(topo,topo.objects.states);
const land={type:'FeatureCollection',features:states.features.filter(f=>!['02','15','72'].includes(String(f.id).padStart(2,'0')))};
const dots=[];
for(let y=35;y<490;y+=7)for(let x=10;x<990;x+=7){const ll=projection.invert([x,y]);if(ll&&geoContains(land,ll))dots.push([x,y,.8+((x*13+y*7)%11)/20]);}
const borders=geoPath(projection)(mesh(topo,topo.objects.states,(a,b)=>a!==b));
fs.writeFileSync(new URL('../public/data/national-map.json',import.meta.url),JSON.stringify({dots,borders}));
console.log(`Prepared ${dots.length} national map dots offline.`);
