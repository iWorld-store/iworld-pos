import { Phone, Sale, Return } from '@/types';
import { formatDate, getTodayDate } from './date';

export interface ReportData {
  currentStockValue: number;
  totalProfit: number;
  netProfit: number;
  todaySales: {
    count: number;
    revenue: number;
    profit: number;
  };
  bestSellingModels: Array<{
    model: string;
    count: number;
    totalProfit: number;
  }>;
  averageProfitPerPhone: number;
  inventoryTurnover: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
}

export function calculateReports(
  phones: Phone[],
  sales: Sale[],
  returns: Return[]
): ReportData {
  const today = getTodayDate();
  const todayDate = new Date();
  const weekAgo = new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(todayDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(todayDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Current stock value (unsold phones)
  const inStockPhones = phones.filter(p => p.status === 'in_stock');
  const currentStockValue = inStockPhones.reduce(
    (sum, phone) => sum + phone.purchasePrice,
    0
  );

  // Total profit from sales
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  // Total returns (loss from returns)
  const totalReturns = returns.reduce((sum, ret) => sum + ret.returnPrice, 0);

  // Net profit
  const netProfit = totalProfit - totalReturns;

  // Today's sales
  const todaySalesList = sales.filter(sale => sale.saleDate === today);
  const todaySales = {
    count: todaySalesList.length,
    revenue: todaySalesList.reduce((sum, sale) => sum + sale.salePrice, 0),
    profit: todaySalesList.reduce((sum, sale) => sum + sale.profit, 0),
  };

  // Best selling models
  const modelSales = new Map<string, { count: number; profit: number }>();
  sales.forEach(sale => {
    const phone = phones.find(p => p.id === sale.phoneId);
    if (phone) {
      const existing = modelSales.get(phone.modelName) || { count: 0, profit: 0 };
      modelSales.set(phone.modelName, {
        count: existing.count + 1,
        profit: existing.profit + sale.profit,
      });
    }
  });

  const bestSellingModels = Array.from(modelSales.entries())
    .map(([model, data]) => ({
      model,
      count: data.count,
      totalProfit: data.profit,
    }))
    .sort((a, b) => b.count - a.count);

  // Average profit per phone
  const averageProfitPerPhone = sales.length > 0 
    ? totalProfit / sales.length 
    : 0;

  // Inventory turnover (average days to sell)
  const soldPhones = phones.filter(p => p.status === 'sold' && p.saleDate && p.saleDate !== 'N/A');
  let totalDays = 0;
  soldPhones.forEach(phone => {
    if (phone.purchaseDate && phone.saleDate && phone.saleDate !== 'N/A') {
      try {
        const purchaseDate = parseDateString(phone.purchaseDate);
        const saleDate = parseDateString(phone.saleDate);
        const days = Math.ceil((saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += days;
      } catch {
        // Skip invalid dates
      }
    }
  });
  const inventoryTurnover = soldPhones.length > 0 
    ? totalDays / soldPhones.length 
    : 0;

  // Time-based profits
  const dailyProfit = sales
    .filter(sale => sale.saleDate === today)
    .reduce((sum, sale) => sum + sale.profit, 0);

  const weeklyProfit = sales
    .filter(sale => {
      if (!sale.saleDate || sale.saleDate === 'N/A') return false;
      try {
        const saleDate = parseDateString(sale.saleDate);
        return saleDate >= weekAgo;
      } catch {
        return false;
      }
    })
    .reduce((sum, sale) => sum + sale.profit, 0);

  const monthlyProfit = sales
    .filter(sale => {
      if (!sale.saleDate || sale.saleDate === 'N/A') return false;
      try {
        const saleDate = parseDateString(sale.saleDate);
        return saleDate >= monthAgo;
      } catch {
        return false;
      }
    })
    .reduce((sum, sale) => sum + sale.profit, 0);

  const yearlyProfit = sales
    .filter(sale => {
      if (!sale.saleDate || sale.saleDate === 'N/A') return false;
      try {
        const saleDate = parseDateString(sale.saleDate);
        return saleDate >= yearAgo;
      } catch {
        return false;
      }
    })
    .reduce((sum, sale) => sum + sale.profit, 0);

  return {
    currentStockValue,
    totalProfit,
    netProfit,
    todaySales,
    bestSellingModels,
    averageProfitPerPhone,
    inventoryTurnover,
    dailyProfit,
    weeklyProfit,
    monthlyProfit,
    yearlyProfit,
  };
}

function parseDateString(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

