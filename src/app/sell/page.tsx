'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db-supabase';
import { getTodayDate, generateReceiptNumber } from '@/utils/date';
import { Phone, PaymentMethod } from '@/types';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank Transfer', 'Other'];

type SaleMode = 'sale' | 'credit';

export default function SellPhone() {
  const router = useRouter();
  const imeiRef = useRef<HTMLInputElement>(null);
  const [imei, setImei] = useState('');
  const [phone, setPhone] = useState<Phone | null>(null);
  const [saleMode, setSaleMode] = useState<SaleMode>('sale');
  const [formData, setFormData] = useState({
    salePrice: '',
    receivedAmount: '',
    remainingAmount: '',
    customerName: '',
    paymentMethod: 'Cash' as PaymentMethod,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

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

  // Reset form when sale mode changes
  useEffect(() => {
    if (phone) {
      setFormData({
        salePrice: '',
        receivedAmount: '',
        remainingAmount: '',
        customerName: '',
        paymentMethod: 'Cash',
      });
      setError('');
    }
  }, [saleMode, phone]);

  const handleSearch = async () => {
    if (!imei.trim()) {
      setError('Please enter IMEI');
      return;
    }

    setError('');
    setPhone(null);
    setSaleMode('sale');

    try {
      const phones = await phoneDB.searchPhones(imei);
      const foundPhone = phones.find(
        p => p.imei1 === imei || p.imei2 === imei
      );

      if (!foundPhone) {
        setError('Phone not found in inventory');
        return;
      }

      if (foundPhone.status === 'sold') {
        setError('This phone has already been sold');
        return;
      }

      setPhone(foundPhone);
    } catch (err) {
      setError('Error searching for phone');
      console.error(err);
    }
  };

  const handleSalePriceChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, salePrice: value };
      if (phone && saleMode === 'credit') {
        const salePrice = parseFloat(value) || 0;
        const received = parseFloat(prev.receivedAmount) || 0;
        const remaining = Math.max(0, salePrice - received);
        newData.remainingAmount = remaining.toFixed(2);
      }
      return newData;
    });
  };

  const handleReceivedChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, receivedAmount: value };
      if (phone && saleMode === 'credit') {
        const salePrice = parseFloat(prev.salePrice) || 0;
        const received = parseFloat(value) || 0;
        const remaining = Math.max(0, salePrice - received);
        newData.remainingAmount = remaining.toFixed(2);
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setError('');
    setSuccess(false);

    if (saleMode === 'sale') {
      // Regular sale validation
      if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
        setError('Valid sale price is required');
        return;
      }
    } else {
      // Credit sale validation
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      setError('Valid sale price is required');
      return;
      }
      if (!formData.receivedAmount || parseFloat(formData.receivedAmount) <= 0) {
        setError('Valid received amount is required');
        return;
      }
      if (!formData.customerName.trim()) {
        setError('Customer name is required for credit sales');
        return;
      }
      const salePrice = parseFloat(formData.salePrice);
      const received = parseFloat(formData.receivedAmount);
      if (received >= salePrice) {
        setError('Received amount must be less than sale price for credit sales');
        return;
      }
    }

    setLoading(true);

    try {
      const salePrice = parseFloat(formData.salePrice);
      const profit = salePrice - phone.purchasePrice;
      const receiptNumber = generateReceiptNumber();
      const saleDate = getTodayDate();

      if (saleMode === 'sale') {
        // Regular sale
      await phoneDB.addSale({
        phoneId: phone.id!,
        salePrice,
        saleDate,
        customerName: formData.customerName.trim() || undefined,
        paymentMethod: formData.paymentMethod,
        profit,
        receiptNumber,
          isCredit: false,
      });

      // Prepare receipt data
      const receipt = {
        receiptNumber,
        date: saleDate,
        time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
        model: phone.modelName,
        imei: phone.imei1 + (phone.imei2 ? ` / ${phone.imei2}` : ''),
        salePrice,
        customerName: formData.customerName || 'N/A',
        storeName: 'iWorld Store',
      };

      setReceiptData(receipt);
      setSuccess(true);
      } else {
        // Credit sale
        const received = parseFloat(formData.receivedAmount);
        const remaining = salePrice - received;

        const saleId = await phoneDB.addSale({
          phoneId: phone.id!,
          salePrice,
          saleDate,
          customerName: formData.customerName.trim(),
          paymentMethod: formData.paymentMethod,
          profit,
          receiptNumber,
          isCredit: true,
          creditReceived: received,
          creditRemaining: remaining,
        });

        // Add credit record
        await phoneDB.addCredit({
          phoneId: phone.id!,
          saleId,
          customerName: formData.customerName.trim(),
          totalAmount: salePrice,
          receivedAmount: received,
          remainingAmount: remaining,
          saleDate,
          paymentMethod: formData.paymentMethod,
          status: remaining > 0 ? 'pending' : 'paid',
        });

        // Prepare receipt data
        const receipt = {
          receiptNumber,
          date: saleDate,
          time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
          model: phone.modelName,
          imei: phone.imei1 + (phone.imei2 ? ` / ${phone.imei2}` : ''),
          salePrice,
          receivedAmount: received,
          remainingAmount: remaining,
          customerName: formData.customerName,
          storeName: 'iWorld Store',
          isCredit: true,
        };

        setReceiptData(receipt);
        setSuccess(true);
      }

      // Reset form
      setImei('');
      setPhone(null);
      setSaleMode('sale');
      setFormData({
        salePrice: '',
        receivedAmount: '',
        remainingAmount: '',
        customerName: '',
        paymentMethod: 'Cash',
      });

      // Focus back on IMEI for next sale
      setTimeout(() => imeiRef.current?.focus(), 100);
    } catch (err) {
      setError('Failed to process sale');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const creditSection = receiptData.isCredit
      ? `
            <div><strong>Received:</strong> ${receiptData.receivedAmount.toLocaleString('en-PK')} PKR</div>
            <div><strong>Remaining:</strong> ${receiptData.remainingAmount.toLocaleString('en-PK')} PKR</div>
            <div style="color: red; font-weight: bold; margin-top: 10px;">⚠️ CREDIT SALE</div>
          `
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 300px;
              margin: 20px auto;
              padding: 20px;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .details {
              margin: 20px 0;
            }
            .details div {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
            }
            .promotion {
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${receiptData.storeName}</h1>
          </div>
          <div class="details">
            <div><strong>Receipt #:</strong> ${receiptData.receiptNumber}</div>
            <div><strong>Date:</strong> ${receiptData.date}</div>
            <div><strong>Time:</strong> ${receiptData.time}</div>
            <div><strong>Model:</strong> ${receiptData.model}</div>
            <div><strong>IMEI:</strong> ${receiptData.imei}</div>
            <div><strong>Customer:</strong> ${receiptData.customerName}</div>
            ${creditSection}
            ${!receiptData.isCredit ? `<div class="total">Total: ${receiptData.salePrice.toLocaleString('en-PK')} PKR</div>` : ''}
          </div>
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p class="promotion">Software by Nabeel; 03443814208</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sell Phone</h1>

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

          {/* Phone Details */}
          {phone && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Phone Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Model:</span>
                  <span className="ml-2 font-semibold">{phone.modelName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Storage:</span>
                  <span className="ml-2 font-semibold">{phone.storage}</span>
                </div>
                <div>
                  <span className="text-gray-400">Color:</span>
                  <span className="ml-2 font-semibold">{phone.color}</span>
                </div>
                <div>
                  <span className="text-gray-400">Condition:</span>
                  <span className="ml-2 font-semibold">{phone.condition}</span>
                </div>
                <div>
                  <span className="text-gray-400">Purchase Price:</span>
                  <span className="ml-2 font-semibold">
                    {phone.purchasePrice.toLocaleString('en-PK')} PKR
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Purchase Date:</span>
                  <span className="ml-2 font-semibold">{phone.purchaseDate}</span>
                </div>
              </div>
            </div>
          )}

          {phone && (
            <>
              {/* Sale Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sale Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSaleMode('sale')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      saleMode === 'sale'
                        ? 'bg-accent-green text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Sale Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleMode('credit')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      saleMode === 'credit'
                        ? 'bg-accent-blue text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Credit
                  </button>
                </div>
              </div>

              {saleMode === 'sale' ? (
                <>
                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sale Price (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.salePrice}
                      onChange={(e) => handleSalePriceChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                {formData.salePrice && phone && (
                  <p className="mt-2 text-sm text-green-400">
                    Profit: {(parseFloat(formData.salePrice) - phone.purchasePrice).toLocaleString('en-PK')} PKR
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Customer name"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method (Optional)
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
                </>
              ) : (
                <>
                  {/* Sale Price for Credit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sale Price (PKR) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleSalePriceChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                    {formData.salePrice && phone && (
                      <p className="mt-2 text-sm text-green-400">
                        Profit: {(parseFloat(formData.salePrice) - phone.purchasePrice).toLocaleString('en-PK')} PKR
                      </p>
                    )}
                  </div>

                  {/* Received and Remaining - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Received (PKR) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.receivedAmount}
                        onChange={(e) => handleReceivedChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Remaining (PKR) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.remainingAmount}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>

                  {/* Customer Name - Required for Credit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      placeholder="Customer name"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method (Optional)
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && receiptData && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
              <p className="mb-2">Sale completed successfully!</p>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="mt-2 px-4 py-2 bg-accent-green hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Print Receipt
              </button>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !phone}
              className="flex-1 bg-accent-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
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
