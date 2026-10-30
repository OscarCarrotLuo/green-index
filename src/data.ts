export type City = {
  id: string; name: string; region: string; msaCode: string; msaName: string;
  center: [number, number]; short: string; description: string;
  population: number; populationRank: number;
};
export type Lens = 'satellite' | 'solar' | 'buildings' | 'vegetation';
export const populationSource = {
  "publisher": "U.S. Census Bureau",
  "vintage": 2025,
  "asOf": "2025-07-01",
  "url": "https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-metro-and-micro-statistical-areas.html",
  "download": "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/metro/totals/cbsa-est2025-alldata.csv",
  "selection": "20 largest metropolitan statistical areas by July 1, 2025 population; metropolitan divisions and counties excluded",
  "navigationCenters": "Representative central-city locations; not MSA centroids or boundaries"
};
export const cities: City[] = [
  {
    "id": "new-york",
    "name": "New York",
    "region": "NY · NJ",
    "msaCode": "35620",
    "msaName": "New York-Newark-Jersey City, NY-NJ",
    "center": [
      -73.9857,
      40.7484
    ],
    "short": "NYC",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 20112448,
    "populationRank": 1
  },
  {
    "id": "los-angeles",
    "name": "Los Angeles",
    "region": "CA",
    "msaCode": "31080",
    "msaName": "Los Angeles-Long Beach-Anaheim, CA",
    "center": [
      -118.2437,
      34.0522
    ],
    "short": "LA",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 12844441,
    "populationRank": 2
  },
  {
    "id": "chicago",
    "name": "Chicago",
    "region": "IL · IN",
    "msaCode": "16980",
    "msaName": "Chicago-Naperville-Elgin, IL-IN",
    "center": [
      -87.6298,
      41.8781
    ],
    "short": "CHI",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 9434123,
    "populationRank": 3
  },
  {
    "id": "dallas-fort-worth",
    "name": "Dallas–Fort Worth",
    "region": "TX",
    "msaCode": "19100",
    "msaName": "Dallas-Fort Worth-Arlington, TX",
    "center": [
      -96.797,
      32.7767
    ],
    "short": "DFW",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 8477157,
    "populationRank": 4
  },
  {
    "id": "houston",
    "name": "Houston",
    "region": "TX",
    "msaCode": "26420",
    "msaName": "Houston-Pasadena-The Woodlands, TX",
    "center": [
      -95.3698,
      29.7604
    ],
    "short": "HOU",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 7904627,
    "populationRank": 5
  },
  {
    "id": "atlanta",
    "name": "Atlanta",
    "region": "GA",
    "msaCode": "12060",
    "msaName": "Atlanta-Sandy Springs-Roswell, GA",
    "center": [
      -84.388,
      33.749
    ],
    "short": "ATL",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 6482182,
    "populationRank": 6
  },
  {
    "id": "washington",
    "name": "Washington",
    "region": "DC · VA · MD · WV",
    "msaCode": "47900",
    "msaName": "Washington-Arlington-Alexandria, DC-VA-MD-WV",
    "center": [
      -77.0369,
      38.9072
    ],
    "short": "DC",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 6465724,
    "populationRank": 7
  },
  {
    "id": "miami",
    "name": "Miami",
    "region": "FL",
    "msaCode": "33100",
    "msaName": "Miami-Fort Lauderdale-West Palm Beach, FL",
    "center": [
      -80.1918,
      25.7617
    ],
    "short": "MIA",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 6391072,
    "populationRank": 8
  },
  {
    "id": "philadelphia",
    "name": "Philadelphia",
    "region": "PA · NJ · DE · MD",
    "msaCode": "37980",
    "msaName": "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD",
    "center": [
      -75.1652,
      39.9526
    ],
    "short": "PHL",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 6329118,
    "populationRank": 9
  },
  {
    "id": "phoenix",
    "name": "Phoenix",
    "region": "AZ",
    "msaCode": "38060",
    "msaName": "Phoenix-Mesa-Chandler, AZ",
    "center": [
      -112.074,
      33.4484
    ],
    "short": "PHX",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 5228938,
    "populationRank": 10
  },
  {
    "id": "boston",
    "name": "Boston",
    "region": "MA · NH",
    "msaCode": "14460",
    "msaName": "Boston-Cambridge-Newton, MA-NH",
    "center": [
      -71.0589,
      42.3601
    ],
    "short": "BOS",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 5034221,
    "populationRank": 11
  },
  {
    "id": "riverside",
    "name": "Riverside",
    "region": "CA",
    "msaCode": "40140",
    "msaName": "Riverside-San Bernardino-Ontario, CA",
    "center": [
      -117.3962,
      33.9533
    ],
    "short": "RIV",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 4769007,
    "populationRank": 12
  },
  {
    "id": "san-francisco",
    "name": "San Francisco",
    "region": "CA",
    "msaCode": "41860",
    "msaName": "San Francisco-Oakland-Fremont, CA",
    "center": [
      -122.4194,
      37.7749
    ],
    "short": "SF",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 4630041,
    "populationRank": 13
  },
  {
    "id": "detroit",
    "name": "Detroit",
    "region": "MI",
    "msaCode": "19820",
    "msaName": "Detroit-Warren-Dearborn, MI",
    "center": [
      -83.0458,
      42.3314
    ],
    "short": "DET",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 4390913,
    "populationRank": 14
  },
  {
    "id": "seattle",
    "name": "Seattle",
    "region": "WA",
    "msaCode": "42660",
    "msaName": "Seattle-Tacoma-Bellevue, WA",
    "center": [
      -122.3321,
      47.6062
    ],
    "short": "SEA",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 4161883,
    "populationRank": 15
  },
  {
    "id": "minneapolis",
    "name": "Minneapolis",
    "region": "MN · WI",
    "msaCode": "33460",
    "msaName": "Minneapolis-St. Paul-Bloomington, MN-WI",
    "center": [
      -93.265,
      44.9778
    ],
    "short": "MSP",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 3790295,
    "populationRank": 16
  },
  {
    "id": "tampa",
    "name": "Tampa",
    "region": "FL",
    "msaCode": "45300",
    "msaName": "Tampa-St. Petersburg-Clearwater, FL",
    "center": [
      -82.4572,
      27.9506
    ],
    "short": "TPA",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 3418895,
    "populationRank": 17
  },
  {
    "id": "san-diego",
    "name": "San Diego",
    "region": "CA",
    "msaCode": "41740",
    "msaName": "San Diego-Chula Vista-Carlsbad, CA",
    "center": [
      -117.1611,
      32.7157
    ],
    "short": "SD",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 3282248,
    "populationRank": 18
  },
  {
    "id": "denver",
    "name": "Denver",
    "region": "CO",
    "msaCode": "19740",
    "msaName": "Denver-Aurora-Centennial, CO",
    "center": [
      -104.9903,
      39.7392
    ],
    "short": "DEN",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 3092037,
    "populationRank": 19
  },
  {
    "id": "orlando",
    "name": "Orlando",
    "region": "FL",
    "msaCode": "36740",
    "msaName": "Orlando-Kissimmee-Sanford, FL",
    "center": [
      -81.3792,
      28.5383
    ],
    "short": "ORL",
    "description": "Explore the metropolitan landscape through three perspectives.",
    "population": 2957672,
    "populationRank": 20
  }
];
export const lenses = {
  satellite:{name:'Satellite',label:'The city, from above', description:'Explore the urban landscape in satellite imagery.',color:'#e2e9e3',metric:'Green Transition Index',unit:'/ 100',legend:['Satellite imagery','Geographic context'],source:'Esri World Imagery · contextual basemap'},
  solar:{name:'Solar PV',label:'The rooftop opportunity', description:'Explore rooftop photovoltaic coverage and the solar detection layer.',color:'#f4cc75',metric:'Solar coverage',unit:'% of observed roof',legend:['Rooftop PV samples','Illustrative locations'],source:'Illustrative PV polygons · no model output connected'},
  buildings:{name:'Buildings',label:'Read the built environment', description:'Explore building form. Energy performance will join each eligible property.',color:'#b3bfdc',metric:'Building energy ratio',unit:'observed / reference',legend:['Building footprints','Context only · not energy'],source:'OpenStreetMap buildings via OpenFreeMap · contextual footprints'},
  vegetation:{name:'Vegetation',label:'Make room for green', description:'Explore the mapped green landscape, from neighborhood parks to urban woodland.',color:'#a8dbaf',metric:'Vegetation coverage',unit:'% of observed land',legend:['Mapped green areas','Context only · not model results'],source:'OpenStreetMap land cover via OpenFreeMap · contextual polygons'}
} as const;
export function satelliteThumbnail(city:City){
  const [x,y]=city.center;
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${x-.07},${y-.035},${x+.07},${y+.035}&bboxSR=4326&imageSR=3857&size=640,360&format=jpg&f=image`;
}
