'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db-supabase';
import { calculateReports } from '@/utils/reports';
import { exportToCSV, exportToExcel } from '@/utils/export';
import { Phone, Sale, Return } from '@/types';

export default function Reports() {
  const [reports, setReports] = useState<any>(null);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [allPhones, sales, returns] = await Promise.all([
        phoneDB.getAllPhones(),
        phoneDB.getAllSales(),
        phoneDB.getAllReturns(),
      ]);

      setPhones(allPhones);
      const reportData = calculateReports(allPhones, sales, returns);
      setReports(reportData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!reports) {
    return (
      <Layout>
        <div className="text-center py-12">No data available</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(phones)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportToExcel(phones)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Current Stock Value"
            value={`${reports.currentStockValue.toLocaleString('en-PK')} PKR`}
            icon="📦"
            color="blue"
          />
          <MetricCard
            title="Total Profit"
            value={`${reports.totalProfit.toLocaleString('en-PK')} PKR`}
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Net Profit"
            value={`${reports.netProfit.toLocaleString('en-PK')} PKR`}
            icon="📊"
            color="green"
          />
          <MetricCard
            title="Average Profit/Phone"
            value={`${reports.averageProfitPerPhone.toLocaleString('en-PK')} PKR`}
            icon="📈"
            color="blue"
          />
        </div>

        {/* Return Metrics */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Return Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Refund Losses</p>
              <p className="text-2xl font-bold text-red-400">
                {reports.refundLosses.toLocaleString('en-PK')} PKR
              </p>
              <p className="text-xs text-gray-500 mt-1">Actual money lost from refunds & exchanges</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Trade-In Value</p>
              <p className="text-2xl font-bold text-blue-400">
                {reports.tradeInValue.toLocaleString('en-PK')} PKR
              </p>
              <p className="text-xs text-gray-500 mt-1">Buyback cost (not a loss - can be resold)</p>
            </div>
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Resale Profit</p>
              <p className="text-2xl font-bold text-green-400">
                {reports.resaleProfit.toLocaleString('en-PK')} PKR
              </p>
              <p className="text-xs text-gray-500 mt-1">Profit from reselling returned phones</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Resale Count</p>
              <p className="text-2xl font-bold text-purple-400">
                {reports.resaleCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Number of phones resold after return</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400">
              <strong>Note:</strong> Net Profit = Total Profit - Refund Losses + Resale Profit. 
              Trade-ins are buybacks that can generate profit when resold, so they're not counted as losses.
            </p>
          </div>
        </div>

        {/* Profit by Period */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Profit by Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PeriodCard
              period="Daily"
              value={reports.dailyProfit}
            />
            <PeriodCard
              period="Weekly"
              value={reports.weeklyProfit}
            />
            <PeriodCard
              period="Monthly"
              value={reports.monthlyProfit}
            />
            <PeriodCard
              period="Yearly"
              value={reports.yearlyProfit}
            />
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Today's Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Phones Sold</p>
              <p className="text-3xl font-bold">{reports.todaySales.count}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-green-400">
                {reports.todaySales.revenue.toLocaleString('en-PK')} PKR
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Profit</p>
              <p className="text-3xl font-bold text-blue-400">
                {reports.todaySales.profit.toLocaleString('en-PK')} PKR
              </p>
            </div>
          </div>
        </div>

        {/* Best Selling Models */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Best Selling Models</h2>
          {reports.bestSellingModels.length === 0 ? (
            <p className="text-gray-400">No sales data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Model</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Quantity Sold</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.bestSellingModels.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">{item.model}</td>
                      <td className="py-3 px-4 text-right">{item.count}</td>
                      <td className="py-3 px-4 text-right text-green-400">
                        {item.totalProfit.toLocaleString('en-PK')} PKR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory Turnover */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">Inventory Turnover</h2>
          <p className="text-gray-400 text-sm mb-4">Average days to sell a phone</p>
          <p className="text-3xl font-bold">
            {reports.inventoryTurnover.toFixed(1)} days
          </p>
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function PeriodCard({ period, value }: { period: string; value: number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <p className="text-gray-400 text-sm mb-2">{period}</p>
      <p className="text-2xl font-bold text-green-400">
        {value.toLocaleString('en-PK')} PKR
      </p>
    </div>
  );
}

