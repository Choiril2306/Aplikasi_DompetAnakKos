import React, { useState, useMemo } from 'react';
import { Trash2, Search, Coffee, Home, Bus, Wifi, ShoppingBag, Music, DollarSign, Filter, X, Calendar } from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'makan & minum': return <Coffee size={14} />;
    case 'sewa kos': return <Home size={14} />;
    case 'transportasi': return <Bus size={14} />;
    case 'kuota & internet': return <Wifi size={14} />;
    case 'belanja bulanan': return <ShoppingBag size={14} />;
    case 'hiburan': return <Music size={14} />;
    default: return <DollarSign size={14} />;
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Merge and sort unique categories for the dropdown
  const allCategories = useMemo(() => {
    const cats = new Set([...CATEGORIES.EXPENSE, ...CATEGORIES.INCOME]);
    return Array.from(cats).sort();
  }, []);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Category Filter
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;

      // 2. Date/Time Filter
      // Priority: Specific Date > Month > All Time
      if (filterDate) {
        if (t.date !== filterDate) return false;
      } else if (filterMonth) {
        // filterMonth format is YYYY-MM, t.date is YYYY-MM-DD
        if (!t.date.startsWith(filterMonth)) return false;
      }

      // 3. Search Term (Description)
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [transactions, filterCategory, filterDate, filterMonth, searchTerm]);

  const clearFilters = () => {
    setFilterCategory('ALL');
    setFilterDate('');
    setFilterMonth('');
    setSearchTerm('');
  };

  const hasActiveFilters = filterCategory !== 'ALL' || filterDate !== '' || filterMonth !== '' || searchTerm !== '';

  // Empty State for "No Data At All"
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors duration-200">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
          <Search size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Belum ada transaksi</h3>
        <p className="text-gray-500 dark:text-gray-400">Mulai catat pengeluaranmu hari ini!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      
      {/* Header & Filter Section */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            Riwayat Transaksi
            <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
              {filteredTransactions.length}
            </span>
          </h3>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center gap-1 self-end sm:self-auto"
            >
              <X size={14} /> Reset Filter
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={14} className="text-gray-400" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-gray-400" />
            </div>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate(''); // Clear specific date if month is selected
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Specific Date Filter */}
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterMonth(''); // Clear month if specific date is selected
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Keterangan</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium text-right">Jumlah</th>
              <th className="p-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                // Determine badge style based on transaction type with dark mode support
                const badgeStyle = t.type === TransactionType.INCOME
                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";

                return (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-none text-sm">
                    <td className="p-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{t.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                        {getCategoryIcon(t.category)}
                        {t.category}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {formatRupiah(t.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada transaksi yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
