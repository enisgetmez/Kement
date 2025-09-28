import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import ConnectionManager from './services/ConnectionManager';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const App = () => {
  const [connections, setConnections] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize connection manager and load saved connections
    const initializeApp = async () => {
      try {
        const result = await ConnectionManager.loadConnections();
        if (result.success) {
          setConnections(result.connections);
        }
      } catch (error) {
        console.error('Failed to load connections:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleNewConnection = async (connectionData) => {
    const result = await ConnectionManager.saveConnection(connectionData);
    if (result.success) {
      setConnections(result.connections);
    }
    return result;
  };

  const handleDeleteConnection = async (connectionId) => {
    const result = await ConnectionManager.deleteConnection(connectionId);
    if (result.success) {
      setConnections(result.connections);
      // Remove from active connections if exists
      setActiveConnections(prev => 
        prev.filter(conn => conn.id !== connectionId)
      );
    }
    return result;
  };

  const handleConnect = async (connection) => {
    // Test connection first
    const testResult = await ConnectionManager.testConnection(connection);
    if (testResult.success) {
      const newActiveConnection = {
        ...connection,
        sessionId: `session_${Date.now()}`,
        status: 'connected',
        connectedAt: new Date()
      };
      
      setActiveConnections(prev => [...prev, newActiveConnection]);
      setSelectedConnection(newActiveConnection);
    }
    return testResult;
  };

  const handleDisconnect = (sessionId) => {
    setActiveConnections(prev => 
      prev.filter(conn => conn.sessionId !== sessionId)
    );
    
    if (selectedConnection?.sessionId === sessionId) {
      const remaining = activeConnections.filter(conn => conn.sessionId !== sessionId);
      setSelectedConnection(remaining.length > 0 ? remaining[0] : null);
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <LoadingContainer>
          <LoadingText>Loading KEMENT...</LoadingText>
          <LoadingSpinner />
        </LoadingContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <MainArea>
        <Sidebar 
          connections={connections}
          activeConnections={activeConnections}
          selectedConnection={selectedConnection}
          onNewConnection={handleNewConnection}
          onDeleteConnection={handleDeleteConnection}
          onConnect={handleConnect}
          onSelectConnection={setSelectedConnection}
        />
        <MainContent 
          selectedConnection={selectedConnection}
          activeConnections={activeConnections}
          onDisconnect={handleDisconnect}
        />
      </MainArea>
      <StatusBar 
        activeConnections={activeConnections}
        selectedConnection={selectedConnection}
      />
    </AppContainer>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(45deg, var(--bg-primary), var(--bg-secondary));
`;

const LoadingText = styled.div`
  color: var(--neon-green);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  text-shadow: 0 0 10px var(--neon-green);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid var(--neon-green);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default App;