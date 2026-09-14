export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Blockchain Fundamentals',
    difficulty: 'Easy',
    question: 'What is the maximum supply limit of Bitcoin that will ever exist?',
    options: ['18 Million', '21 Million', '100 Million', 'Infinite'],
    correctIndex: 1,
    explanation: 'Satoshi Nakamoto coded a hard cap of 21,000,000 bitcoins into the Bitcoin protocol to prevent monetary inflation.',
    points: 50,
  },
  {
    id: 'q2',
    category: 'DeFi & Staking',
    difficulty: 'Easy',
    question: 'What does "HODL" mean in the cryptocurrency community?',
    options: ['Hold On for Dear Life', 'High Order Digital Ledger', 'Hash Origin Distribution Link', 'Hyper Optimized Dual Liquidity'],
    correctIndex: 0,
    explanation: 'Originally a typo on a Bitcoin forum in 2013 ("I AM HODLING"), it became the famous backronym: "Hold On for Dear Life".',
    points: 50,
  },
  {
    id: 'q3',
    category: 'Security',
    difficulty: 'Medium',
    question: 'Where should you NEVER enter your 12 or 24-word recovery seed phrase?',
    options: [
      'On a physical metal backup plate',
      'In cold storage paper backup',
      'Any online website, DM, or chat support form',
      'On an offline hardware wallet device'
    ],
    correctIndex: 2,
    explanation: 'Legitimate customer support and Web3 platforms will NEVER ask for your seed phrase. Entering it online gives hackers full wallet access.',
    points: 75,
  },
  {
    id: 'q4',
    category: 'Smart Contracts',
    difficulty: 'Medium',
    question: 'What consensus mechanism does Ethereum currently use following "The Merge"?',
    options: ['Proof of Work (PoW)', 'Proof of Stake (PoS)', 'Proof of History (PoH)', 'Proof of Authority (PoA)'],
    correctIndex: 1,
    explanation: 'In September 2022, Ethereum transitioned from Proof of Work to Proof of Stake, reducing its energy consumption by over 99.9%.',
    points: 75,
  },
  {
    id: 'q5',
    category: 'Gobax Ecosystem',
    difficulty: 'Hard',
    question: 'What is the utility of the GOBX governance and utility token in Gobax?',
    options: [
      'Educational course unlocks & community voting',
      'Community staking rewards',
      'Web3 research allocations',
      'All of the above'
    ],
    correctIndex: 3,
    explanation: 'GOBX powers the Gobax learning ecosystem: granting course access, community governance, research grants, and learning perks.',
    points: 100,
  },
  {
    id: 'q6',
    category: 'Trading & Markets',
    difficulty: 'Medium',
    question: 'What happens during a Bitcoin "Halving" event?',
    options: [
      'The price of Bitcoin drops by 50%',
      'The miner block reward is cut in half',
      'Half of all existing Bitcoins are burned',
      'Transaction fees double automatically'
    ],
    correctIndex: 1,
    explanation: 'Every 210,000 blocks (roughly every 4 years), the reward given to Bitcoin miners for adding new blocks is halved.',
    points: 75,
  }
];
