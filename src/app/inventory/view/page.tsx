'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db';
import { Phone } from '@/types';
import { exportToCSV, exportToExcel } from '@/utils/export';

export default function ViewInventory() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'sold'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPhones();
  }, []);

  useEffect(() => {
    filterPhones();
  }, [phones, searchQuery, statusFilter]);

  const loadPhones = async () => {
    try {
      const allPhones = await phoneDB.getAllPhones();
      setPhones(allPhones);
    } catch (error) {
      console.error('Error loading phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPhones = () => {
    let filtered = phones;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.imei1.toLowerCase().includes(query) ||
        p.imei2?.toLowerCase().includes(query) ||
        p.modelName.toLowerCase().includes(query)
      );
    }

    setFilteredPhones(filtered);
  };

  const handleExportCSV = () => {
    exportToCSV(phones);
  };

  const handleExportExcel = () => {
    exportToExcel(phones);
  };

  const handleViewDetails = (phone: Phone) => {
    setSelectedPhone(phone);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedPhone(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">View Inventory</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search (IMEI or Model)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="Search by IMEI or model name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="all">All</option>
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-gray-400">
          Showing {filteredPhones.length} of {phones.length} phones
        </div>

        {/* Inventory Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">IMEI1</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Storage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Color</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Condition</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Battery Health</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Purchase Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Sale Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Receipt #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPhones.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                    No phones found
                  </td>
                </tr>
              ) : (
                filteredPhones.map((phone) => (
                  <tr key={phone.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm">{phone.id}</td>
                    <td className="px-4 py-3 text-sm font-mono">{phone.imei1}</td>
                    <td className="px-4 py-3 text-sm">{phone.modelName}</td>
                    <td className="px-4 py-3 text-sm">{phone.storage}</td>
                    <td className="px-4 py-3 text-sm">{phone.color}</td>
                    <td className="px-4 py-3 text-sm">{phone.condition}</td>
                    <td className="px-4 py-3 text-sm">
                      {phone.batteryHealth || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {phone.purchasePrice.toLocaleString('en-PK')} PKR
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {phone.saleDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {phone.receiptNumber ? (
                        <span className="font-mono text-accent-green font-semibold">{phone.receiptNumber}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          phone.status === 'in_stock'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-blue-900/50 text-blue-300'
                        }`}
                      >
                        {phone.status === 'in_stock' ? 'In Stock' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleViewDetails(phone)}
                        className="text-accent-blue hover:text-blue-400 transition-colors"
                        title="View Details"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phone Details Modal */}
        {showDetailsModal && selectedPhone && (
          <PhoneDetailsModal phone={selectedPhone} onClose={handleCloseModal} />
        )}
      </div>
    </Layout>
  );
}

// Phone Details Modal Component
function PhoneDetailsModal({ phone, onClose }: { phone: Phone; onClose: () => void }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close modal on Escape key
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

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white">📱 Phone Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-blue">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="ID" value={phone.id?.toString() || 'N/A'} />
                    <DetailRow label="Status" value={
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          phone.status === 'in_stock'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-blue-900/50 text-blue-300'
                        }`}
                      >
                        {phone.status === 'in_stock' ? 'In Stock' : 'Sold'}
                      </span>
                    } />
                    <DetailRow label="Model Name" value={phone.modelName} />
                    <DetailRow label="Storage" value={phone.storage} />
                    <DetailRow label="Color" value={phone.color} />
                    <DetailRow label="Condition" value={phone.condition} />
                    <DetailRow label="Unlock Status" value={phone.unlockStatus} />
                    <DetailRow label="Battery Health" value={phone.batteryHealth || 'N/A'} />
                  </div>
          </div>

          {/* IMEI Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-blue">IMEI Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="IMEI 1" value={<span className="font-mono">{phone.imei1}</span>} />
              <DetailRow label="IMEI 2" value={phone.imei2 ? <span className="font-mono">{phone.imei2}</span> : 'N/A'} />
            </div>
          </div>

          {/* Purchase Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-blue">Purchase Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Purchase Date" value={phone.purchaseDate} />
              <DetailRow label="Purchase Price" value={`${phone.purchasePrice.toLocaleString('en-PK')} PKR`} />
              <DetailRow label="Vendor" value={phone.vendor || 'N/A'} />
            </div>
          </div>

          {/* Sale Information */}
          {phone.status === 'sold' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-accent-green">Sale Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="Receipt Number" value={phone.receiptNumber ? <span className="font-mono font-semibold text-accent-green">{phone.receiptNumber}</span> : 'N/A'} />
                <DetailRow label="Sale Date" value={phone.saleDate || 'N/A'} />
                <DetailRow label="Sale Price" value={phone.salePrice ? `${phone.salePrice.toLocaleString('en-PK')} PKR` : 'N/A'} />
                <DetailRow label="Customer Name" value={phone.customerName || 'N/A'} />
                <DetailRow label="Payment Method" value={phone.paymentMethod || 'N/A'} />
                {phone.isCredit && (
                  <>
                    <DetailRow label="Credit Received" value={phone.creditReceived ? `${phone.creditReceived.toLocaleString('en-PK')} PKR` : 'N/A'} />
                    <DetailRow label="Credit Remaining" value={phone.creditRemaining ? <span className="text-yellow-400 font-semibold">{phone.creditRemaining.toLocaleString('en-PK')} PKR</span> : 'N/A'} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {phone.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-accent-blue">Notes</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 whitespace-pre-wrap">{phone.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-400">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Created At" value={phone.createdAt ? new Date(phone.createdAt).toLocaleString() : 'N/A'} />
              <DetailRow label="Updated At" value={phone.updatedAt ? new Date(phone.updatedAt).toLocaleString() : 'N/A'} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

