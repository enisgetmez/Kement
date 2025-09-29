import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const TerminalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
`;

const ToolBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ToolBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConnectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-green);
  box-shadow: 0 0 8px var(--neon-green);
  animation: glow 2s infinite;
`;

const ToolButton = styled.button`
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--neon-cyan);
    color: var(--bg-primary);
    border-color: var(--neon-cyan);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TerminalWrapper = styled.div`
  flex: 1;
  padding: 10px;
  background: var(--bg-primary);
  position: relative;

  .xterm {
    height: 100% !important;
  }

  .xterm-viewport {
    background: var(--bg-primary) !important;
  }

  .xterm-screen {
    background: var(--bg-primary) !important;
  }

  .xterm-cursor {
    background: var(--neon-green) !important;
    box-shadow: 0 0 10px var(--neon-green);
  }

  .xterm-selection {
    background: rgba(0, 255, 136, 0.3) !important;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--neon-green);
  font-size: 14px;
  z-index: 10;

  .spinner {
    width: 30px;
    height: 30px;
    border: 2px solid var(--neon-green);
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--neon-pink);
  font-size: 14px;
  text-align: center;
  padding: 40px;

  .error-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: var(--neon-pink);
    text-shadow: 0 0 10px var(--neon-pink);
  }

  .error-detail {
    color: var(--text-muted);
    margin-bottom: 20px;
    max-width: 400px;
  }
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 0, 102, 0.4);
  }
`;

const SavedCommandsPanel = styled.div`
  position: absolute;
  top: 50px;
  right: 15px;
  width: 300px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
`;

const CommandsPanelHeader = styled.div`
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .title {
    color: var(--neon-cyan);
    font-weight: 600;
    font-size: 14px;
  }
  
  .close-btn {
    color: var(--text-muted);
    cursor: pointer;
    font-size: 18px;
    
    &:hover {
      color: var(--neon-pink);
    }
  }
`;

const CommandItem = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  .command-name {
    color: var(--neon-green);
    font-weight: 500;
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .command-text {
    color: var(--text-primary);
    font-family: 'Fira Code', monospace;
    font-size: 11px;
    background: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 4px;
    word-break: break-all;
  }
  
  .command-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    
    button {
      padding: 2px 8px;
      font-size: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-muted);
      border-radius: 3px;
      cursor: pointer;
      
      &:hover {
        color: var(--neon-cyan);
        border-color: var(--neon-cyan);
      }
      
      &.delete-btn:hover {
        color: var(--neon-pink);
        border-color: var(--neon-pink);
      }
    }
  }
`;

const AddCommandForm = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  
  input {
    width: 100%;
    padding: 6px 8px;
    margin-bottom: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 11px;
    
    &::placeholder {
      color: var(--text-muted);
    }
    
    &:focus {
      outline: none;
      border-color: var(--neon-cyan);
    }
  }
  
  .form-actions {
    display: flex;
    gap: 8px;
    
    button {
      flex: 1;
      padding: 6px 12px;
      font-size: 11px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      
      &.save-btn {
        background: var(--neon-green);
        color: var(--bg-primary);
        border-color: var(--neon-green);
        
        &:hover {
          opacity: 0.8;
        }
      }
      
      &.cancel-btn {
        background: var(--bg-primary);
        color: var(--text-muted);
        
        &:hover {
          color: var(--neon-pink);
          border-color: var(--neon-pink);
        }
      }
    }
  }
`;

const BroadcastModeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: ${props => props.active ? 'var(--neon-pink)' : 'var(--bg-tertiary)'};
  color: ${props => props.active ? 'var(--bg-primary)' : 'var(--text-muted)'};
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: pointer;
  
  .icon {
    font-size: 12px;
  }
`;

