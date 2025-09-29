import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SFTPContainer = styled.div`
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

const PathBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 12px;
  font-family: 'Fira Code', monospace;

  .separator {
    color: var(--text-muted);
    margin: 0 8px;
  }

  .path-item {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--neon-cyan);
    }
  }
`;

const PathInput = styled.input`
  background: var(--bg-primary);
  border: 1px solid var(--neon-cyan);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  padding: 4px 8px;
  min-width: 200px;
  outline: none;

  &:focus {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  }
`;

const PathContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .path-label {
    color: var(--text-secondary);
    font-size: 11px;
    text-transform: uppercase;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--neon-cyan);
    color: var(--bg-primary);
    border-color: var(--neon-cyan);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const FilePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: ${props => props.isLocal ? '1px solid var(--border-color)' : 'none'};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const PanelTitle = styled.h3`
  color: var(--neon-green);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 0 8px var(--neon-green);
`;

const CurrentPath = styled.div`
  color: var(--text-muted);
  font-size: 11px;
  font-family: 'Fira Code', monospace;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: ${props => props.selected ? 'var(--bg-tertiary)' : 'transparent'};
  border: ${props => props.selected ? '1px solid var(--neon-green)' : '1px solid transparent'};

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--neon-cyan);
    transform: translateX(2px);
  }

  &.dragging {
    opacity: 0.7;
    background: var(--neon-cyan);
    color: var(--bg-primary);
  }

  &.drop-target {
    background: rgba(0, 255, 136, 0.2);
    border-color: var(--neon-green);
  }
`;

const FileIcon = styled.div`
  width: 20px;
  margin-right: 12px;
  font-size: 14px;
  color: ${props => {
    if (props.type === 'directory') return 'var(--neon-cyan)';
    if (props.type === 'image') return 'var(--neon-purple)';
    if (props.type === 'code') return 'var(--neon-green)';
    return 'var(--text-muted)';
  }};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const FileDetails = styled.div`
  color: var(--text-muted);
  font-size: 10px;
  margin-top: 2px;
`;

const TransferArea = styled.div`
  height: 150px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 15px;
  overflow-y: auto;
