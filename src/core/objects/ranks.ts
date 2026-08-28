export type Rank = 
  | 'Unranked'
  | 'Rookie' 
  | 'Mid Rookie' 
  | 'High Rookie' 
  | 'Bronze' 
  | 'Mid Bronze' 
  | 'High Bronze' 
  | 'Silver' 
  | 'Mid Silver' 
  | 'High Silver' 
  | 'Gold' 
  | 'Mid Gold' 
  | 'High Gold' 
  | 'Platinum' 
  | 'Mid Platinum' 
  | 'High Platinum' 
  | 'Diamond' 
  | 'Mid Diamond' 
  | 'High Diamond' 
  | 'Challenger'
  | 'Mid Challenger'
  | 'High Challenger'
  | 'Omega'
  | 'Pro League'

export type RankObject = { 
  name: Rank
  short: string
  key: string
  image: string
  color: string
  threshold: number
}

export function getRankFromLP(lp: number | null | undefined): RankObject {
  if (!lp) return ranks[0] as RankObject;
  
  let rankIndex = 0
  
  for (let i = 1; i < ranks.length; i++) {
    if (lp >= ranks[i].threshold) {
      rankIndex = i
    } else {
      break // break the loop when the threshold is higher than the input value
    }
  }

  const rankObject = ranks[rankIndex] as RankObject

  return rankObject
}


const ranks: RankObject[] = [
  {
    threshold: 0,
    name: 'Unranked',
    short: 'Unranked',
    key: 'unranked',
    image: '/ranks/Unranked-Blobbo.png',
    color: '#ECDCD0'
  },
  {
    threshold: 800,
    name: 'Rookie',
    short: 'Rookie',
    key: 'rookie_low',
    image: '/ranks/Rookie_Low.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 900,
    name: 'Mid Rookie',
    short: 'M. Rookie',
    key: 'rookie_mid',
    image: '/ranks/Rookie_Mid.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 1000,
    name: 'High Rookie',
    short: 'H. Rookie',
    key: 'rookie_high',
    image: '/ranks/Rookie_High.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 1100,
    name: 'Bronze',
    short: 'Bronze',
    key: 'bronze_low',
    image: '/ranks/Bronze_Low.webp',
    color: '#C88C59'
  },
  {
    threshold: 1200,
    name: 'Mid Bronze',
    short: 'M. Bronze',
    key: 'bronze_mid',
    image: '/ranks/Bronze_Mid.webp',
    color: '#C88C59'
  },
  {
    threshold: 1300,
    name: 'High Bronze',
    short: 'H. Bronze',
    key: 'bronze_high',
    image: '/ranks/Bronze_High.webp',
    color: '#C88C59'
  },
  {
    threshold: 1400,
    name: 'Silver',
    short: 'Silver',
    key: 'silver_low',
    image: '/ranks/Silver_Low.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1500,
    name: 'Mid Silver',
    short: 'M. Silver',
    key: 'silver_mid',
    image: '/ranks/Silver_Mid.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1600,
    name: 'High Silver',
    short: 'H. Silver',
    key: 'silver_high',
    image: '/ranks/Silver_High.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1700,
    name: 'Gold',
    short: 'Gold',
    key: 'gold_low',
    image: '/ranks/Gold_Low.webp',
    color: '#F1E385'
  },
  {
    threshold: 1800,
    name: 'Mid Gold',
    short: 'Mid Gold',
    key: 'gold_mid',
    image: '/ranks/Gold_Mid.webp',
    color: '#F1E385'
  },
  {
    threshold: 1900,
    name: 'High Gold',
    short: 'High Gold',
    key: 'gold_high',
    image: '/ranks/Gold_High.webp',
    color: '#F1E385'
  },
  {
    threshold: 2000,
    name: 'Platinum',
    short: 'Platinum',
    key: 'platinum_low',
    image: '/ranks/Platinum_Low.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2100,
    name: 'Mid Platinum',
    short: 'Mid Plat',
    key: 'platinum_mid',
    image: '/ranks/Platinum_Mid.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2200,
    name: 'High Platinum',
    short: 'High Plat',
    key: 'platinum_high',
    image: '/ranks/Platinum_High.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2300,
    name: 'Diamond',
    short: 'Diamond',
    key: 'diamond_low',
    image: '/ranks/Diamond_Low.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2400,
    name: 'Mid Diamond',
    short: 'M. Diamond',
    key: 'diamond_mid',
    image: '/ranks/Diamond_Mid.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2500,
    name: 'High Diamond',
    short: 'H. Diamond',
    key: 'diamond_high',
    image: '/ranks/Diamond_High.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2600,
    name: 'Challenger',
    short: 'Challenger',
    key: 'challenger_low',
    image: '/ranks/Master_Low.webp',
    color: '#9952EE'
  },
  {
    threshold: 2700,
    name: 'Mid Challenger',
    short: 'M. Challenger',
    key: 'challenger_mid',
    image: '/ranks/Master_Mid.webp',
    color: '#9952EE'
  },
  {
    threshold: 2800,
    name: 'High Challenger',
    short: 'H. Challenger',
    key: 'challenger_high',
    image: '/ranks/Master_High.webp',
    color: '#9952EE'
  },
  {
    threshold: 2900,
    name: 'Omega',
    short: 'Omega',
    key: 'omega',
    image: '/ranks/Promethean.webp',
    color: '#E1137A'
  },
  {
    threshold: 3000,
    name: 'Pro League',
    short: 'Pro League',
    key: 'proleague',
    image: '/ranks/ProLeague.webp',
    color: '#ffd1fa'
  }
]