import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import { spawn, ChildProcess } from 'child_process';
import { initDatabase } from '../server/database';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
const SERVER_PORT = 3001;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Start the Express server
function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    // In production (packaged), server is in resources/server
    // In development, server is in dist/server
    let serverPath: string;
    if (app.isPackaged) {
      // Packaged app: server is in resources/server
      serverPath = path.join(process.resourcesPath, 'server', 'index.js');
    } else {
      // Development: server is in dist/server
      serverPath = path.join(__dirname, '../server/index.js');
    }
    
    console.log('Starting Express server...');
    console.log('Server path:', serverPath);
    
    // Check if server file exists
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server file not found at: ${serverPath}`));
      return;
    }

    // Determine working directory for server
    const serverDir = app.isPackaged 
      ? path.join(process.resourcesPath, 'server')
      : path.join(__dirname, '..');
    
    // Start the server
    serverProcess = spawn('node', [serverPath], {
      cwd: serverDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
      },
    });

    let serverReady = false;

    // Wait for server to be ready
    const checkServer = setInterval(() => {
      const req = http.get(`${SERVER_URL}/api/health`, (res) => {
        if (res.statusCode === 200 && !serverReady) {
          serverReady = true;
          clearInterval(checkServer);
          console.log('✅ Server is ready!');
          resolve();
        }
      });
      
      req.on('error', () => {
        // Server not ready yet, keep waiting
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
      });
    }, 500);

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        clearInterval(checkServer);
        reject(new Error('Server failed to start within 30 seconds'));
      }
    }, 30000);

    // Handle server output
    serverProcess.stdout?.on('data', (data) => {
      console.log(`[Server] ${data.toString()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      clearInterval(checkServer);
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (code !== null && code !== 0) {
        console.error('Server exited unexpectedly');
      }
    });
  });
}

// Stop the Express server
function stopServer() {
  if (serverProcess) {
    console.log('Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

function createWindow() {
  // Destroy existing window if it exists
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready
    title: 'iWorld Store POS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../build/icon.png'),
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.center();
    }
  });

  // Load the React app from the server
  mainWindow.loadURL(SERVER_URL);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app
app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready');
  
  // Initialize database
  initDatabase();
  console.log('✅ Database initialized');

  // Start server
  try {
    await startServer();
    
    // Create window after server is ready
    createWindow();
    console.log('✅ Window created');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Stop server before quitting
  stopServer();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Stop server before quitting
  stopServer();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
