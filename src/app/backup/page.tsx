'use client';

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { exportBackup, importBackup } from '@/utils/backup';
import { phoneDB } from '@/lib/db-supabase';

export default function BackupPage() {
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<{ phones: number; sales: number; returns: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [phones, sales, returns] = await Promise.all([
        phoneDB.getAllPhones(),
        phoneDB.getAllSales(),
        phoneDB.getAllReturns(),
      ]);
      setStats({
        phones: phones.length,
        sales: sales.length,
        returns: returns.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleExportBackup = async () => {
    try {
      setBackupMessage(null);
      setExporting(true);
      await exportBackup();
      setBackupMessage({ type: 'success', text: 'Backup exported successfully! Check your downloads folder.' });
      setTimeout(() => setBackupMessage(null), 5000);
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to export backup. Please try again.' });
      setTimeout(() => setBackupMessage(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Confirm before importing (this will replace all data)
    const confirmed = window.confirm(
      '⚠️ WARNING: Importing a backup will replace ALL existing data. This action cannot be undone.\n\n' +
      'Make sure you have exported a current backup before proceeding.\n\n' +
      'Do you want to continue?'
    );

    if (!confirmed) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImporting(true);
    setBackupMessage(null);

    try {
      const result = await importBackup(file);
      setBackupMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
      
      if (result.success) {
        // Reload stats after successful import
        await loadStats();
      }
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to import backup. Please try again.' });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backup & Restore</h1>
          <p className="text-gray-400">
            Export your data to a JSON file for backup, or import a previous backup to restore your data.
          </p>
        </div>

        {/* Current Data Stats */}
        {stats && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Current Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Phones</p>
                <p className="text-2xl font-bold">{stats.phones}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Sales</p>
                <p className="text-2xl font-bold">{stats.sales}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Returns</p>
                <p className="text-2xl font-bold">{stats.returns}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Backup */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Export Backup</h2>
              <p className="text-gray-400 text-sm">
                Download all your data (phones, sales, returns) as a JSON file. Store this file in a safe place.
              </p>
            </div>
            <span className="text-4xl">💾</span>
          </div>
          
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="w-full bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>Export Backup</span>
              </>
            )}
          </button>
          
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300 mb-2"><strong>What gets backed up:</strong></p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>All phones in inventory (with all details)</li>
              <li>All sales records</li>
              <li>All return/refund records</li>
              <li>Complete data with all fields</li>
            </ul>
          </div>
        </div>

        {/* Import Backup */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Import Backup</h2>
              <p className="text-gray-400 text-sm">
                Restore your data from a previously exported JSON backup file.
              </p>
            </div>
            <span className="text-4xl">📤</span>
          </div>

          {backupMessage && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg ${
                backupMessage.type === 'success'
                  ? 'bg-green-900/50 border border-green-700 text-green-200'
                  : 'bg-red-900/50 border border-red-700 text-red-200'
              }`}
            >
              {backupMessage.text}
            </div>
          )}

          <label className="block">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={importing}
              className="hidden"
            />
            <span
              className={`block w-full text-center font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer ${
                importing
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-accent-green hover:bg-green-600 text-white'
              }`}
            >
              {importing ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Importing...
                </>
              ) : (
                <>
                  <span className="inline-block mr-2">📁</span>
                  Choose Backup File
                </>
              )}
            </span>
          </label>

          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-200 mb-2"><strong>⚠️ Important:</strong></p>
            <ul className="text-sm text-yellow-300/80 space-y-1 list-disc list-inside">
              <li>Importing will <strong>replace ALL existing data</strong></li>
              <li>This action <strong>cannot be undone</strong></li>
              <li>Make sure to export a current backup before importing</li>
              <li>Only import files that were exported from this app</li>
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">💡 Backup Tips</h3>
          <ul className="text-sm text-blue-300/80 space-y-2">
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Export regularly:</strong> Create backups daily or weekly to prevent data loss</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Store safely:</strong> Save backup files to Google Drive, Dropbox, iCloud, or external drives</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Keep multiple backups:</strong> Don't rely on a single backup file</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Test your backups:</strong> Periodically verify that your backup files can be imported successfully</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

