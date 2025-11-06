'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db';
import { getTodayDate } from '@/utils/date';
import { Phone, Sale } from '@/types';

export default function Returns() {
  const router = useRouter();
  const imeiRef = useRef<HTMLInputElement>(null);
  const [imei, setImei] = useState('');
  const [phone, setPhone] = useState<Phone | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    returnPrice: '',
    newPrice: '',
    returnReason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle barcode scanner input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === imeiRef.current && imei) {
        e.preventDefault();
        handleSearch();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [imei]);

  const handleSearch = async () => {
    if (!imei.trim()) {
      setError('Please enter IMEI');
      return;
    }

    setError('');
    setPhone(null);
    setSale(null);

    try {
      const phones = await phoneDB.searchPhones(imei);
      const foundPhone = phones.find(
        p => p.imei1 === imei || p.imei2 === imei
      );

      if (!foundPhone) {
        setError('Phone not found in inventory');
        return;
      }

      if (foundPhone.status !== 'sold') {
        setError('This phone has not been sold yet');
        return;
      }

      setPhone(foundPhone);

      // Find the sale record
      const sales = await phoneDB.getAllSales();
      const foundSale = sales.find(s => s.phoneId === foundPhone.id);
      setSale(foundSale || null);
    } catch (err) {
      setError('Error searching for phone');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !sale) return;

    setError('');
    setSuccess(false);

    if (!formData.returnPrice || parseFloat(formData.returnPrice) <= 0) {
      setError('Valid return price is required');
      return;
    }

    if (!formData.newPrice || parseFloat(formData.newPrice) <= 0) {
      setError('Valid new price is required');
      return;
    }

    setLoading(true);

    try {
      const returnPrice = parseFloat(formData.returnPrice);
      const newPrice = parseFloat(formData.newPrice);
      const returnDate = getTodayDate();

      // Add return record
      await phoneDB.addReturn({
        saleId: sale.id!,
        phoneId: phone.id!,
        returnPrice,
        newPrice,
        returnReason: formData.returnReason.trim() || undefined,
        returnDate,
      });

      setSuccess(true);

      // Reset form
      setImei('');
      setPhone(null);
      setSale(null);
      setFormData({
        returnPrice: '',
        newPrice: '',
        returnReason: '',
      });

      // Focus back on IMEI for next return
      setTimeout(() => imeiRef.current?.focus(), 100);
    } catch (err) {
      setError('Failed to process return');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Returns & Refunds</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-6">
          {/* IMEI Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scan or Enter IMEI
            </label>
            <div className="flex gap-2">
              <input
                ref={imeiRef}
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="Scan IMEI barcode"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-3 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Phone and Sale Details */}
          {phone && sale && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
              <h3 className="text-lg font-semibold mb-3">Phone & Sale Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Model:</span>
                  <span className="ml-2 font-semibold">{phone.modelName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Sale Price:</span>
                  <span className="ml-2 font-semibold">
                    {sale.salePrice.toLocaleString('en-PK')} PKR
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Sale Date:</span>
                  <span className="ml-2 font-semibold">{sale.saleDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">Customer:</span>
                  <span className="ml-2 font-semibold">{sale.customerName || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {phone && sale && (
            <>
              {/* Return Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Return Price (Refund Amount) (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.returnPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Amount to refund to customer
                </p>
              </div>

              {/* New Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Price (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.newPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Price to sell when phone goes back to inventory
                </p>
              </div>

              {/* Return Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Return Reason (Optional)
                </label>
                <textarea
                  value={formData.returnReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnReason: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  rows={3}
                  placeholder="Enter return reason..."
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
              Return processed successfully! Phone has been added back to inventory.
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !phone || !sale}
              className="flex-1 bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Process Return'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

