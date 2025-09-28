import React, { useState } from 'react';
import styled from 'styled-components';
import TerminalTab from './TerminalTab';
import SFTPBrowser from './SFTPBrowser';
import FileEditor from './FileEditor';

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
  overflow-x: auto;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: ${props => props.active ? 'var(--bg-primary)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--neon-green)' : 'transparent'};
  color: ${props => props.active ? 'var(--neon-green)' : 'var(--text-secondary)'};
  cursor: pointer;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  max-width: 200px;
  min-width: 120px;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .tab-text {
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
  }

  .close-btn {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--neon-pink);
    color: var(--bg-primary);
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.active ? 1 : 0};
    transition: opacity 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &:hover .close-btn {
    opacity: 1;
  }
`;

const NewTabButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--neon-green);
    background: var(--bg-tertiary);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
`;

const WelcomeTitle = styled.h1`
  color: var(--neon-green);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 0 20px var(--neon-green);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const WelcomeSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
  max-width: 800px;
`;

const FeatureCard = styled.div`
  background: var(--gradient-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--neon-cyan);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 102, 255, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  color: var(--neon-cyan);
  margin-bottom: 15px;
`;

const FeatureTitle = styled.h3`
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
`;

const TabStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'var(--neon-green)';
      case 'connecting': return 'var(--neon-cyan)';
      case 'disconnected': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  margin-right: 8px;
  animation: ${props => props.status === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
`;

const MainContent = ({ selectedConnection, activeConnections, onDisconnect }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [connectionSessions, setConnectionSessions] = useState(new Map()); // Track sessionId for each connection

  React.useEffect(() => {
    if (selectedConnection && selectedConnection.sessionId) {
      const existingTab = tabs.find(tab => 
        tab.connectionId === selectedConnection.id || 
        tab.sessionId === selectedConnection.sessionId
      );

      if (!existingTab) {
        const newTab = {
          id: `tab_${Date.now()}`,
          sessionId: selectedConnection.sessionId,
          connectionId: selectedConnection.id,
          name: selectedConnection.name,
          type: 'terminal',
          status: 'connected',
          connection: selectedConnection
        };
        
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      } else {
        setActiveTabId(existingTab.id);
      }
    }
  }, [selectedConnection]);

  const handleCloseTab = (tabId, e) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === tabId);
    
    if (tab && tab.sessionId) {
      onDisconnect(tab.sessionId);
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
      setActiveTabId(nextTab ? nextTab.id : null);
    }
  };

  const handleNewTab = () => {
    // Could open new connection dialog or other tab types
    console.log('New tab clicked');
  };

  const handleSessionReady = (connectionId, sessionId) => {
    console.log('Session ready for connection:', connectionId, 'sessionId:', sessionId);
    setConnectionSessions(prev => {
      const newMap = new Map(prev);
      newMap.set(connectionId, sessionId);
      console.log('Updated connection sessions:', newMap);
      return newMap;
    });
  };

  const openSFTPTab = (connection) => {
    // Use existing sessionId for the same connection
    const existingSessionId = connectionSessions.get(connection.id);
    
    console.log('Opening SFTP tab for connection:', connection.id);
    console.log('Existing sessionId:', existingSessionId);
    console.log('Connection sessionId:', connection.sessionId);
    
    // Use the most current sessionId
    const currentSessionId = existingSessionId || connection.sessionId;
    
    if (!currentSessionId) {
      console.error('No sessionId available for SFTP');
      return;
    }
    
    const sftpTab = {
      id: `sftp_${Date.now()}`,
      sessionId: currentSessionId,
      connectionId: connection.id,
      name: `${connection.name} (SFTP)`,
      type: 'sftp',
      status: 'connected',
      connection: {
        ...connection,
        sessionId: currentSessionId
      }
    };
    
    setTabs(prev => [...prev, sftpTab]);
    setActiveTabId(sftpTab.id);
  };

  const openEditorTab = (connection, filePath) => {
    const editorTab = {
      id: `editor_${Date.now()}`,
      sessionId: connection.sessionId,
      connectionId: connection.id,
      name: `Edit: ${filePath.split('/').pop()}`,
      type: 'editor',
      status: 'connected',
      connection: connection,
      filePath: filePath
    };
    
    setTabs(prev => [...prev, editorTab]);
    setActiveTabId(editorTab.id);
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <WelcomeScreen>
          <WelcomeTitle>KEMENT</WelcomeTitle>
          <WelcomeSubtitle>
            Welcome to KEMENT, your modern SSH terminal emulator. Connect to remote servers,
            transfer files via SFTP, and manage your infrastructure efficiently.
          </WelcomeSubtitle>
          
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🔗</FeatureIcon>
              <FeatureTitle>SSH Connections</FeatureTitle>
              <FeatureDescription>
                Save and manage multiple SSH connection profiles with secure credential storage.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📁</FeatureIcon>
              <FeatureTitle>SFTP File Transfer</FeatureTitle>
              <FeatureDescription>
                Browse remote files, upload and download with drag-and-drop support.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>💻</FeatureIcon>
              <FeatureTitle>Integrated Terminal</FeatureTitle>
              <FeatureDescription>
                Full-featured terminal with syntax highlighting and cyberpunk aesthetics.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>✏️</FeatureIcon>
              <FeatureTitle>Code Editor</FeatureTitle>
              <FeatureDescription>
                Edit remote files directly with Monaco Editor and automatic save.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </WelcomeScreen>
      );
    }

    // Render all tabs but show only active one to prevent unmount/remount
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        {tabs.map(tab => (
          <div 
            key={tab.id}
            style={{ 
              position: activeTab?.id === tab.id ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100%',
              visibility: activeTab?.id === tab.id ? 'visible' : 'hidden',
              zIndex: activeTab?.id === tab.id ? 1 : 0
            }}
          >
            {tab.type === 'terminal' && (
              <TerminalTab
                connection={tab.connection}
                onOpenSFTP={() => openSFTPTab(tab.connection)}
                onSessionReady={(sessionId) => handleSessionReady(tab.connectionId, sessionId)}
              />
            )}
            {tab.type === 'sftp' && (
              <SFTPBrowser
                connection={tab.connection}
                onEditFile={(filePath) => openEditorTab(tab.connection, filePath)}
              />
            )}
            {tab.type === 'editor' && (
              <FileEditor
                connection={tab.connection}
                filePath={tab.filePath}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainContainer>
      {tabs.length > 0 && (
        <TabBar>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              active={tab.id === activeTabId}
              onClick={() => setActiveTabId(tab.id)}
            >
              <TabStatus status={tab.status} />
              <span className="tab-text" title={tab.name}>
                {tab.name}
              </span>
              <div 
                className="close-btn"
                onClick={(e) => handleCloseTab(tab.id, e)}
              >
                ×
              </div>
            </Tab>
          ))}
          <NewTabButton onClick={handleNewTab} title="New Tab">
            +
          </NewTabButton>
        </TabBar>
      )}
      
      <ContentArea>
        {renderTabContent()}
      </ContentArea>
    </MainContainer>
  );
};

export default MainContent;