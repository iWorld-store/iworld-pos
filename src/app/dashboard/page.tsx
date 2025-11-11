'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db-supabase';
import { calculateReports } from '@/utils/reports';
import { Phone, Sale, Return, Credit, CreditPayment, PaymentMethod } from '@/types';
import { getTodayDate } from '@/utils/date';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<{ [key: number]: CreditPayment[] }>({});
  const [expandedCredits, setExpandedCredits] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    // Load payment history for all credits when credits change
    if (credits.length > 0) {
      loadPaymentHistory();
    }
  }, [credits]);

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

  const loadPaymentHistory = async () => {
    try {
      const history: { [key: number]: CreditPayment[] } = {};
      await Promise.all(
        credits.map(async (credit) => {
          if (credit.id) {
            history[credit.id] = await phoneDB.getPaymentHistory(credit.id);
          }
        })
      );
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleRecordPayment = (credit: Credit) => {
    setSelectedCredit(credit);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setSelectedCredit(null);
    await loadStats(); // Reload to get updated credits
    await loadPaymentHistory(); // Reload payment history
  };

  const toggleCreditExpansion = (creditId: number) => {
    const newExpanded = new Set(expandedCredits);
    if (newExpanded.has(creditId)) {
      newExpanded.delete(creditId);
    } else {
      newExpanded.add(creditId);
    }
    setExpandedCredits(newExpanded);
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
                      <th className="px-4 py-2 text-left text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {credits.map((credit) => {
                      const isExpanded = credit.id ? expandedCredits.has(credit.id) : false;
                      const history = credit.id ? paymentHistory[credit.id] || [] : [];
                      return (
                        <React.Fragment key={credit.id || `credit-${credit.customerName}-${credit.saleDate}`}>
                          <tr className="hover:bg-gray-800">
                            <td className="px-4 py-2 font-medium">{credit.customerName}</td>
                            <td className="px-4 py-2">{credit.totalAmount.toLocaleString('en-PK')} PKR</td>
                            <td className="px-4 py-2 text-green-400">{credit.receivedAmount.toLocaleString('en-PK')} PKR</td>
                            <td className="px-4 py-2 text-yellow-400 font-semibold">{credit.remainingAmount.toLocaleString('en-PK')} PKR</td>
                            <td className="px-4 py-2 text-gray-400">{credit.saleDate}</td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => credit.id && handleRecordPayment(credit)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors"
                                >
                                  Record Payment
                                </button>
                                {history.length > 0 && (
                                  <button
                                    onClick={() => credit.id && toggleCreditExpansion(credit.id)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                                  >
                                    {isExpanded ? 'Hide' : 'Show'} History
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && history.length > 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-3 bg-gray-800/50">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Payment History</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-700">
                                        <tr>
                                          <th className="px-3 py-1 text-left text-gray-300">Date</th>
                                          <th className="px-3 py-1 text-left text-gray-300">Amount</th>
                                          <th className="px-3 py-1 text-left text-gray-300">Method</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-700">
                                        {history.map((payment) => (
                                          <tr key={payment.id} className="hover:bg-gray-700">
                                            <td className="px-3 py-1 text-gray-400">{payment.paymentDate}</td>
                                            <td className="px-3 py-1 text-green-400 font-semibold">
                                              {payment.amount.toLocaleString('en-PK')} PKR
                                            </td>
                                            <td className="px-3 py-1 text-gray-400">
                                              {payment.paymentMethod || 'N/A'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCredit && (
        <PaymentModal
          credit={selectedCredit}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCredit(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
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

// Payment Modal Component
function PaymentModal({
  credit,
  onClose,
  onSuccess,
}: {
  credit: Credit;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        setError('Please enter a valid payment amount');
        setLoading(false);
        return;
      }

      if (paymentAmount > credit.remainingAmount) {
        setError(`Payment amount cannot exceed remaining amount (${credit.remainingAmount.toLocaleString('en-PK')} PKR)`);
        setLoading(false);
        return;
      }

      await phoneDB.recordCreditPayment(credit.id!, paymentAmount, paymentDate, paymentMethod);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl max-w-md w-full relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white">💳 Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Credit Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Customer:</span>
              <span className="text-white font-semibold">{credit.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-white">{credit.totalAmount.toLocaleString('en-PK')} PKR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Received:</span>
              <span className="text-green-400">{credit.receivedAmount.toLocaleString('en-PK')} PKR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Remaining:</span>
              <span className="text-yellow-400 font-semibold">{credit.remainingAmount.toLocaleString('en-PK')} PKR</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Amount (PKR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={credit.remainingAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Max: ${credit.remainingAmount.toLocaleString('en-PK')} PKR`}
              required
              autoFocus
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Date *
            </label>
            <input
              type="text"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DD/MM/YYYY"
              pattern="\d{2}/\d{2}/\d{4}"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

