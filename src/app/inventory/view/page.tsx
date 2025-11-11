'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { phoneDB } from '@/lib/db-supabase';
import { Phone, PhoneCondition, UnlockStatus, Sale, PaymentMethod, Return } from '@/types';
import { exportToCSV, exportToExcel } from '@/utils/export';
import { getTodayDate } from '@/utils/date';

export default function ViewInventory() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'sold'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setSelectedPhone(null);
  };

  const handleEdit = (phone: Phone) => {
    setSelectedPhone(phone);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (phone: Phone) => {
    setSelectedPhone(phone);
    setShowDetailsModal(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPhone?.id) return;

    try {
      await phoneDB.deletePhone(selectedPhone.id);
      // Reload phones after deletion
      await loadPhones();
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting phone:', error);
      alert('Failed to delete phone. Please try again.');
    }
  };

  const handleEditSave = async (updatedPhone: Partial<Phone>, saleUpdates?: Partial<Sale>) => {
    if (!selectedPhone?.id) return;

    try {
      // Update phone record
      await phoneDB.updatePhone(selectedPhone.id, updatedPhone);
      
      // If phone is sold and sale updates are provided, update sale record
      if (selectedPhone.status === 'sold' && saleUpdates) {
        const sale = await phoneDB.getSaleByPhoneId(selectedPhone.id);
        if (sale?.id) {
          await phoneDB.updateSale(sale.id, saleUpdates);
          
          // If it's a credit sale, update credit record as well
          if (saleUpdates.isCredit && saleUpdates.creditReceived !== undefined) {
            const credits = await phoneDB.getAllCredits();
            const credit = credits.find(c => c.saleId === sale.id);
            if (credit?.id) {
              await phoneDB.updateCredit(credit.id, {
                totalAmount: saleUpdates.salePrice || sale.salePrice,
                receivedAmount: saleUpdates.creditReceived,
                remainingAmount: saleUpdates.creditRemaining || 0,
                status: (saleUpdates.creditRemaining || 0) > 0 ? 'pending' : 'paid',
              });
            }
          }
        }
      }
      
      // Reload phones after update
      await loadPhones();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('Failed to update phone. Please try again.');
    }
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
          <PhoneDetailsModal 
            phone={selectedPhone} 
            onClose={handleCloseModal}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Edit Phone Modal */}
        {showEditModal && selectedPhone && (
          <EditPhoneModal 
            phone={selectedPhone} 
            onClose={handleCloseModal}
            onSave={handleEditSave}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedPhone && (
          <DeleteConfirmModal 
            phone={selectedPhone} 
            onClose={handleCloseModal}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </Layout>
  );
}

// Phone Details Modal Component
function PhoneDetailsModal({ 
  phone, 
  onClose, 
  onEdit, 
  onDelete 
}: { 
  phone: Phone; 
  onClose: () => void;
  onEdit: (phone: Phone) => void;
  onDelete: (phone: Phone) => void;
}) {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(true);
  const [sale, setSale] = useState<Sale | null>(null);

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
    
    // Load return history and sale record for this phone
    const loadData = async () => {
      if (phone.id) {
        try {
          setLoadingReturns(true);
          const [phoneReturns, saleRecord] = await Promise.all([
            phoneDB.getReturnsByPhoneId(phone.id),
            phone.status === 'sold' ? phoneDB.getSaleByPhoneId(phone.id) : Promise.resolve(undefined),
          ]);
          setReturns(phoneReturns);
          if (saleRecord) {
            setSale(saleRecord);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoadingReturns(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, phone.id, phone.status]);

  const handlePrintReceipt = () => {
    if (phone.status !== 'sold' || !phone.receiptNumber) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get sale time from sale record or use current time
    const saleTime = sale?.createdAt 
      ? new Date(sale.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

    // Credit sale section (summary with latest values)
    const creditSection = phone.isCredit && phone.creditReceived !== undefined && phone.creditRemaining !== undefined
      ? `
            <div><strong>Total Sale:</strong> ${phone.salePrice!.toLocaleString('en-PK')} PKR</div>
            <div><strong>Received:</strong> ${phone.creditReceived.toLocaleString('en-PK')} PKR</div>
            <div><strong>Remaining:</strong> ${phone.creditRemaining.toLocaleString('en-PK')} PKR</div>
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
            <h1>iWorld Store</h1>
          </div>
          <div class="details">
            <div><strong>Receipt #:</strong> ${phone.receiptNumber}</div>
            <div><strong>Date:</strong> ${phone.saleDate || 'N/A'}</div>
            <div><strong>Time:</strong> ${saleTime}</div>
            <div><strong>Model:</strong> ${phone.modelName}</div>
            <div><strong>IMEI:</strong> ${phone.imei1}${phone.imei2 ? ` / ${phone.imei2}` : ''}</div>
            <div><strong>Customer:</strong> ${phone.customerName || 'N/A'}</div>
            ${creditSection}
            ${!phone.isCredit ? `<div class="total">Total: ${phone.salePrice!.toLocaleString('en-PK')} PKR</div>` : ''}
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

          {/* Return History */}
          {loadingReturns ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Return History</h3>
              <p className="text-gray-400 text-sm">Loading return history...</p>
            </div>
          ) : returns.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Return History</h3>
              <div className="space-y-4">
                {returns.map((returnRecord, index) => {
                  const returnType = returnRecord.returnType || 'refund';
                  const typeColors = {
                    refund: 'bg-red-900/20 border-red-700/50',
                    trade_in: 'bg-blue-900/20 border-blue-700/50',
                    exchange: 'bg-purple-900/20 border-purple-700/50',
                  };
                  const typeLabels = {
                    refund: 'Refund',
                    trade_in: 'Trade-In',
                    exchange: 'Exchange',
                  };
                  
                  return (
                    <div key={returnRecord.id || index} className={`${typeColors[returnType]} rounded-lg p-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <DetailRow label="Return Type" value={
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            returnType === 'refund' ? 'bg-red-900/50 text-red-300' :
                            returnType === 'trade_in' ? 'bg-blue-900/50 text-blue-300' :
                            'bg-purple-900/50 text-purple-300'
                          }`}>
                            {typeLabels[returnType]}
                          </span>
                        } />
                        <DetailRow label="Return Date" value={returnRecord.returnDate} />
                        <DetailRow label={returnType === 'refund' ? 'Refund Amount' : returnType === 'trade_in' ? 'Buyback Price' : 'Exchange Value'} value={<span className="text-orange-300 font-semibold">{returnRecord.returnPrice.toLocaleString('en-PK')} PKR</span>} />
                        <DetailRow label="New Inventory Price" value={<span className="text-green-300 font-semibold">{returnRecord.newPrice.toLocaleString('en-PK')} PKR</span>} />
                        {returnRecord.returnReason && (
                          <DetailRow label="Return Reason" value={<span className="text-gray-300 italic">{returnRecord.returnReason}</span>} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

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
        <div className="flex justify-between items-center p-6 border-t border-gray-800">
          <div className="flex gap-3">
            {phone.status === 'sold' && (
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                title="Print Receipt"
              >
                🖨️ Print Receipt
              </button>
            )}
            <button
              onClick={() => onEdit(phone)}
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(phone)}
              className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                phone.status === 'sold'
                  ? 'bg-red-900 hover:bg-red-800 text-red-200'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              🗑️ Delete
            </button>
          </div>
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

// Edit Phone Modal Component
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const CONDITION_OPTIONS: PhoneCondition[] = ['Boxpack', '10/10', 'Average'];
const UNLOCK_STATUS_OPTIONS: UnlockStatus[] = ['JV', 'Factory Unlocked', 'PTA'];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank Transfer', 'Other'];

function EditPhoneModal({ 
  phone, 
  onClose, 
  onSave 
}: { 
  phone: Phone; 
  onClose: () => void;
  onSave: (phone: Partial<Phone>, saleUpdates?: Partial<Sale>) => void;
}) {
  const isSold = phone.status === 'sold';
  const isCredit = phone.isCredit || false;
  
  const [formData, setFormData] = useState({
    imei1: phone.imei1,
    imei2: phone.imei2 || '',
    modelName: phone.modelName,
    storage: phone.storage,
    color: phone.color,
    condition: phone.condition,
    unlockStatus: phone.unlockStatus,
    batteryHealth: phone.batteryHealth || '',
    purchasePrice: phone.purchasePrice.toString(),
    purchaseDate: phone.purchaseDate,
    vendor: phone.vendor || '',
    notes: phone.notes || '',
    // Sale fields (only for sold phones)
    salePrice: phone.salePrice?.toString() || '',
    saleDate: phone.saleDate || '',
    customerName: phone.customerName || '',
    paymentMethod: phone.paymentMethod || 'Cash',
    isCredit: isCredit,
    creditReceived: phone.creditReceived?.toString() || '',
    creditRemaining: phone.creditRemaining?.toString() || '',
  });
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

  const handleInputChange = (field: string, value: any) => {
    if (field === 'purchaseDate' || field === 'saleDate') {
      let digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 8) {
        digitsOnly = digitsOnly.slice(0, 8);
      }
      let formatted = digitsOnly;
      if (digitsOnly.length > 2) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2);
      }
      if (digitsOnly.length > 4) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4) + '/' + digitsOnly.slice(4);
      }
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'salePrice' && isSold) {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        // Auto-calculate profit when sale price changes
        if (value && parseFloat(value) > 0) {
          const profit = parseFloat(value) - parseFloat(prev.purchasePrice);
          // Profit is calculated automatically in the submit handler
        }
        return newData;
      });
    } else if (field === 'creditReceived' && isCredit && isSold) {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        const salePrice = parseFloat(prev.salePrice) || 0;
        const received = parseFloat(value) || 0;
        const remaining = Math.max(0, salePrice - received);
        newData.creditRemaining = remaining.toFixed(2);
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    // Validate sale fields if phone is sold
    if (isSold) {
      if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
        setError('Valid sale price is required');
        return;
      }
      if (isCredit) {
        if (!formData.creditReceived || parseFloat(formData.creditReceived) <= 0) {
          setError('Valid credit received amount is required');
          return;
        }
        const salePrice = parseFloat(formData.salePrice);
        const received = parseFloat(formData.creditReceived);
        if (received >= salePrice) {
          setError('Received amount must be less than sale price for credit sales');
          return;
        }
      }
    }

    // Check for duplicate IMEI (excluding current phone)
    const allPhones = await phoneDB.getAllPhones();
    const duplicate = allPhones.find(
      p => p.id !== phone.id && (
        p.imei1 === formData.imei1 || p.imei2 === formData.imei1 ||
        (formData.imei2 && (p.imei1 === formData.imei2 || p.imei2 === formData.imei2))
      )
    );

    if (duplicate) {
      setError('Phone with this IMEI already exists in inventory');
      return;
    }

    setLoading(true);

    try {
      const updatedPhone: Partial<Phone> = {
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
        vendor: formData.vendor.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      let saleUpdates: Partial<Sale> | undefined = undefined;

      // If phone is sold, include sale information
      if (isSold) {
        const salePrice = parseFloat(formData.salePrice);
        const purchasePrice = parseFloat(formData.purchasePrice);
        const profit = salePrice - purchasePrice;

        updatedPhone.salePrice = salePrice;
        updatedPhone.saleDate = formData.saleDate;
        updatedPhone.customerName = formData.customerName.trim() || undefined;
        updatedPhone.paymentMethod = formData.paymentMethod;
        updatedPhone.isCredit = isCredit;

        if (isCredit) {
          const received = parseFloat(formData.creditReceived);
          const remaining = salePrice - received;
          updatedPhone.creditReceived = received;
          updatedPhone.creditRemaining = remaining;
        } else {
          updatedPhone.creditReceived = undefined;
          updatedPhone.creditRemaining = undefined;
        }

        // Prepare sale record updates
        saleUpdates = {
          salePrice,
          saleDate: formData.saleDate,
          customerName: formData.customerName.trim() || undefined,
          paymentMethod: formData.paymentMethod,
          profit,
          isCredit: isCredit,
        };

        if (isCredit) {
          saleUpdates.creditReceived = parseFloat(formData.creditReceived);
          saleUpdates.creditRemaining = parseFloat(formData.creditRemaining);
        } else {
          saleUpdates.creditReceived = undefined;
          saleUpdates.creditRemaining = undefined;
        }
      }

      onSave(updatedPhone, saleUpdates);
    } catch (err) {
      setError('Failed to update phone');
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
        className="bg-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white">✏️ Edit Phone</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IMEI Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IMEI 1 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.imei1}
                onChange={(e) => handleInputChange('imei1', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IMEI 2 <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.imei2}
                onChange={(e) => handleInputChange('imei2', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
          </div>

          {/* Model and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              />
            </div>
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

          {/* Storage and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              />
            </div>
          </div>

          {/* Unlock Status and Purchase Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Purchase Price (PKR) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Battery Health and Purchase Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Battery Health <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.batteryHealth}
                onChange={(e) => handleInputChange('batteryHealth', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="e.g., 85%, 100%"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Purchase Date <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="DD/MM/YYYY"
                maxLength={10}
                required
              />
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
            />
          </div>

          {/* Sale Information Section (only for sold phones) */}
          {isSold && (
            <div className="border-t border-gray-700 pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-accent-green">Sale Information</h3>
              
              {/* Sale Price and Sale Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sale Price (PKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                    min="0"
                    step="0.01"
                    required
                  />
                  {formData.salePrice && (
                    <p className="mt-2 text-sm text-green-400">
                      Profit: {(parseFloat(formData.salePrice) - parseFloat(formData.purchasePrice)).toLocaleString('en-PK')} PKR
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sale Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.saleDate}
                    onChange={(e) => handleInputChange('saleDate', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Customer Name and Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Credit Sale Fields */}
              {isCredit && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 space-y-4">
                  <h4 className="text-md font-semibold text-blue-300">Credit Sale Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Credit Received (PKR) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.creditReceived}
                        onChange={(e) => handleInputChange('creditReceived', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Credit Remaining (PKR)
                      </label>
                      <input
                        type="number"
                        value={formData.creditRemaining}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Warning for sold phones */}
          {isSold && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
              ⚠️ Warning: This phone has been sold. Editing sale information will update the sale record and recalculate profit.
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({ 
  phone, 
  onClose, 
  onConfirm 
}: { 
  phone: Phone; 
  onClose: () => void;
  onConfirm: () => void;
}) {
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

  const isSold = phone.status === 'sold';

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-gray-900 rounded-xl border-2 border-red-700 shadow-2xl max-w-md w-full relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-red-900/20">
          <h2 className="text-2xl font-bold text-red-400">🗑️ Delete Phone</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-white text-lg">
            Are you sure you want to delete this phone from inventory?
          </p>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Model:</span> <span className="text-white font-semibold">{phone.modelName}</span></div>
              <div><span className="text-gray-400">IMEI1:</span> <span className="text-white font-mono">{phone.imei1}</span></div>
              <div><span className="text-gray-400">Purchase Price:</span> <span className="text-white font-semibold">{phone.purchasePrice.toLocaleString('en-PK')} PKR</span></div>
              <div><span className="text-gray-400">Status:</span> <span className={`font-semibold ${isSold ? 'text-blue-400' : 'text-green-400'}`}>{isSold ? 'Sold' : 'In Stock'}</span></div>
            </div>
          </div>

          {isSold && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-2">⚠️ Critical Warning:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>This phone has been sold</li>
                <li>Deleting will also remove all related sales records</li>
                <li>All credit records for this phone will be deleted</li>
                <li>This will affect your profit calculations and reports</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          )}

          {!isSold && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
              <p className="text-sm">
                ⚠️ This will remove the phone from inventory and subtract {phone.purchasePrice.toLocaleString('en-PK')} PKR from your stock value.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              isSold
                ? 'bg-red-900 hover:bg-red-800 text-red-200'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Delete Phone
          </button>
        </div>
      </div>
    </div>
  );
}

