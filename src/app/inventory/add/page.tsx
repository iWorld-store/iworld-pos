'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db';
import { getTodayDate } from '@/utils/date';
import { Phone, PhoneCondition, UnlockStatus } from '@/types';

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const CONDITION_OPTIONS: PhoneCondition[] = ['Boxpack', '10/10', 'Average'];
const UNLOCK_STATUS_OPTIONS: UnlockStatus[] = ['JV', 'Factory Unlocked', 'PTA'];

export default function AddInventory() {
  const router = useRouter();
  const imei1Ref = useRef<HTMLInputElement>(null);
  const imei2Ref = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    imei1: '',
    imei2: '',
    modelName: '',
    storage: '128GB',
    color: '',
    condition: '10/10' as PhoneCondition,
    unlockStatus: 'Factory Unlocked' as UnlockStatus,
    batteryHealth: '',
    purchasePrice: '',
    purchaseDate: getTodayDate(),
    vendor: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle barcode scanner input (IMEI scanning)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // If Enter is pressed and IMEI1 field is focused, move focus to IMEI2
      if (e.key === 'Enter' && document.activeElement === imei1Ref.current) {
        e.preventDefault();
        if (formData.imei1) {
          setTimeout(() => imei2Ref.current?.focus(), 100);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [formData.imei1]);

  const handleInputChange = (field: string, value: any) => {
    // Format date input for purchaseDate field
    if (field === 'purchaseDate') {
      // Remove all non-digit characters
      let digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 8 digits (DDMMYYYY)
      if (digitsOnly.length > 8) {
        digitsOnly = digitsOnly.slice(0, 8);
      }
      
      // Format as DD/MM/YYYY
      let formatted = digitsOnly;
      if (digitsOnly.length > 2) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2);
      }
      if (digitsOnly.length > 4) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4) + '/' + digitsOnly.slice(4);
      }
      
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
    setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.imei1.trim()) {
      setError('IMEI1 is required');
      return;
    }
    if (!formData.modelName.trim()) {
      setError('Model name is required');
      return;
    }
    if (!formData.color.trim()) {
      setError('Color is required');
      return;
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      setError('Valid purchase price is required');
      return;
    }

    // Check for duplicate IMEI
    const existingPhones = await phoneDB.getAllPhones();
    const duplicate = existingPhones.find(
      p => p.imei1 === formData.imei1 || p.imei2 === formData.imei1 ||
           (formData.imei2 && (p.imei1 === formData.imei2 || p.imei2 === formData.imei2))
    );

    if (duplicate) {
      setError('Phone with this IMEI already exists in inventory');
      return;
    }

    setLoading(true);

    try {
      const phone: Omit<Phone, 'id'> = {
        imei1: formData.imei1.trim(),
        imei2: formData.imei2.trim() || undefined,
        modelName: formData.modelName.trim(),
        storage: formData.storage,
        color: formData.color.trim(),
        condition: formData.condition,
        unlockStatus: formData.unlockStatus,
        batteryHealth: formData.batteryHealth.trim() || undefined,
        purchaseDate: formData.purchaseDate,
        purchasePrice: parseFloat(formData.purchasePrice),
        saleDate: 'N/A',
        status: 'in_stock',
        vendor: formData.vendor.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await phoneDB.addPhone(phone);
      setSuccess(true);

      // Reset form
      setFormData({
        imei1: '',
        imei2: '',
        modelName: '',
        storage: '128GB',
        color: '',
        condition: '10/10',
        unlockStatus: 'Factory Unlocked',
        batteryHealth: '',
        purchasePrice: '',
        purchaseDate: getTodayDate(),
        vendor: '',
        notes: '',
      });

      // Focus back on IMEI1 for next scan
      setTimeout(() => imei1Ref.current?.focus(), 100);
    } catch (err) {
      setError('Failed to add phone to inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add to Inventory</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-6">
          {/* IMEI Fields - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IMEI1 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                IMEI 1 <span className="text-red-400">*</span>
            </label>
            <input
              ref={imei1Ref}
              type="text"
              value={formData.imei1}
              onChange={(e) => handleInputChange('imei1', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="Scan or enter IMEI 1"
              required
              autoFocus
            />
          </div>

          {/* IMEI2 (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IMEI 2 <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                ref={imei2Ref}
                type="text"
                value={formData.imei2}
                onChange={(e) => handleInputChange('imei2', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="Scan or enter IMEI 2"
              />
            </div>
          </div>

          {/* Model Name and Condition - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="e.g., iPhone 13 Pro Max"
              required
            />
          </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value as PhoneCondition)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              >
                {CONDITION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Storage and Color - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Storage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Storage <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.storage}
              onChange={(e) => handleInputChange('storage', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            >
              {STORAGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="e.g., Green, Blue, Black"
              required
            />
          </div>
          </div>

          {/* Unlock Status and Purchase Price - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unlock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Unlock Status <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.unlockStatus}
              onChange={(e) => handleInputChange('unlockStatus', e.target.value as UnlockStatus)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            >
              {UNLOCK_STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Purchase Price (PKR) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          </div>

          {/* Battery Health and Purchase Date - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Battery Health */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Battery Health <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.batteryHealth}
                onChange={(e) => handleInputChange('batteryHealth', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="e.g., 85%, 100%, 92%"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">Enter percentage (e.g., 85%)</p>
            </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Purchase Date <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                onBlur={(e) => {
                  // Validate date format on blur
                  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                  const match = e.target.value.match(datePattern);
                  if (e.target.value && !match) {
                    setError('Please enter date in DD/MM/YYYY format (e.g., 25/12/2024)');
                  } else if (match) {
                    const day = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10);
                    const year = parseInt(match[3], 10);
                    
                    // Validate day, month, year ranges
                    if (day < 1 || day > 31) {
                      setError('Day must be between 01 and 31');
                    } else if (month < 1 || month > 12) {
                      setError('Month must be between 01 and 12');
                    } else if (year < 1900 || year > 2100) {
                      setError('Year must be between 1900 and 2100');
                    }
                  }
                }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="DD/MM/YYYY"
                maxLength={10}
              required
            />
              <p className="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY (e.g., 25/12/2024)</p>
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vendor (Optional)
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => handleInputChange('vendor', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Purchase source"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              rows={3}
              placeholder="Additional notes"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
              Phone added to inventory successfully!
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add to Inventory'}
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

