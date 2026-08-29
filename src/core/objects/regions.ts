export type ServerObject = {
  serverId: string
  region: Region
  displayName: string
  city: string
}

// Translations
export type RegionObject = {
  appRegion: Region,
  apiRegion: AppAPIRegion,
  odyRegion: OdyRegion,
  name: string
}

export function getServerObjectFromID(serverId: string | null | undefined): ServerObject {
  let target = SERVERS.find(m => m.serverId === serverId);
  if (!target) {
    target = {
      serverId: '',
      region: 'Unknown',
      displayName: 'Unknown Region',
      city: '???'
    }
  }
  return target;
}

export function getRegionObjectFromAppRegion(appRegion: Region): RegionObject {
  let target = REGIONS.find(m => m.appRegion === appRegion);
  if (!target) { target = REGIONS[0] }; // Unknown
  return target;
}

// consistentcy.
export type Region = 'Unknown' | 'North America' | 'Europe' | 'Asia' | 'South America' | 'Oceania' | 'Japan';
export type AppAPIRegion = 'None' | 'Global' | 'NorthAmerica' | 'SouthAmerica' | 'Europe' | 'Japan' | 'Asia' | 'Oceania';
export type OdyRegion = 'Global' | 'NorthAmerica' | 'SouthAmerica' | 'Europe' | 'JapaneseLanguageText' | 'Asia' | 'Oceania';

export const REGIONS: RegionObject[] = [
  {
    name: 'Unknown', // must be first
    appRegion: 'Unknown',
    apiRegion: 'None',
    odyRegion: 'Global'
  },
  {
    name: 'Global',
    appRegion: 'Unknown',
    apiRegion: 'Global',
    odyRegion: 'Global'
  },
  {
    name: 'North America',
    appRegion: 'North America',
    apiRegion: 'NorthAmerica',
    odyRegion: 'NorthAmerica'
  },
  {
    name: 'South America',
    appRegion: 'South America',
    apiRegion: 'SouthAmerica',
    odyRegion: 'SouthAmerica'
  },
  {
    name: 'Europe',
    appRegion: 'Europe',
    apiRegion: 'Europe',
    odyRegion: 'Europe'
  },
  {
    name: 'Asia',
    appRegion: 'Asia',
    apiRegion: 'Asia',
    odyRegion: 'Asia'
  },
  {
    name: 'Oceania',
    appRegion: 'Oceania',
    apiRegion: 'Oceania',
    odyRegion: 'Oceania'
  },
  {
    name: 'Japan',
    appRegion: 'Japan',
    apiRegion: 'Japan',
    odyRegion: 'JapaneseLanguageText'
  }
]


export const SERVERS: ServerObject[] = [
  {
    serverId: 'us-east-2',
    region: 'North America',
    displayName: 'US East (Ohio)',
    city: 'Columbus, OH',
  },
  {
    serverId: 'us-east-1',
    region: 'North America',
    displayName: 'US East (N. Virginia)',
    city: 'Ashburn, VA',
  },
  {
    serverId: 'us-east-1-dfw-1a',
    region: 'North America',
    displayName: 'US Central (Dallas)',
    city: 'Dallas, TX',
  },
  {
    serverId: 'us-west-2-den-1a',
    region: 'North America',
    displayName: 'US West (Denver)',
    city: 'Denver, CO',
  },
  {
    serverId: 'us-west-1',
    region: 'North America',
    displayName: 'US West (N. California)',
    city: 'San Francisco, CA',
  },
  {
    serverId: 'eu-west-2',
    region: 'Europe',
    displayName: 'Europe (London)',
    city: 'London, UK',
  },
  {
    serverId: 'eu-central-1',
    region: 'Europe',
    displayName: 'Europe (Frankfurt)',
    city: 'Frankfurt, DE',
  },
  {
    serverId: 'ap-southeast-1',
    region: 'Asia',
    displayName: 'Asia Pacific (Singapore)',
    city: 'Singapore',
  },
  {
    serverId: 'ap-south-1',
    region: 'Asia',
    displayName: 'Asia Pacific (Mumbai)',
    city: 'Mumbai, India',
  },
  {
    serverId: 'sa-east-1',
    region: 'South America',
    displayName: 'South America (São Paulo)',
    city: 'São Paulo, Brazil',
  },
  {
    serverId: 'ap-southeast-2',
    region: 'Oceania',
    displayName: 'Asia Pacific (Sydney)',
    city: 'Sydney, AU',
  },
  {
    serverId: 'ap-northeast-1',
    region: 'Japan',
    displayName: 'Asia Pacific (Tokyo)',
    city: 'Tokyo, JP',
  },
]