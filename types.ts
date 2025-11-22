export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const CATEGORIES = {
  [TransactionType.EXPENSE]: [
    'Makan & Minum',
    'Sewa Kos',
    'Transportasi',
    'Laundry',
    'Kuota & Internet',
    'Belanja Bulanan',
    'Hiburan',
    'Lainnya'
  ],
  [TransactionType.INCOME]: [
    'Saldo Awal',
    'Kiriman Ortu',
    'Gaji/Upah',
    'Freelance',
    'Hadiah',
    'Lainnya'
  ]
};