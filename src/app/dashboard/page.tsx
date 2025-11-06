'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db';
import { calculateReports } from '@/utils/reports';
import { Phone, Sale, Return, Credit } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<Credit[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [phones, sales, returns, allCredits] = await Promise.all([
        phoneDB.getAllPhones(),
        phoneDB.getAllSales(),
        phoneDB.getAllReturns(),
        phoneDB.getPendingCredits(),
      ]);

      const reportData = calculateReports(phones, sales, returns);
      setStats(reportData);
      setCredits(allCredits);
    } catch (error) {
      console.error('Error loading stats:', error);
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

  if (!stats) {
    return (
      <Layout>
        <div className="text-center py-12">No data available</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Stock Value"
            value={`${stats.currentStockValue.toLocaleString('en-PK')} PKR`}
            icon="📦"
          />
          <StatCard
            title="Total Profit"
            value={`${stats.totalProfit.toLocaleString('en-PK')} PKR`}
            icon="💰"
          />
          <StatCard
            title="Net Profit"
            value={`${stats.netProfit.toLocaleString('en-PK')} PKR`}
            icon="📊"
          />
          <StatCard
            title="Today's Sales"
            value={`${stats.todaySales.count} phones`}
            icon="🛒"
          />
        </div>

        {/* Today's Sales Details */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Today's Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.todaySales.revenue.toLocaleString('en-PK')} PKR
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Profit</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.todaySales.profit.toLocaleString('en-PK')} PKR
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Phones Sold</p>
              <p className="text-2xl font-bold">
                {stats.todaySales.count}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/inventory/add"
            className="bg-accent-blue hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            ➕ Add Inventory
          </Link>
          <Link
            href="/sell"
            className="bg-accent-green hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            💳 Sell Phone
          </Link>
          <Link
            href="/reports"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            📈 View Reports
          </Link>
          <Link
            href="/backup"
            className="bg-purple-800 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            💾 Backup & Restore
          </Link>
        </div>

        {/* Credit Details */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">💳 Credit Sales</h2>
          {credits.length === 0 ? (
            <p className="text-gray-400">No pending credit sales</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Total Pending Credits</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {credits.reduce((sum, credit) => sum + credit.remainingAmount, 0).toLocaleString('en-PK')} PKR
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {credits.length} {credits.length === 1 ? 'customer' : 'customers'} with pending payments
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-300">Customer</th>
                      <th className="px-4 py-2 text-left text-gray-300">Total Amount</th>
                      <th className="px-4 py-2 text-left text-gray-300">Received</th>
                      <th className="px-4 py-2 text-left text-gray-300">Remaining</th>
                      <th className="px-4 py-2 text-left text-gray-300">Sale Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {credits.map((credit) => (
                      <tr key={credit.id} className="hover:bg-gray-800">
                        <td className="px-4 py-2 font-medium">{credit.customerName}</td>
                        <td className="px-4 py-2">{credit.totalAmount.toLocaleString('en-PK')} PKR</td>
                        <td className="px-4 py-2 text-green-400">{credit.receivedAmount.toLocaleString('en-PK')} PKR</td>
                        <td className="px-4 py-2 text-yellow-400 font-semibold">{credit.remainingAmount.toLocaleString('en-PK')} PKR</td>
                        <td className="px-4 py-2 text-gray-400">{credit.saleDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
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

