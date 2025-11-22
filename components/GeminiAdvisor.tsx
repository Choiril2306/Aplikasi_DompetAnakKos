import React, { useState } from 'react';
import { Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface GeminiAdvisorProps {
  transactions: Transaction[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ transactions, summary }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (transactions.length === 0) {
      setAdvice("Belum ada data nih. Masukkan minimal satu transaksi dulu ya!");
      return;
    }
    setLoading(true);
    const result = await getFinancialAdvice(transactions, summary);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-300" size={24} />
          Sobat Hemat AI
        </h3>
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 backdrop-blur-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
          {advice ? 'Analisis Ulang' : 'Minta Saran'}
        </button>
      </div>

      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm min-h-[100px] border border-white/10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-6 space-y-3">
            <Loader2 className="animate-spin text-white opacity-80" size={32} />
            <p className="text-sm font-medium text-white/80">Sedang menghitung sisa uang cilokmu...</p>
          </div>
        ) : advice ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-4 text-white/80">
            <p>Klik "Minta Saran" untuk dapatkan analisis keuangan & tips hemat dari AI!</p>
          </div>
        )}
      </div>
    </div>
  );
};