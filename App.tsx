import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SummaryCards } from './components/SummaryCards';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { ResetModal } from './components/ResetModal';
import { Transaction, TransactionType } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon, Download, UploadCloud, Save, Trash2, Settings } from 'lucide-react';

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // Enhanced initialization with Error Handling
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse transactions from storage:", error);
      return [];
    }
  });

  const [chartType, setChartType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Robust saving mechanism
  useEffect(() => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      // Simulate a brief delay to show the "Saving" state visually
      setTimeout(() => setSaveStatus('saved'), 500);
    } catch (error) {
      console.error("Failed to save transactions:", error);
      setSaveStatus('saved'); // Reset anyway
    }
  }, [transactions]);

  const addTransaction = (
    description: string,
    amount: number,
    type: TransactionType,
    category: string,
    date: string
  ) => {
    const newTransaction: Transaction = {
      id: generateId(),
      date,
      description,
      amount,
      category,
      type,
    };
    // Add to top of list
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Reset Data Logic
  const handleResetData = (scope: 'ALL' | 'YEAR' | 'MONTH', year: string, month: string) => {
    // 1. Calculate transactions to delete and to keep
    let toDelete: Transaction[] = [];
    let toKeep: Transaction[] = [];

    if (scope === 'ALL') {
      toDelete = transactions;
      toKeep = [];
    } else if (scope === 'YEAR') {
      toDelete = transactions.filter(t => t.date.startsWith(year));
      toKeep = transactions.filter(t => !t.date.startsWith(year));
    } else if (scope === 'MONTH') {
      const prefix = `${year}-${month}`;
      toDelete = transactions.filter(t => t.date.startsWith(prefix));
      toKeep = transactions.filter(t => !t.date.startsWith(prefix));
    }

    if (toDelete.length === 0) return;

    // 2. Calculate the NET balance of the deleted items
    const deletedIncome = toDelete
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const deletedExpense = toDelete
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalanceChange = deletedIncome - deletedExpense;

    // 3. Create a "Saldo Awal" transaction to preserve the balance
    // If net change is positive (we deleted more income), we need to add that back as Saldo Awal.
    // If net change is negative (we deleted more expense), it means the balance was lower before deletion.
    // To keep the balance the SAME as it is now, we need to inject the Difference.
    
    // Simpler Logic:
    // Total Balance = (Keep Income - Keep Expense) + (Deleted Income - Deleted Expense)
    // We want New Total Balance = Total Balance.
    // New Balance from List = (Keep Income - Keep Expense).
    // Missing Part = (Deleted Income - Deleted Expense).
    
    const newTransactions = [...toKeep];

    if (netBalanceChange !== 0) {
      const carryOverTransaction: Transaction = {
        id: generateId(),
        date: new Date().toISOString().slice(0, 10), // Today
        description: 'Saldo Awal (Reset Data)',
        amount: Math.abs(netBalanceChange),
        category: 'Saldo Awal',
        type: netBalanceChange > 0 ? TransactionType.INCOME : TransactionType.EXPENSE
      };
      newTransactions.unshift(carryOverTransaction);
    }

    setTransactions(newTransactions);
  };

  // Export Data Feature
  const handleExportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dompet-anak-kos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Data Feature
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (Array.isArray(parsedData)) {
          // Simple validation check
          const isValid = parsedData.every(item => item.amount && item.date && item.type);
          if (isValid) {
            if (window.confirm("Ini akan menimpa data transaksi saat ini. Yakin ingin melanjutkan?")) {
              setTransactions(parsedData);
            }
          } else {
            alert("Format file tidak valid.");
          }
        }
      } catch (error) {
        alert("Gagal membaca file backup.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = ''; 
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const expenseData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    
    return Object.keys(categoryTotals).map(key => ({
      name: key,
      value: categoryTotals[key]
    }));
  }, [transactions]);

  const incomeData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.INCOME)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    
    return Object.keys(categoryTotals).map(key => ({
      name: key,
      value: categoryTotals[key]
    }));
  }, [transactions]);

  const activeChartData = chartType === 'EXPENSE' ? expenseData : incomeData;
  const hasAnyData = expenseData.length > 0 || incomeData.length > 0;

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
      <ResetModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        onConfirm={handleResetData}
      />
      
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                    <Wallet className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                      Dompet<span className="text-blue-600 dark:text-blue-400">AnakKos</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Pencatatan Keuangan Anak Kos</p>
                      {saveStatus === 'saved' ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded animate-pulse">
                          <Save size={10} /> Tersimpan
                        </span>
                      ) : (
                         <span className="text-[10px] text-gray-400">Menyimpan...</span>
                      )}
                    </div>
                </div>
            </div>
            
            {/* Header Right Side - Empty or Minimal */}
            <div className="hidden sm:block text-xs text-gray-400 font-medium">
               v2.0
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* New Action Bar Location */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                 Halo, selamat datang! 👋
               </p>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ringkasan Keuangan</h2>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm self-end sm:self-auto w-full sm:w-auto overflow-x-auto">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 onChange={handleFileChange}
                 accept=".json"
                 className="hidden" 
               />
               
               <button 
                  onClick={() => setIsResetModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors whitespace-nowrap"
                  title="Reset Data"
               >
                   <Trash2 size={14} />
                   <span className="sm:inline">Reset</span>
               </button>
               <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
               <button 
                  onClick={handleImportClick}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors whitespace-nowrap"
                  title="Restore Data from File"
               >
                   <UploadCloud size={14} />
                   <span className="sm:inline">Restore</span>
               </button>
               <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
               <button 
                  onClick={handleExportData}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors whitespace-nowrap"
                  title="Backup Data to File"
               >
                   <Download size={14} />
                   <span className="sm:inline">Backup</span>
               </button>
            </div>
        </div>

        <SummaryCards 
          income={summary.income} 
          expense={summary.expense} 
          balance={summary.balance} 
        />

        <GeminiAdvisor transactions={sortedTransactions} summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Chart */}
          <div className="lg:col-span-1 space-y-6">
            <TransactionForm onAddTransaction={addTransaction} />
            
            {hasAnyData && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex flex-row justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">
                    Analisis {chartType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
                  </h3>
                  <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <button
                      onClick={() => setChartType('EXPENSE')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        chartType === 'EXPENSE'
                          ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      title="Pengeluaran"
                    >
                      <TrendingDown size={14} />
                      <span className="hidden sm:inline">Keluar</span>
                    </button>
                    <button
                      onClick={() => setChartType('INCOME')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        chartType === 'INCOME'
                          ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      title="Pemasukan"
                    >
                      <TrendingUp size={14} />
                      <span className="hidden sm:inline">Masuk</span>
                    </button>
                  </div>
                </div>

                {activeChartData.length > 0 ? (
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {activeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            color: '#1f2937'
                          }}
                          itemStyle={{ color: '#1f2937' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700/50 rounded-xl">
                    <PieChartIcon size={48} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">Belum ada data {chartType === 'EXPENSE' ? 'pengeluaran' : 'pemasukan'}</p>
                    <p className="text-xs opacity-60 mt-1">Yuk tambah transaksi baru!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <TransactionList 
              transactions={sortedTransactions} 
              onDelete={deleteTransaction} 
            />
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;