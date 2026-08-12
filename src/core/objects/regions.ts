export type RegionObject = {
  serverId: string
  region: Region
  displayName: string
  city: string
}

export function getRegionObjectFromID(serverId: string | null | undefined): RegionObject {
  let target = REGIONS.find(m => m.serverId === serverId);
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

export type Region = 'Unknown' | 'North America' | 'Europe' | 'Asia' | 'South America' | 'Oceania' | 'Japan'

export const REGIONS: RegionObject[] = [
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