import { Phone, Sale, Return, BackupData, Credit } from '@/types';
import { phoneDB, db } from '@/lib/db';

const BACKUP_VERSION = '1.0.0';

/**
 * Export all data to a JSON backup file
 */
export async function exportBackup(): Promise<void> {
  try {
    const [phones, sales, returns, credits] = await Promise.all([
      phoneDB.getAllPhones(),
      phoneDB.getAllSales(),
      phoneDB.getAllReturns(),
      phoneDB.getAllCredits(),
    ]);

    const backupData: BackupData = {
      phones,
      sales,
      returns,
      credits,
      exportDate: new Date().toISOString(),
      version: BACKUP_VERSION,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.setAttribute('href', url);
    link.setAttribute('download', `iphone-pos-backup-${timestamp}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting backup:', error);
    throw new Error('Failed to export backup');
  }
}

/**
 * Import data from a JSON backup file
 */
export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    // Validate backup data structure
    if (!backupData.phones || !backupData.sales || !backupData.returns) {
      return {
        success: false,
        message: 'Invalid backup file format. Missing required data.',
      };
    }

    // Import credits if they exist (for backward compatibility)
    if (backupData.credits && backupData.credits.length > 0) {
      for (const credit of backupData.credits) {
        if (credit.id) {
          await db.credits.add(credit as Credit);
        } else {
          const { id, ...creditData } = credit;
          await phoneDB.addCredit(creditData);
        }
      }
    }

    // Validate version (optional - for future compatibility)
    if (backupData.version && backupData.version !== BACKUP_VERSION) {
      console.warn(`Backup version ${backupData.version} differs from current version ${BACKUP_VERSION}`);
    }

    // Clear existing data
    await phoneDB.clearAllData();

    // Import phones (preserve IDs if they exist)
    for (const phone of backupData.phones) {
      if (phone.id) {
        // If phone has an ID, add it directly to preserve the ID
        await db.phones.add(phone as Phone);
      } else {
        const { id, ...phoneData } = phone;
        await phoneDB.addPhone(phoneData);
      }
    }

    // Import sales (preserve IDs if they exist)
    for (const sale of backupData.sales) {
      if (sale.id) {
        await db.sales.add(sale as Sale);
      } else {
        const { id, ...saleData } = sale;
        await phoneDB.addSale(saleData);
      }
    }

    // Import returns (preserve IDs if they exist)
    for (const returnData of backupData.returns) {
      if (returnData.id) {
        await db.returns.add(returnData as Return);
      } else {
        const { id, ...returnItem } = returnData;
        await phoneDB.addReturn(returnItem);
      }
    }

    const creditsCount = backupData.credits?.length || 0;
    return {
      success: true,
      message: `Successfully imported ${backupData.phones.length} phones, ${backupData.sales.length} sales, ${backupData.returns.length} returns${creditsCount > 0 ? `, and ${creditsCount} credits` : ''}.`,
    };
  } catch (error) {
    console.error('Error importing backup:', error);
    if (error instanceof SyntaxError) {
      return {
        success: false,
        message: 'Invalid JSON file. Please check the file format.',
      };
    }
    return {
      success: false,
      message: 'Failed to import backup. Please try again.',
    };
  }
}

