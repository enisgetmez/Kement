/**
 * KEMENT - Modern SSH Terminal
 * Main Process - Electron Application Entry Point
 * 
 * This file handles the main Electron process, window management,
 * and IPC communication for SSH/SFTP operations.
 * 
 * Features:
 * - SSH session management with real connections
 * - SFTP file operations and directory browsing  
 * - Multi-terminal broadcast commands
 * - Persistent connection storage
 * 
 * @author Enis
 * @version 1.0.0
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const Store = require('electron-store');
const SSHSession = require('./src/services/SSHSession');

// Initialize persistent store for user data
const store = new Store();

// Active SSH sessions registry
const activeSessions = new Map();

let mainWindow;

/**
 * Creates the main application window
 * Configures window properties, loads the app, and sets up event handlers
 */
function createWindow() {
  // Create main window with cyberpunk theme
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets/kement.png'),
    title: 'KEMENT - Modern SSH Terminal',
    titleBarStyle: 'default',
    darkTheme: true,
    backgroundColor: '#0a0a0a',
    show: false
  });

  // Load the application
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadFile('dist/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  // Prevent visual flash by showing window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Clean up resources on window close
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close all active SSH sessions
    for (const session of activeSessions.values()) {
      session.disconnect();
    }
    activeSessions.clear();
  });
}

/**
 * Application lifecycle handlers
 */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * IPC Handler: Create SSH Session
 * Establishes a new SSH connection and stores it in the active sessions
 */
ipcMain.handle('create-ssh-session', async (event, { sessionId, connection }) => {
  try {
    const session = new SSHSession(connection);
    
    // Set up session event handlers
    session.on('data', (data) => {
      event.sender.send('ssh-data', { sessionId, data: data.toString() });
    });

    session.on('error', (error) => {
      event.sender.send('ssh-error', { sessionId, error: error.message });
    });

    session.on('disconnected', () => {
      activeSessions.delete(sessionId);
      event.sender.send('ssh-disconnected', { sessionId });
    });

    // Connect to SSH server
    await session.connect();
    
    // Store session for future reference
    activeSessions.set(sessionId, session);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler: Write to SSH Session
 * Sends user input to the SSH terminal
 */
ipcMain.handle('ssh-write', async (event, { sessionId, data }) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    await session.write(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler: Resize SSH Terminal
 * Updates the terminal dimensions for proper display
 */
ipcMain.handle('ssh-resize', async (event, { sessionId, cols, rows }) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.resize(cols, rows);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler: Disconnect SSH Session
 * Cleanly terminates SSH connection and removes from registry
 */
ipcMain.handle('disconnect-ssh-session', async (event, { sessionId }) => {
  try {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.disconnect();
      activeSessions.delete(sessionId);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler: Broadcast Command
 * Sends the same command to all active SSH sessions
 * Useful for multi-server administration
 */
ipcMain.handle('broadcast-command', async (event, { command }) => {
  const results = [];
  
  for (const [sessionId, session] of activeSessions) {
    try {
      await session.write(command);
      results.push({ sessionId, success: true });
    } catch (error) {
      results.push({ sessionId, success: false, error: error.message });
    }
  }
  
  return { success: true, results };
});

/**
 * IPC Handler: SFTP List Directory
 * Retrieves directory contents from remote server via SFTP
 */
ipcMain.handle('sftp-list-directory', async (event, { connection, path: remotePath }) => {
  const sftp = new SftpClient();
  
  try {
    await sftp.connect({
      host: connection.hostname,
      port: connection.port || 22,
      username: connection.username,
      password: connection.password,
      privateKey: connection.privateKey
    });
    
    const files = await sftp.list(remotePath || '/');
    
    // Format file data for frontend consumption
    const formattedFiles = files.map(file => ({
      name: file.name,
      type: file.type === 'd' ? 'directory' : 'file',
      size: file.size,
      modified: new Date(file.modifyTime)
    }));
    
    return { success: true, files: formattedFiles };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await sftp.end();
  }
});

/**
 * IPC Handler: SFTP Upload File
 * Uploads local file to remote server
 */
ipcMain.handle('sftp-upload-file', async (event, { connection, localPath, remotePath }) => {
  const sftp = new SftpClient();
  
  try {
    await sftp.connect({
      host: connection.hostname,
      port: connection.port || 22,
      username: connection.username,
      password: connection.password,
      privateKey: connection.privateKey
    });
    
    await sftp.fastPut(localPath, remotePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await sftp.end();
  }
});

/**
 * IPC Handler: SFTP Download File
 * Downloads remote file to local system
 */
ipcMain.handle('sftp-download-file', async (event, { connection, remotePath, localPath }) => {
  const sftp = new SftpClient();
  
  try {
    await sftp.connect({
      host: connection.hostname,
      port: connection.port || 22,
      username: connection.username,
      password: connection.password,
      privateKey: connection.privateKey
    });
    
    await sftp.fastGet(remotePath, localPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await sftp.end();
  }
});

/**
 * IPC Handler: List Local Directory
 * Provides local file system browsing capabilities
 */
ipcMain.handle('list-local-directory', async (event, { path: localPath }) => {
  try {
    const entries = await fs.readdir(localPath, { withFileTypes: true });
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(localPath, entry.name);
      let stats;
      
      try {
        stats = await fs.stat(fullPath);
      } catch (err) {
        continue; // Skip inaccessible files
      }
      
      files.push({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime
      });
    }
    
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Application startup logging
console.log('KEMENT - Modern SSH Terminal starting...');