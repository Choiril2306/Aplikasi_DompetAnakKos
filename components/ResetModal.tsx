import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: 'ALL' | 'YEAR' | 'MONTH', year: string, month: string) => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [scope, setScope] = useState<'ALL' | 'YEAR' | 'MONTH'>('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(scope, selectedYear, selectedMonth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Reset Riwayat Transaksi
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg flex gap-3 items-start">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Tindakan ini akan menghapus data riwayat. Sisa saldo terakhir akan otomatis disimpan sebagai "Saldo Awal".
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Mode Reset:</label>
            
            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                name="scope" 
                value="ALL" 
                checked={scope === 'ALL'} 
                onChange={() => setScope('ALL')}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Reset Semua Data</span>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                name="scope" 
                value="YEAR" 
                checked={scope === 'YEAR'} 
                onChange={() => setScope('YEAR')}
                className="text-red-600 focus:ring-red-500"
              />
              <div className="ml-2 flex-1 flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">Reset Per Tahun</span>
                {scope === 'YEAR' && (
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-sm p-1 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                name="scope" 
                value="MONTH" 
                checked={scope === 'MONTH'} 
                onChange={() => setScope('MONTH')}
                className="text-red-600 focus:ring-red-500"
              />
              <div className="ml-2 flex-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">Reset Per Bulan</span>
                {scope === 'MONTH' && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="text-sm p-1 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="text-sm p-1 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Hapus & Simpan Saldo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};