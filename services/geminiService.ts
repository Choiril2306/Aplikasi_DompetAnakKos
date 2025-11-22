import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[], summary: { income: number, expense: number, balance: number }) => {
  try {
    // Filter for current month to be relevant
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const recentTransactions = transactions
      .filter(t => t.date.startsWith(currentMonth))
      .slice(0, 50); // Limit to last 50 for token economy

    const prompt = `
      Bertindaklah sebagai penasihat keuangan yang ramah, lucu, dan "relate" untuk mahasiswa/anak kos di Indonesia.
      
      Data Keuangan Bulan Ini:
      - Total Pemasukan: Rp ${summary.income}
      - Total Pengeluaran: Rp ${summary.expense}
      - Sisa Uang: Rp ${summary.balance}
      
      Riwayat Transaksi Terkini:
      ${JSON.stringify(recentTransactions.map(t => ({
        ket: t.description,
        jml: t.amount,
        kat: t.category,
        tipe: t.type
      })))}

      Tugasmu:
      1. Berikan analisis singkat tentang pola pengeluaran.
      2. Berikan 3 saran praktis dan hemat (lifehack anak kos).
      3. Jika pengeluaran > pemasukan, berikan peringatan tegas tapi jenaka.
      4. Gunakan bahasa santai tapi sopan, gunakan emoji.
      
      Format jawaban dalam Markdown ringkas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching advice:", error);
    return "Maaf, AI sedang kehabisan kuota untuk berpikir. Coba lagi nanti ya! 😅";
  }
};