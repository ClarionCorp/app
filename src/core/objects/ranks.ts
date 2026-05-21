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
    key: 'unranked',
    image: '/ranks/Unranked-Blobbo.png',
    color: '#ECDCD0'
  },
  {
    threshold: 800,
    name: 'Rookie',
    key: 'rookie_low',
    image: '/ranks/Rookie_Low.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 900,
    name: 'Mid Rookie',
    key: 'rookie_mid',
    image: '/ranks/Rookie_Mid.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 1000,
    name: 'High Rookie',
    key: 'rookie_high',
    image: '/ranks/Rookie_High.webp',
    color: '#ECDCD0'
  },
  {
    threshold: 1100,
    name: 'Bronze',
    key: 'bronze_low',
    image: '/ranks/Bronze_Low.webp',
    color: '#C88C59'
  },
  {
    threshold: 1200,
    name: 'Mid Bronze',
    key: 'bronze_mid',
    image: '/ranks/Bronze_Mid.webp',
    color: '#C88C59'
  },
  {
    threshold: 1300,
    name: 'High Bronze',
    key: 'bronze_high',
    image: '/ranks/Bronze_High.webp',
    color: '#C88C59'
  },
  {
    threshold: 1400,
    name: 'Silver',
    key: 'silver_low',
    image: '/ranks/Silver_Low.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1500,
    name: 'Mid Silver',
    key: 'silver_mid',
    image: '/ranks/Silver_Mid.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1600,
    name: 'High Silver',
    key: 'silver_high',
    image: '/ranks/Silver_High.webp',
    color: '#9F9F9F'
  },
  {
    threshold: 1700,
    name: 'Gold',
    key: 'gold_low',
    image: '/ranks/Gold_Low.webp',
    color: '#F1E385'
  },
  {
    threshold: 1800,
    name: 'Mid Gold',
    key: 'gold_mid',
    image: '/ranks/Gold_Mid.webp',
    color: '#F1E385'
  },
  {
    threshold: 1900,
    name: 'High Gold',
    key: 'gold_high',
    image: '/ranks/Gold_High.webp',
    color: '#F1E385'
  },
  {
    threshold: 2000,
    name: 'Platinum',
    key: 'platinum_low',
    image: '/ranks/Platinum_Low.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2100,
    name: 'Mid Platinum',
    key: 'platinum_mid',
    image: '/ranks/Platinum_Mid.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2200,
    name: 'High Platinum',
    key: 'platinum_high',
    image: '/ranks/Platinum_High.webp',
    color: '#2DE0A5'
  },
  {
    threshold: 2300,
    name: 'Diamond',
    key: 'diamond_low',
    image: '/ranks/Diamond_Low.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2400,
    name: 'Mid Diamond',
    key: 'diamond_mid',
    image: '/ranks/Diamond_Mid.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2500,
    name: 'High Diamond',
    key: 'diamond_high',
    image: '/ranks/Diamond_High.webp',
    color: '#51B4FD'
  },
  {
    threshold: 2600,
    name: 'Challenger',
    key: 'challenger_low',
    image: '/ranks/Master_Low.webp',
    color: '#9952EE'
  },
  {
    threshold: 2700,
    name: 'Mid Challenger',
    key: 'challenger_mid',
    image: '/ranks/Master_Mid.webp',
    color: '#9952EE'
  },
  {
    threshold: 2800,
    name: 'High Challenger',
    key: 'challenger_high',
    image: '/ranks/Master_High.webp',
    color: '#9952EE'
  },
  {
    threshold: 2900,
    name: 'Omega',
    key: 'omega',
    image: '/ranks/Promethean.webp',
    color: '#E1137A'
  },
  {
    threshold: 3000,
    name: 'Pro League',
    key: 'proleague',
    image: '/ranks/ProLeague.webp',
    color: '#ffd1fa'
  }
]