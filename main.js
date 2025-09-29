const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const Store = require('electron-store');
const SSHSession = require('./src/services/SSHSession');

// AI Services
const aiService = require('./src/services/AIService');

// Initialize persistent store
const store = new Store();

// Store active SSH sessions
const activeSessions = new Map();

let mainWindow;

function createWindow() {
  // Create the browser window with cyberpunk dark theme
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'KEMENT - AI-Powered SSH Terminal',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    darkTheme: true,
    backgroundColor: '#0a0a0a',
    show: false
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadFile('dist/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for SSH connections
ipcMain.handle('save-connection', async (event, connectionData) => {
  try {
    const connections = store.get('connections', []);
    const existingIndex = connections.findIndex(conn => conn.id === connectionData.id);
    
    if (existingIndex >= 0) {
      connections[existingIndex] = connectionData;
    } else {
      connectionData.id = Date.now().toString();
      connections.push(connectionData);
    }
    
    store.set('connections', connections);
    return { success: true, connections };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-connections', async () => {
  try {
    const connections = store.get('connections', []);
    return { success: true, connections };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-connection', async (event, connectionId) => {
  try {
    const connections = store.get('connections', []);
    const filteredConnections = connections.filter(conn => conn.id !== connectionId);
    store.set('connections', filteredConnections);
    return { success: true, connections: filteredConnections };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-ssh-connection', async (event, connectionData) => {
  return new Promise((resolve) => {
    const conn = new Client();
    
    const timeout = setTimeout(() => {
      conn.end();
      resolve({ success: false, error: 'Connection timeout' });
    }, 10000);

    conn.on('ready', () => {
      clearTimeout(timeout);
      conn.end();
      resolve({ success: true });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ success: false, error: err.message });
    });

    try {
      conn.connect({
        host: connectionData.hostname,
        port: connectionData.port || 22,
        username: connectionData.username,
        password: connectionData.password,
        privateKey: connectionData.privateKey,
        readyTimeout: 10000
      });
    } catch (error) {
      clearTimeout(timeout);
      resolve({ success: false, error: error.message });
    }
  });
});

// Settings management
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-settings', async () => {
  try {
    const settings = store.get('settings', {
      theme: 'cyberpunk',
      fontSize: 14,
      fontFamily: 'Fira Code',
      autoSave: true,
      autoReconnect: true
    });
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// SSH Session Management
ipcMain.handle('create-ssh-session', async (event, sessionId, connectionData) => {
  console.log('Creating SSH session:', { sessionId, connectionData: { ...connectionData, password: '***' } });
  
  try {
    const session = new SSHSession(connectionData);
    console.log('SSH session instance created');
    
    // Set up event listeners
    session.on('data', (data) => {
      mainWindow.webContents.send('ssh-data', sessionId, data);
    });

    session.on('connected', () => {
      console.log('SSH session connected:', sessionId);
      mainWindow.webContents.send('ssh-connected', sessionId);
    });

    session.on('disconnected', () => {
      console.log('SSH session disconnected:', sessionId);
      mainWindow.webContents.send('ssh-disconnected', sessionId);
      activeSessions.delete(sessionId);
    });

    session.on('error', (error) => {
      console.log('SSH session error:', sessionId, error.message);
      mainWindow.webContents.send('ssh-error', sessionId, error.message);
    });

    activeSessions.set(sessionId, session);
    console.log('Session added to activeSessions. Total sessions:', activeSessions.size);
    
    // Connect to SSH
    console.log('Attempting to connect SSH session...');
    await session.connect();
    console.log('SSH session.connect() completed');
    await session.createShell();
    console.log('SSH shell created successfully');

    return { success: true, sessionId };
  } catch (error) {
    console.error('SSH session creation failed:', error);
    activeSessions.delete(sessionId);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ssh-write', async (event, sessionId, data) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }
    
    session.writeToShell(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ssh-resize', async (event, sessionId, cols, rows) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }
    
    session.resizeShell(cols, rows);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('disconnect-ssh-session', async (event, sessionId) => {
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

// Broadcast Commands to All Active Sessions
ipcMain.handle('broadcast-command', async (event, command) => {
  console.log('Broadcasting command to all active sessions:', command);
  console.log('Active sessions count:', activeSessions.size);
  
  let successCount = 0;
  const results = [];
  
  for (const [sessionId, session] of activeSessions) {
    try {
      if (session && session.isConnected) {
        await session.writeToShell(command + '\n');
        results.push({ sessionId, success: true });
        successCount++;
      } else {
        results.push({ sessionId, success: false, error: 'Session not connected' });
      }
    } catch (error) {
      console.error(`Failed to broadcast to session ${sessionId}:`, error);
      results.push({ sessionId, success: false, error: error.message });
    }
  }
  
  return { 
    success: true, 
    broadcastedTo: successCount,
    totalSessions: activeSessions.size,
    results 
  };
});

// SFTP Operations
ipcMain.handle('sftp-list-directory', async (event, sessionId, remotePath) => {
  console.log('SFTP list directory request:', { sessionId, remotePath });
  console.log('Active sessions:', Array.from(activeSessions.keys()));
  
  try {
    const session = activeSessions.get(sessionId);
    console.log('Found session:', !!session);
    console.log('Session connected:', session?.isConnected);
    
    if (!session || !session.isConnected) {
      const error = !session ? 'Session not found' : 'Session not connected';
      console.log('SFTP Error:', error);
      return { success: false, error: `SSH session not available: ${error}` };
    }

    const sftp = new SftpClient();
    await sftp.connect({
      host: session.connectionData.hostname,
      port: session.connectionData.port || 22,
      username: session.connectionData.username,
      password: session.connectionData.password,
      privateKey: session.connectionData.privateKey
    });

    const files = await sftp.list(remotePath);
    await sftp.end();

    const processedFiles = files.map(file => ({
      name: file.name,
      type: file.type === 'd' ? 'directory' : 'file',
      size: file.size,
      modified: new Date(file.modifyTime),
      permissions: file.rights ? file.rights.toString(8) : '',
      owner: file.owner || '',
      group: file.group || ''
    }));

    // Add parent directory entry if not at root
    if (remotePath !== '/') {
      processedFiles.unshift({
        name: '..',
        type: 'parent',
        size: 0,
        modified: new Date(),
        permissions: '',
        owner: '',
        group: ''
      });
    }

    return { success: true, files: processedFiles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sftp-upload-file', async (event, sessionId, localPath, remotePath) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session || !session.isConnected) {
      return { success: false, error: 'SSH session not available' };
    }

    const sftp = new SftpClient();
    await sftp.connect({
      host: session.connectionData.hostname,
      port: session.connectionData.port || 22,
      username: session.connectionData.username,
      password: session.connectionData.password,
      privateKey: session.connectionData.privateKey
    });

    await sftp.put(localPath, remotePath);
    await sftp.end();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sftp-download-file', async (event, sessionId, remotePath, localPath) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session || !session.isConnected) {
      return { success: false, error: 'SSH session not available' };
    }

    const sftp = new SftpClient();
    await sftp.connect({
      host: session.connectionData.hostname,
      port: session.connectionData.port || 22,
      username: session.connectionData.username,
      password: session.connectionData.password,
      privateKey: session.connectionData.privateKey
    });

    await sftp.get(remotePath, localPath);
    await sftp.end();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Local Directory Operations
ipcMain.handle('list-local-directory', async (event, dirPath) => {
  try {
    const files = [];
    
    // Add parent directory entry if not root
    if (dirPath !== '/') {
      files.push({
        name: '..',
        type: 'parent',
        size: 0,
        modified: new Date()
      });
    }
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      let stats;
      
      try {
        stats = await fs.stat(fullPath);
      } catch (err) {
        continue; // Skip files we can't access
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

// ============================================
// AI SERVICE HANDLERS
// ============================================

// Get AI configuration
ipcMain.handle('get-ai-config', async (event) => {
  try {
    const config = store.get('ai-config', {
      activeProvider: 'ollama',
      providers: {
        ollama: {
          endpoint: 'http://localhost:11434',
          model: 'llama3.2'
        },
        openai: {
          apiKey: '',
          model: 'gpt-3.5-turbo'
        },
        gemini: {
          apiKey: '',
          model: 'gemini-pro'
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307'
        }
      }
    });

    return { success: true, config };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Save AI configuration
ipcMain.handle('save-ai-config', async (event, config) => {
  try {
    store.set('ai-config', config);
    await aiService.initialize(config);
    return { success: true };
  } catch (error) {
    console.error('Failed to save AI config:', error);
    return { success: false, error: error.message };
  }
});

// Test AI provider connection
ipcMain.handle('test-ai-provider', async (event, providerName, providerConfig) => {
  try {
    const { AIService } = require('./src/services/AIService');
    const result = await AIService.testProviderWithConfig(providerName, providerConfig);
    return result;
  } catch (error) {
    console.error('Failed to test AI provider:', error);
    return { success: false, error: error.message };
  }
});

// Generate command with AI
ipcMain.handle('ai-generate-command', async (event, input, context) => {
  try {
    if (!aiService.isReady()) {
      return { success: false, error: 'AI service not ready. Please configure a provider first.' };
    }
    
    const result = await aiService.generateCommand(input, context);
    return result;
  } catch (error) {
    console.error('Failed to generate command:', error);
    return { success: false, error: error.message };
  }
});

// Explain command with AI
ipcMain.handle('ai-explain-command', async (event, command) => {
  try {
    if (!aiService.isReady()) {
      return { success: false, error: 'AI service not ready. Please configure a provider first.' };
    }
    
    const result = await aiService.explainCommand(command);
    return result;
  } catch (error) {
    console.error('Failed to explain command:', error);
    return { success: false, error: error.message };
  }
});

// Chat with AI
ipcMain.handle('ai-chat', async (event, message, context) => {
  try {
    if (!aiService.isReady()) {
      return { success: false, error: 'AI service not ready. Please configure a provider first.' };
    }
    
    const result = await aiService.chat(message, context);
    return result;
  } catch (error) {
    console.error('Failed to chat with AI:', error);
    return { success: false, error: error.message };
  }
});

// Get AI service status
ipcMain.handle('get-ai-status', async (event) => {
  try {
    const status = aiService.getStatus();
    return {
      success: true,
      status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Clear AI chat history
ipcMain.handle('ai-clear-history', async (event) => {
  try {
    aiService.clearHistory();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Switch AI provider
ipcMain.handle('ai-switch-provider', async (event, providerName) => {
  try {
    const result = await aiService.switchProvider(providerName);
    return result;
  } catch (error) {
    console.error('Failed to switch AI provider:', error);
    return { success: false, error: error.message };
  }
});

console.log('KEMENT - Modern SSH Terminal starting...');