`;

const TransferTitle = styled.h4`
  color: var(--neon-green);
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TransferItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 11px;

  .file-name {
    color: var(--text-primary);
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .progress {
    color: var(--neon-cyan);
    margin-left: 10px;
    min-width: 50px;
    text-align: right;
  }

  .status {
    color: ${props => {
      switch (props.status) {
        case 'completed': return 'var(--neon-green)';
        case 'error': return 'var(--neon-pink)';
        case 'uploading':
        case 'downloading': return 'var(--neon-cyan)';
        default: return 'var(--text-muted)';
      }
    }};
    margin-left: 10px;
    min-width: 80px;
    text-align: right;
  }
`;

const ErrorMessage = styled.div`
  padding: 15px;
  background: rgba(255, 0, 102, 0.1);
  border: 1px solid var(--neon-pink);
  border-radius: 6px;
  color: var(--neon-pink);
  font-size: 14px;
  margin: 15px;
  text-align: center;
  
  .retry-btn {
    margin-top: 10px;
    padding: 8px 16px;
    background: var(--neon-pink);
    color: var(--bg-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Fira Code', monospace;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-style: italic;
  text-align: center;

  .icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.3;
  }
`;

const SFTPBrowser = ({ connection, onEditFile }) => {
  const [localPath, setLocalPath] = useState('/home');
  const [remotePath, setRemotePath] = useState(`/home/${connection?.username || ''}`); // Start in user's home
  const [localFiles, setLocalFiles] = useState([]);
  const [remoteFiles, setRemoteFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPath, setEditingPath] = useState({ local: false, remote: false });
  const [pathInput, setPathInput] = useState({ local: '', remote: '' });
  
  // Use connection's sessionId if available
  const sessionId = connection?.sessionId;
  
  console.log('SFTPBrowser initialized with connection:', connection);
  console.log('Using sessionId:', sessionId);
  console.log('Starting remote path:', remotePath);

  // Load real file listings
  useEffect(() => {
    if (connection) {
      loadRemoteDirectory(remotePath);
      loadLocalDirectory(localPath);
    }
  }, [remotePath, localPath, connection]);

  const loadRemoteDirectory = async (path) => {
    console.log('Loading remote directory:', path, 'with sessionId:', sessionId);
    setLoading(true);
    setError(null);
    
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('sftp-list-directory', sessionId, path);
      
      console.log('SFTP list result:', result);
      
      if (result.success) {
        console.log('Remote files loaded:', result.files.length);
        setRemoteFiles(result.files);
      } else {
        console.error('Failed to load remote directory:', result.error);
        setError(`Failed to connect to SFTP: ${result.error}`);
        setRemoteFiles([]);
      }
    } catch (error) {
      console.error('Error loading remote directory:', error);
      setError(`SFTP Error: ${error.message}`);
      setRemoteFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalDirectory = async (path) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('list-local-directory', path);
      
      if (result.success) {
        setLocalFiles(result.files);
      } else {
        // Use mock local data as fallback
        setLocalFiles(mockLocalFiles);
      }
    } catch (error) {
      console.error('Error loading local directory:', error);
      setLocalFiles(mockLocalFiles);
    }
  };

  // Mock file data for local files (would be replaced with real fs operations)
  const mockLocalFiles = [
    { name: '..', type: 'parent', size: 0, modified: new Date() },
    { name: 'Documents', type: 'directory', size: 0, modified: new Date() },
    { name: 'Downloads', type: 'directory', size: 0, modified: new Date() },
    { name: 'Pictures', type: 'directory', size: 0, modified: new Date() },
    { name: 'script.sh', type: 'code', size: 1024, modified: new Date() },
    { name: 'config.json', type: 'code', size: 2048, modified: new Date() },
    { name: 'image.png', type: 'image', size: 51200, modified: new Date() }
  ];

  const mockRemoteFiles = [
    { name: '..', type: 'parent', size: 0, modified: new Date() },
    { name: 'var', type: 'directory', size: 0, modified: new Date() },
    { name: 'etc', type: 'directory', size: 0, modified: new Date() },
    { name: 'home', type: 'directory', size: 0, modified: new Date() },
    { name: 'tmp', type: 'directory', size: 0, modified: new Date() },
    { name: 'nginx.conf', type: 'code', size: 4096, modified: new Date() },
    { name: 'server.log', type: 'file', size: 102400, modified: new Date() }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'directory': return '📁';
      case 'parent': return '⬆️';
      case 'image': return '🖼️';
      case 'code': return '📄';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileClick = (file, isRemote) => {
    console.log('File clicked:', file.name, file.type, 'isRemote:', isRemote);
    
    if (file.type === 'parent') {
      // Go to parent directory
      if (isRemote) {
        const pathParts = remotePath.split('/').filter(part => part);
        pathParts.pop();
        const newPath = '/' + pathParts.join('/');
        console.log('Going to remote parent:', remotePath, '->', newPath);
        setRemotePath(newPath === '/' ? '/' : newPath);
      } else {
        const pathParts = localPath.split('/').filter(part => part);
        pathParts.pop();
        const newPath = '/' + pathParts.join('/');
        console.log('Going to local parent:', localPath, '->', newPath);
        setLocalPath(newPath === '/' ? '/' : newPath);
      }
    } else if (file.type === 'directory') {
      // Enter directory
      if (isRemote) {
        const newPath = remotePath === '/' ? `/${file.name}` : `${remotePath}/${file.name}`;
        console.log('Entering remote directory:', remotePath, '->', newPath);
        setRemotePath(newPath);
      } else {
        const newPath = localPath === '/' ? `/${file.name}` : `${localPath}/${file.name}`;
        console.log('Entering local directory:', localPath, '->', newPath);
        setLocalPath(newPath);
      }
    } else {
      // File selected
      const fileId = `${isRemote ? 'remote' : 'local'}_${file.name}`;
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    }
  };

  const handleFileDoubleClick = (file, isRemote) => {
    if (isRemote && file.type !== 'directory' && file.type !== 'parent') {
      // Open file in editor
      const fullPath = remotePath + '/' + file.name;
      onEditFile(fullPath);
    }
  };

  const handleUpload = async () => {
    const localSelectedFiles = selectedFiles.filter(id => id.startsWith('local_'));
    
    for (const fileId of localSelectedFiles) {
      const fileName = fileId.replace('local_', '');
      const localFilePath = localPath === '/' ? `/${fileName}` : `${localPath}/${fileName}`;
      const remoteFilePath = remotePath === '/' ? `/${fileName}` : `${remotePath}/${fileName}`;
      
      const transferId = Date.now() + Math.random();
      
      const transfer = {
        id: transferId,
        fileName,
        type: 'upload',
        progress: 0,
        status: 'uploading'
      };

      setTransfers(prev => [...prev, transfer]);

      try {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('sftp-upload-file', sessionId, localFilePath, remoteFilePath);
        
        if (result.success) {
          setTransfers(prev => prev.map(t => 
            t.id === transferId 
              ? { ...t, progress: 100, status: 'completed' }
              : t
          ));
          // Refresh remote directory
          loadRemoteDirectory(remotePath);
        } else {
          setTransfers(prev => prev.map(t => 
            t.id === transferId 
              ? { ...t, status: 'error' }
              : t
          ));
        }
      } catch (error) {
        setTransfers(prev => prev.map(t => 
          t.id === transferId 
            ? { ...t, status: 'error' }
            : t
        ));
      }
    }

    setSelectedFiles([]);
  };

  const handleDownload = async () => {
    const remoteSelectedFiles = selectedFiles.filter(id => id.startsWith('remote_'));
    
    for (const fileId of remoteSelectedFiles) {
      const fileName = fileId.replace('remote_', '');
      const remoteFilePath = remotePath === '/' ? `/${fileName}` : `${remotePath}/${fileName}`;
      const localFilePath = localPath === '/' ? `/${fileName}` : `${localPath}/${fileName}`;
      
      const transferId = Date.now() + Math.random();
      
      const transfer = {
        id: transferId,
        fileName,
        type: 'download',
        progress: 0,
        status: 'downloading'
      };

      setTransfers(prev => [...prev, transfer]);

      try {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('sftp-download-file', sessionId, remoteFilePath, localFilePath);
        
        if (result.success) {
          setTransfers(prev => prev.map(t => 
            t.id === transferId 
              ? { ...t, progress: 100, status: 'completed' }
              : t
          ));
          // Refresh local directory
          loadLocalDirectory(localPath);
        } else {
          setTransfers(prev => prev.map(t => 
            t.id === transferId 
              ? { ...t, status: 'error' }
              : t
          ));
        }
      } catch (error) {
        setTransfers(prev => prev.map(t => 
          t.id === transferId 
            ? { ...t, status: 'error' }
            : t
        ));
      }
    }

    setSelectedFiles([]);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadRemoteDirectory(remotePath);
    loadLocalDirectory(localPath);
  };

  const handlePathEdit = (isRemote) => {
    setEditingPath(prev => ({ 
      ...prev, 
      [isRemote ? 'remote' : 'local']: true 
    }));
    setPathInput(prev => ({
      ...prev,
      [isRemote ? 'remote' : 'local']: isRemote ? remotePath : localPath
    }));
  };

  const handlePathSubmit = (isRemote) => {
    const newPath = pathInput[isRemote ? 'remote' : 'local'].trim();
    if (newPath) {
      if (isRemote) {
        setRemotePath(newPath);
      } else {
        setLocalPath(newPath);
      }
    }
    setEditingPath(prev => ({ 
      ...prev, 
      [isRemote ? 'remote' : 'local']: false 
    }));
  };

  const handlePathCancel = (isRemote) => {
    setEditingPath(prev => ({ 
      ...prev, 
      [isRemote ? 'remote' : 'local']: false 
    }));
  };

  const handlePathKeyPress = (e, isRemote) => {
    if (e.key === 'Enter') {
      handlePathSubmit(isRemote);
    } else if (e.key === 'Escape') {
      handlePathCancel(isRemote);
    }
  };

  const renderFileList = (files, isRemote) => {
    if (files.length === 0) {
      return (
        <EmptyState>
          <div className="icon">📁</div>
          <div>No files found</div>
        </EmptyState>
      );
    }

    return files.map((file, index) => {
      const fileId = `${isRemote ? 'remote' : 'local'}_${file.name}`;
      const isSelected = selectedFiles.includes(fileId);

      return (
        <FileItem
          key={index}
          selected={isSelected}
          onClick={() => handleFileClick(file, isRemote)}
          onDoubleClick={() => handleFileDoubleClick(file, isRemote)}
        >
          <FileIcon type={file.type}>
            {getFileIcon(file.type)}
          </FileIcon>
          <FileInfo>
            <FileName>{file.name}</FileName>
            {file.type !== 'parent' && (
              <FileDetails>
                {formatFileSize(file.size)} • {formatDate(file.modified)}
              </FileDetails>
            )}
          </FileInfo>
        </FileItem>
      );
    });
  };

  return (
    <SFTPContainer>
      <ToolBar>
        <ToolBarLeft>
          <PathContainer>
            <span className="path-label">Local:</span>
            {editingPath.local ? (
              <PathInput
                value={pathInput.local}
                onChange={(e) => setPathInput(prev => ({ ...prev, local: e.target.value }))}
                onKeyDown={(e) => handlePathKeyPress(e, false)}
                onBlur={() => handlePathCancel(false)}
                autoFocus
              />
            ) : (
              <span 
                className="path-item" 
                onClick={() => handlePathEdit(false)}
                title="Click to edit path"
              >
                {localPath}
              </span>
            )}
            
            <span className="separator">⟷</span>
            
            <span className="path-label">Remote:</span>
            {editingPath.remote ? (
              <PathInput
                value={pathInput.remote}
                onChange={(e) => setPathInput(prev => ({ ...prev, remote: e.target.value }))}
                onKeyDown={(e) => handlePathKeyPress(e, true)}
                onBlur={() => handlePathCancel(true)}
                autoFocus
              />
            ) : (
              <span 
                className="path-item" 
                onClick={() => handlePathEdit(true)}
                title="Click to edit path"
              >
                {remotePath}
              </span>
            )}
          </PathContainer>
        </ToolBarLeft>

        <ToolBarRight>
          <ActionButton onClick={handleRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </ActionButton>
          <ActionButton onClick={handleUpload} disabled={!selectedFiles.some(id => id.startsWith('local_'))}>
            Upload →
          </ActionButton>
          <ActionButton onClick={handleDownload} disabled={!selectedFiles.some(id => id.startsWith('remote_'))}>
            ← Download
          </ActionButton>
        </ToolBarRight>
      </ToolBar>

      <ContentArea>
        <FilePanel isLocal>
          <PanelHeader>
            <PanelTitle>Local Files</PanelTitle>
            <CurrentPath>{localPath}</CurrentPath>
          </PanelHeader>
          <FileList>
            {renderFileList(localFiles, false)}
          </FileList>
        </FilePanel>

        <FilePanel>
          <PanelHeader>
            <PanelTitle>Remote Files</PanelTitle>
            <CurrentPath>{remotePath}</CurrentPath>
          </PanelHeader>
          <FileList>
            {renderFileList(remoteFiles, true)}
          </FileList>
        </FilePanel>
      </ContentArea>

      {transfers.length > 0 && (
        <TransferArea>
          <TransferTitle>File Transfers</TransferTitle>
          {transfers.map(transfer => (
            <TransferItem key={transfer.id} status={transfer.status}>
              <div className="file-name">{transfer.fileName}</div>
              <div className="progress">{transfer.progress}%</div>
              <div className="status">{transfer.status}</div>
            </TransferItem>
          ))}
        </TransferArea>
      )}
    </SFTPContainer>
  );
};

export default SFTPBrowser;