export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  sparkline: number[];
  iconBg: string;
  holdingAmount?: number;
  holdingValue?: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'buy' | 'swap' | 'transfer';
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending';
  positive: boolean;
}

export const MOCK_CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: 'gobax',
    name: 'Gobax Token',
    symbol: 'GOBX',
    price: 3.48,
    change24h: +18.64,
    sparkline: [2.8, 2.9, 3.1, 3.0, 3.3, 3.45, 3.48],
    iconBg: '#00FFE0',
    holdingAmount: 2450,
    holdingValue: 8526.0,
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 91420.50,
    change24h: +4.12,
    sparkline: [88200, 89100, 88900, 90300, 90800, 91100, 91420],
    iconBg: '#F59E0B',
    holdingAmount: 0.28,
    holdingValue: 25597.74,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3340.25,
    change24h: +2.85,
    sparkline: [3210, 3240, 3200, 3290, 3310, 3325, 3340],
    iconBg: '#627EEA',
    holdingAmount: 2.5,
    holdingValue: 8350.62,
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 198.75,
    change24h: +8.45,
    sparkline: [180, 184, 182, 191, 195, 194, 198.75],
    iconBg: '#9945FF',
    holdingAmount: 18.5,
    holdingValue: 3676.87,
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
    price: 642.10,
    change24h: -1.20,
    sparkline: [655, 652, 648, 650, 646, 644, 642.1],
    iconBg: '#F3BA2F',
    holdingAmount: 3.2,
    holdingValue: 2054.72,
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    price: 2.38,
    change24h: +6.70,
    sparkline: [2.15, 2.20, 2.18, 2.25, 2.30, 2.32, 2.38],
    iconBg: '#23292F',
    holdingAmount: 40,
    holdingValue: 95.2,
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'buy',
    title: 'Bought GOBX',
    subtitle: 'From USD Balance',
    amount: '+500 GOBX',
    date: 'Today, 12:45 PM',
    status: 'completed',
    positive: true,
  },
  {
    id: 'tx-2',
    type: 'deposit',
    title: 'USDT Deposit',
    subtitle: 'TRC-20 Network',
    amount: '+2,500.00 USDT',
    date: 'Yesterday, 08:20 PM',
    status: 'completed',
    positive: true,
  },
  {
    id: 'tx-3',
    type: 'swap',
    title: 'Swap ETH to SOL',
    subtitle: 'Decentralized Router',
    amount: '0.4 ETH → 6.7 SOL',
    date: 'Mar 08, 04:12 PM',
    status: 'completed',
    positive: false,
  },
  {
    id: 'tx-4',
    type: 'transfer',
    title: 'Sent Bitcoin',
    subtitle: 'To External Wallet',
    amount: '-0.05 BTC',
    date: 'Mar 06, 11:30 AM',
    status: 'completed',
    positive: false,
  },
];
