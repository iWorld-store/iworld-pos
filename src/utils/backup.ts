import { Phone, Sale, Return, BackupData, Credit, CreditPayment } from '@/types';
import { phoneDB } from '@/lib/db-supabase';

const BACKUP_VERSION = '1.0.0';

/**
 * Export all data to a JSON backup file
 */
export async function exportBackup(): Promise<void> {
  try {
    const [phones, sales, returns, credits, creditPayments] = await Promise.all([
      phoneDB.getAllPhones(),
      phoneDB.getAllSales(),
      phoneDB.getAllReturns(),
      phoneDB.getAllCredits(),
      phoneDB.getAllCreditPayments(),
    ]);

    const backupData: BackupData = {
      phones,
      sales,
      returns,
      credits,
      creditPayments,
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
 * Validate backup data structure and integrity
 */
function validateBackup(backupData: BackupData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required arrays exist
  if (!backupData.phones || !Array.isArray(backupData.phones)) {
    errors.push('Missing or invalid phones array');
  }
  if (!backupData.sales || !Array.isArray(backupData.sales)) {
    errors.push('Missing or invalid sales array');
  }
  if (!backupData.returns || !Array.isArray(backupData.returns)) {
    errors.push('Missing or invalid returns array');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate phone IDs exist for all sales
  const phoneIds = new Set(backupData.phones.map(p => p.id).filter(id => id !== undefined));
  const invalidSales = backupData.sales.filter(sale => !phoneIds.has(sale.phoneId));
  if (invalidSales.length > 0) {
    errors.push(`${invalidSales.length} sale(s) reference phone IDs that don't exist in phones array`);
  }

  // Validate sale IDs exist for all returns
  const saleIds = new Set(backupData.sales.map(s => s.id).filter(id => id !== undefined));
  const invalidReturns = backupData.returns.filter(ret => !saleIds.has(ret.saleId));
  if (invalidReturns.length > 0) {
    errors.push(`${invalidReturns.length} return(s) reference sale IDs that don't exist in sales array`);
  }

  // Validate credit references
  if (backupData.credits && backupData.credits.length > 0) {
    const invalidCredits = backupData.credits.filter(credit => 
      !phoneIds.has(credit.phoneId) || !saleIds.has(credit.saleId)
    );
    if (invalidCredits.length > 0) {
      errors.push(`${invalidCredits.length} credit(s) reference invalid phone or sale IDs`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a safety backup of current data before import
 */
async function createSafetyBackup(): Promise<string | null> {
  try {
    const [phones, sales, returns, credits, creditPayments] = await Promise.all([
      phoneDB.getAllPhones(),
      phoneDB.getAllSales(),
      phoneDB.getAllReturns(),
      phoneDB.getAllCredits(),
      phoneDB.getAllCreditPayments(),
    ]);

    // Only create backup if there's actual data
    if (phones.length === 0 && sales.length === 0 && returns.length === 0) {
      return null; // No data to backup
    }

    const backupData: BackupData = {
      phones,
      sales,
      returns,
      credits,
      creditPayments,
      exportDate: new Date().toISOString(),
      version: BACKUP_VERSION,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `safety-backup-before-import-${timestamp}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return `safety-backup-before-import-${timestamp}.json`;
  } catch (error) {
    console.error('Failed to create safety backup:', error);
    return null;
  }
}

/**
 * Import data from a JSON backup file
 */
export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
  let safetyBackupCreated = false;
  let safetyBackupFilename: string | null = null;

  try {
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    // Step 1: Validate backup structure and integrity FIRST
    const validation = validateBackup(backupData);
    if (!validation.valid) {
      return {
        success: false,
        message: `Backup validation failed: ${validation.errors.join('; ')}. Import cancelled to protect your data.`,
      };
    }

    // Step 2: Create automatic safety backup of current data
    console.log('Creating safety backup of current data...');
    safetyBackupFilename = await createSafetyBackup();
    if (safetyBackupFilename) {
      safetyBackupCreated = true;
      console.log(`Safety backup created: ${safetyBackupFilename}`);
    } else {
      console.log('No existing data to backup (database is empty)');
    }

    // Step 3: Validate version (optional - for future compatibility)
    if (backupData.version && backupData.version !== BACKUP_VERSION) {
      console.warn(`Backup version ${backupData.version} differs from current version ${BACKUP_VERSION}`);
    }

    // Step 4: NOW we can safely clear existing data (after validation and safety backup)
    console.log('Clearing existing data...');
    await phoneDB.clearAllData();

    // Create mappings for old IDs -> new IDs
    const phoneIdMap = new Map<number, number>();
    const saleIdMap = new Map<number, number>();
    const phoneImportErrors: Array<{ oldId: number; error: string }> = [];

    // Step 1: Import phones and create phone ID mapping
    // IMPORTANT: Import phones WITHOUT sale information to avoid conflicts
    // Sales will update the phones with sale information later
    for (const phone of backupData.phones) {
      const oldId = phone.id;
      try {
        const { id, saleDate, salePrice, receiptNumber, customerName, paymentMethod, status, ...phoneData } = phone;
        
        // Import phone with status 'in_stock' initially (sales will update status later)
        // This prevents conflicts and ensures data consistency
        const newId = await phoneDB.addPhone({
          ...phoneData,
          status: 'in_stock', // Reset to in_stock, sales will update this
          saleDate: 'N/A', // Clear sale date
          salePrice: undefined, // Clear sale price
          receiptNumber: undefined, // Clear receipt number
          customerName: undefined, // Clear customer name
          paymentMethod: undefined, // Clear payment method
        });
        
        if (oldId !== undefined) {
          phoneIdMap.set(oldId, newId);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to import phone with old ID ${oldId}:`, errorMessage);
        phoneImportErrors.push({ oldId: oldId || -1, error: errorMessage });
        // Continue importing other phones even if one fails
      }
    }

    // Log any phone import errors
    if (phoneImportErrors.length > 0) {
      console.warn(`Failed to import ${phoneImportErrors.length} phone(s):`, phoneImportErrors);
    }

    // Step 2: Import sales and create sale ID mapping
    // Map old phone IDs to new phone IDs, and track old sale IDs to new sale IDs
    let salesSkipped = 0;
    for (const sale of backupData.sales) {
      const oldSaleId = sale.id;
      try {
        const { id, ...saleData } = sale;
        
        // Map phoneId from old to new
        const newPhoneId = phoneIdMap.get(saleData.phoneId);
        if (!newPhoneId) {
          console.warn(`Skipping sale ID ${oldSaleId}: Phone ID ${saleData.phoneId} not found in imported phones`);
          salesSkipped++;
          continue; // Skip sales for phones that weren't imported
        }
        
        const newSaleId = await phoneDB.addSale({
          ...saleData,
          phoneId: newPhoneId,
        });
        
        if (oldSaleId !== undefined) {
          saleIdMap.set(oldSaleId, newSaleId);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to import sale with old ID ${oldSaleId}:`, errorMessage);
        salesSkipped++;
        // Continue importing other sales even if one fails
      }
    }

    // Step 3: Import returns
    // Map both phoneId and saleId from old to new
    let returnsImported = 0;
    for (const returnData of backupData.returns) {
      const { id, ...returnItem } = returnData;
      
      // Map phoneId
      const newPhoneId = phoneIdMap.get(returnItem.phoneId);
      if (!newPhoneId) {
        console.warn(`Skipping return: Phone ID ${returnItem.phoneId} not found`);
        continue;
      }
      
      // Map saleId
      const newSaleId = saleIdMap.get(returnItem.saleId);
      if (!newSaleId) {
        console.warn(`Skipping return: Sale ID ${returnItem.saleId} not found`);
        continue;
      }
      
      await phoneDB.addReturn({
        ...returnItem,
        phoneId: newPhoneId,
        saleId: newSaleId,
      });
      returnsImported++;
    }

    // Step 4: Import credits (need to map phoneId and saleId)
    let creditsImported = 0;
    if (backupData.credits && backupData.credits.length > 0) {
      for (const credit of backupData.credits) {
        const { id, ...creditData } = credit;
        
        // Map phoneId
        const newPhoneId = phoneIdMap.get(creditData.phoneId);
        if (!newPhoneId) {
          console.warn(`Skipping credit: Phone ID ${creditData.phoneId} not found`);
          continue;
        }
        
        // Map saleId
        const newSaleId = saleIdMap.get(creditData.saleId);
        if (!newSaleId) {
          console.warn(`Skipping credit: Sale ID ${creditData.saleId} not found`);
          continue;
        }
        
        await phoneDB.addCredit({
          ...creditData,
          phoneId: newPhoneId,
          saleId: newSaleId,
        });
        creditsImported++;
      }
    }

    // Step 5: Credit payments are skipped (should be recreated through the app)
    const paymentsCount = backupData.creditPayments?.length || 0;
    const phonesImported = phoneIdMap.size;
    const phonesFailed = phoneImportErrors.length;
    const salesImported = saleIdMap.size;
    const returnsImportedCount = returnsImported;
    
    let message = `Successfully imported ${phonesImported} phones`;
    if (phonesFailed > 0) {
      message += ` (${phonesFailed} failed)`;
    }
    message += `, ${salesImported} sales`;
    if (salesSkipped > 0) {
      message += ` (${salesSkipped} skipped)`;
    }
    message += `, ${returnsImportedCount} returns`;
    if (creditsImported > 0) {
      message += `, ${creditsImported} credits`;
    }
    if (paymentsCount > 0) {
      message += ` (${paymentsCount} payments skipped - should be recreated through app)`;
    }
    message += '.';
    
    if (phonesFailed > 0 || salesSkipped > 0) {
      message += ' Check console for details about skipped items.';
    }

    // Add safety backup info to success message
    if (safetyBackupCreated && safetyBackupFilename) {
      message += ` A safety backup of your previous data was automatically saved as "${safetyBackupFilename}".`;
    }
    
    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('Error importing backup:', error);
    
    // If import failed but we created a safety backup, inform the user
    let errorMessage = '';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON file. Please check the file format.';
    } else if (error && typeof error === 'object' && 'message' in error) {
      const err = error as any;
      errorMessage = `Failed to import backup: ${err.message || 'Unknown error'}${err.code ? ` (${err.code})` : ''}`;
      console.error('Import error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });
    } else {
      errorMessage = 'Failed to import backup. Please try again.';
    }

    // Add safety backup info to error message
    if (safetyBackupCreated && safetyBackupFilename) {
      errorMessage += ` IMPORTANT: A safety backup of your previous data was automatically saved as "${safetyBackupFilename}". Your original data is safe.`;
    } else if (!safetyBackupCreated) {
      errorMessage += ' No safety backup was created (database was empty or backup creation failed).';
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

