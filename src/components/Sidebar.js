import React, { useState } from 'react';
import styled from 'styled-components';
import ConnectionForm from './ConnectionForm';
import ConnectionItem from './ConnectionItem';
import AIConfigForm from './AIConfigForm';

const SidebarContainer = styled.div`
  width: 320px;
  min-width: 280px;
  background: var(--gradient-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

const SidebarHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
`;

const Title = styled.h2`
  color: var(--neon-green);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  text-shadow: 0 0 10px var(--neon-green);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NewConnectionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan));
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AISettingsButton = styled.button`
  width: 100%;
  padding: 10px;
  background: var(--gradient-secondary);
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--neon-cyan);
    color: var(--bg-primary);
    box-shadow: 0 5px 15px rgba(0, 166, 255, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ConnectionsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const SectionTitle = styled.h3`
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  margin: 20px 0 10px 0;
  padding: 0 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
`;

const NoConnections = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-style: italic;
`;

const ActiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: var(--neon-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px var(--neon-green);
  margin-right: 8px;
  flex-shrink: 0;
`;

const Sidebar = ({
  connections,
  activeConnections,
  selectedConnection,
  onNewConnection,
  onDeleteConnection,
  onConnect,
  onSelectConnection
}) => {
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [showAIConfig, setShowAIConfig] = useState(false);

  const handleNewConnection = () => {
    setEditingConnection(null);
    setShowConnectionForm(true);
  };

  const handleAISettings = () => {
    setShowAIConfig(true);
  };

  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    setShowConnectionForm(true);
  };

  const handleFormClose = () => {
    setShowConnectionForm(false);
    setEditingConnection(null);
  };

  const handleFormSubmit = async (connectionData) => {
    const result = await onNewConnection(connectionData);
    if (result.success) {
      setShowConnectionForm(false);
      setEditingConnection(null);
    }
    return result;
  };

  const savedConnections = connections.filter(conn => 
    !activeConnections.some(active => active.id === conn.id)
  );

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Title>KEMENT Terminal</Title>
        <NewConnectionButton onClick={handleNewConnection}>
          + New Connection
        </NewConnectionButton>
        <AISettingsButton onClick={handleAISettings}>
          🤖 AI Assistant
        </AISettingsButton>
      </SidebarHeader>

      <ConnectionsList>
        {activeConnections.length > 0 && (
          <>
            <SectionTitle>
              <ActiveIndicator />
              Active Sessions ({activeConnections.length})
            </SectionTitle>
            {activeConnections.map((connection) => (
              <ConnectionItem
                key={connection.sessionId}
                connection={connection}
                isActive={true}
                isSelected={selectedConnection?.sessionId === connection.sessionId}
                onSelect={() => onSelectConnection(connection)}
                onConnect={onConnect}
                onEdit={handleEditConnection}
                onDelete={onDeleteConnection}
              />
            ))}
          </>
        )}

        {savedConnections.length > 0 && (
          <>
            <SectionTitle>
              Saved Connections ({savedConnections.length})
            </SectionTitle>
            {savedConnections.map((connection) => (
              <ConnectionItem
                key={connection.id}
                connection={connection}
                isActive={false}
                isSelected={false}
                onSelect={() => onSelectConnection(connection)}
                onConnect={onConnect}
                onEdit={handleEditConnection}
                onDelete={onDeleteConnection}
              />
            ))}
          </>
        )}

        {connections.length === 0 && (
          <NoConnections>
            No saved connections yet.<br />
            Create your first connection to get started!
          </NoConnections>
        )}
      </ConnectionsList>

      {showConnectionForm && (
        <ConnectionForm
          connection={editingConnection}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
      
      {showAIConfig && (
        <AIConfigForm
          onClose={() => setShowAIConfig(false)}
        />
      )}
    </SidebarContainer>
  );
};

export default Sidebar;