const TerminalTab = ({ connection, onOpenSFTP, onSessionReady, onExecuteCommand }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Saved Commands state
  const [showSavedCommands, setShowSavedCommands] = useState(false);
  const [savedCommands, setSavedCommands] = useState([
    { id: 1, name: 'List Files', command: 'ls -la' },
    { id: 2, name: 'System Info', command: 'uname -a' },
    { id: 3, name: 'Disk Usage', command: 'df -h' },
    { id: 4, name: 'Memory Info', command: 'free -h' }
  ]);
  const [addingCommand, setAddingCommand] = useState(false);
  const [newCommand, setNewCommand] = useState({ name: '', command: '' });
  
  // Broadcast mode state
  const [broadcastMode, setBroadcastMode] = useState(false);

  useEffect(() => {
    if (!terminalRef.current || !connection) return;

    const { ipcRenderer } = window.require('electron');

    // Initialize xterm.js
    const terminal = new Terminal({
      theme: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        cursor: '#00ff88',
        cursorAccent: '#0a0a0a',
        selection: 'rgba(0, 255, 136, 0.3)',
        black: '#000000',
        red: '#ff0066',
        green: '#00ff88',
        yellow: '#ffaa00',
        blue: '#0066ff',
        magenta: '#aa00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#333333',
        brightRed: '#ff3388',
        brightGreen: '#33ffaa',
        brightYellow: '#ffcc33',
        brightBlue: '#3388ff',
        brightMagenta: '#cc33ff',
        brightCyan: '#33ffff',
        brightWhite: '#ffffff'
      },
      fontSize: 14,
      fontFamily: '"Fira Code", "Courier New", monospace',
      fontWeight: 'normal',
      fontWeightBold: 'bold',
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
      bellStyle: 'none'
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Set up IPC listeners for SSH events
    const handleSSHData = (event, sessionIdFromMain, data) => {
      if (sessionIdFromMain === sessionId.current) {
        terminal.write(data);
      }
    };

    const handleSSHConnected = (event, sessionIdFromMain) => {
      console.log('SSH connected event received:', sessionIdFromMain, 'current:', sessionId.current);
      if (sessionIdFromMain === sessionId.current) {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        
        console.log('SSH session ready, notifying parent...');
        
        // Notify parent component that session is ready
        if (onSessionReady) {
          onSessionReady(sessionId.current);
        }
      }
    };

    const handleSSHDisconnected = (event, sessionIdFromMain) => {
      if (sessionIdFromMain === sessionId.current) {
        setIsConnected(false);
        setIsConnecting(false);
        terminal.writeln('\r\n\x1b[31mConnection lost. Press F5 to reconnect.\x1b[0m');
      }
    };

    const handleSSHError = (event, sessionIdFromMain, error) => {
      if (sessionIdFromMain === sessionId.current) {
        setConnectionError(error);
        setIsConnecting(false);
        setIsConnected(false);
      }
    };

    ipcRenderer.on('ssh-data', handleSSHData);
    ipcRenderer.on('ssh-connected', handleSSHConnected);
    ipcRenderer.on('ssh-disconnected', handleSSHDisconnected);
    ipcRenderer.on('ssh-error', handleSSHError);

    // Connect to SSH
    const connectToSSH = async () => {
      console.log('Connecting to SSH with sessionId:', sessionId.current, 'connection:', connection);
      try {
        setIsConnecting(true);
        setConnectionError(null);

        // Show connecting message
        terminal.writeln(`\x1b[32m┌─ KEMENT Terminal ─┐\x1b[0m`);
        terminal.writeln(`\x1b[32m│ Connecting to ${connection.hostname}...\x1b[0m`);
        terminal.writeln(`\x1b[32m└─────────────────────────┘\x1b[0m`);
        terminal.writeln('');

        // Create SSH session
        console.log('Invoking create-ssh-session...');
        const result = await ipcRenderer.invoke('create-ssh-session', sessionId.current, connection);
        console.log('SSH session creation result:', result);
        
        if (!result.success) {
          console.error('SSH session creation failed:', result.error);
          throw new Error(result.error);
        }

        console.log('SSH session created successfully');

        // Handle terminal input
        terminal.onData((data) => {
          ipcRenderer.invoke('ssh-write', sessionId.current, data);
        });

        // Handle terminal resize
        const handleResize = () => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit();
            const { cols, rows } = xtermRef.current;
            ipcRenderer.invoke('ssh-resize', sessionId.current, cols, rows);
          }
        };

        window.addEventListener('resize', handleResize);
        
        // Initial resize
        setTimeout(handleResize, 100);

      } catch (error) {
        console.error('SSH connection error:', error);
        setConnectionError(error.message);
        setIsConnecting(false);
        setIsConnected(false);
      }
    };

    connectToSSH();

    return () => {
      // Cleanup
      ipcRenderer.removeListener('ssh-data', handleSSHData);
      ipcRenderer.removeListener('ssh-connected', handleSSHConnected);
      ipcRenderer.removeListener('ssh-disconnected', handleSSHDisconnected);
      ipcRenderer.removeListener('ssh-error', handleSSHError);
      
      // Disconnect SSH session
      ipcRenderer.invoke('disconnect-ssh-session', sessionId.current);
      
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [connection]);

  // Expose execute command function to parent
  useEffect(() => {
    if (onExecuteCommand && isConnected) {
      onExecuteCommand({
        executeCommand: handleExecuteCommand,
        sessionId: sessionId.current
      });
    }
  }, [onExecuteCommand, isConnected]);

  const handleRetry = async () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
    setConnectionError(null);
    setIsConnecting(true);
    
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('create-ssh-session', sessionId.current, connection);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      setConnectionError(error.message);
      setIsConnecting(false);
    }
  };

  const handleClearTerminal = () => {
    if (xtermRef.current && isConnected) {
      xtermRef.current.clear();
    }
  };

  const handleCopy = () => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
  };

  const handlePaste = async () => {
    if (xtermRef.current && isConnected) {
      try {
        const text = await navigator.clipboard.readText();
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.invoke('ssh-write', sessionId.current, text);
      } catch (error) {
        console.error('Failed to paste:', error);
      }
    }
  };

  // Saved Commands handlers
  const handleExecuteCommand = (command) => {
    if (!isConnected) return;
    
    const { ipcRenderer } = window.require('electron');
    
    if (broadcastMode) {
      // Broadcast to all active sessions
      ipcRenderer.invoke('broadcast-command', command);
    } else {
      // Execute on current session
      ipcRenderer.invoke('ssh-write', sessionId.current, command + '\n');
    }
    
    setShowSavedCommands(false);
  };

  const handleSaveCommand = () => {
    if (!newCommand.name.trim() || !newCommand.command.trim()) return;
    
    const commandToSave = {
      id: Date.now(),
      name: newCommand.name.trim(),
      command: newCommand.command.trim()
    };
    
    setSavedCommands(prev => [...prev, commandToSave]);
    setNewCommand({ name: '', command: '' });
    setAddingCommand(false);
    
    // TODO: Save to electron-store for persistence
  };

  const handleDeleteCommand = (id) => {
    setSavedCommands(prev => prev.filter(cmd => cmd.id !== id));
    // TODO: Update electron-store
  };

  const toggleBroadcastMode = () => {
    setBroadcastMode(!broadcastMode);
  };

  const renderContent = () => {
    if (connectionError) {
      return (
        <ErrorMessage>
          <div className="error-title">Connection Failed</div>
          <div className="error-detail">{connectionError}</div>
          <RetryButton onClick={handleRetry}>
            Retry Connection
          </RetryButton>
        </ErrorMessage>
      );
    }

    return (
      <>
        <TerminalWrapper ref={terminalRef} />
        {isConnecting && (
          <LoadingOverlay>
            <div className="spinner" />
            Establishing SSH connection...
          </LoadingOverlay>
        )}
      </>
    );
  };

  return (
    <TerminalContainer>
      <ToolBar>
        <ToolBarLeft>
          <ConnectionInfo>
            <StatusDot />
            {connection.username}@{connection.hostname}:{connection.port}
          </ConnectionInfo>
          <BroadcastModeIndicator 
            active={broadcastMode}
            onClick={toggleBroadcastMode}
            title="Toggle broadcast mode - send commands to all terminals"
          >
            <span className="icon">📡</span>
            Broadcast {broadcastMode ? 'ON' : 'OFF'}
          </BroadcastModeIndicator>
        </ToolBarLeft>

        <ToolBarRight>
          <ToolButton onClick={handleClearTerminal} disabled={!isConnected}>
            Clear
          </ToolButton>
          <ToolButton onClick={handleCopy} disabled={!isConnected}>
            Copy
          </ToolButton>
          <ToolButton onClick={handlePaste} disabled={!isConnected}>
            Paste
          </ToolButton>
          <ToolButton 
            onClick={() => setShowSavedCommands(!showSavedCommands)} 
            disabled={!isConnected}
            title="Saved Commands"
          >
            📋 Commands
          </ToolButton>
          <ToolButton onClick={onOpenSFTP} disabled={!isConnected}>
            SFTP
          </ToolButton>
        </ToolBarRight>
      </ToolBar>

      {/* Saved Commands Panel */}
      {showSavedCommands && (
        <SavedCommandsPanel>
          <CommandsPanelHeader>
            <span className="title">Saved Commands</span>
            <span 
              className="close-btn" 
              onClick={() => setShowSavedCommands(false)}
            >
              ×
            </span>
          </CommandsPanelHeader>
          
          {addingCommand && (
            <AddCommandForm>
              <input
                type="text"
                placeholder="Command name (e.g., 'List Files')"
                value={newCommand.name}
                onChange={(e) => setNewCommand(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Command (e.g., 'ls -la')"
                value={newCommand.command}
                onChange={(e) => setNewCommand(prev => ({ ...prev, command: e.target.value }))}
              />
              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveCommand}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => {
                  setAddingCommand(false);
                  setNewCommand({ name: '', command: '' });
                }}>
                  Cancel
                </button>
              </div>
            </AddCommandForm>
          )}
          
          {!addingCommand && (
            <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--neon-green)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                onClick={() => setAddingCommand(true)}
              >
                + Add New Command
              </button>
            </div>
          )}
          
          {savedCommands.map(cmd => (
            <CommandItem key={cmd.id}>
              <div className="command-name">{cmd.name}</div>
              <div className="command-text">{cmd.command}</div>
              <div className="command-actions">
                <button onClick={() => handleExecuteCommand(cmd.command)}>
                  {broadcastMode ? 'Broadcast' : 'Execute'}
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteCommand(cmd.id)}
                >
                  Delete
                </button>
              </div>
            </CommandItem>
          ))}
        </SavedCommandsPanel>
      )}

      {renderContent()}
    </TerminalContainer>
  );
};

export default TerminalTab;