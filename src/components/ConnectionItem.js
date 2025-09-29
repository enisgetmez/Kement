import React, { useState } from 'react';
import styled from 'styled-components';

const ItemContainer = styled.div`
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => props.isSelected ? 'var(--bg-tertiary)' : 'transparent'};
  border: 1px solid ${props => props.isSelected ? 'var(--neon-green)' : 'transparent'};
  transition: all 0.3s ease;
  animation: ${props => props.isActive ? 'slideIn 0.3s ease-out' : 'none'};
  box-shadow: ${props => props.isSelected ? 'var(--shadow-neon)' : 'none'};

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--neon-cyan);
    transform: translateX(4px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  cursor: pointer;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const ItemDetails = styled.div`
  color: var(--text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'var(--neon-green)';
      case 'connecting': return 'var(--neon-cyan)';
      case 'error': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  box-shadow: ${props => {
    switch (props.status) {
      case 'connected': return '0 0 8px var(--neon-green)';
      case 'connecting': return '0 0 8px var(--neon-cyan)';
      case 'error': return '0 0 8px var(--neon-pink)';
      default: return 'none';
    }
  }};
  animation: ${props => props.status === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
  margin-left: 8px;
  flex-shrink: 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ItemContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: ${props => {
    switch (props.variant) {
      case 'connect': return 'var(--neon-green)';
      case 'edit': return 'var(--neon-cyan)';
      case 'delete': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  color: var(--bg-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px currentColor;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ContextMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-neon);
  border-radius: 6px;
  padding: 8px 0;
  min-width: 150px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 8px 15px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--neon-green);
  }
`;

const ConnectionItem = ({
  connection,
  isActive,
  isSelected,
  onSelect,
  onConnect,
  onEdit,
  onDelete
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    isActive ? 'connected' : 'disconnected'
  );

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (isActive) return;

    setConnectionStatus('connecting');
    const result = await onConnect(connection);
    
    if (result.success) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('error');
      // Show error notification
      console.error('Connection failed:', result.error);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    onEdit(connection);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    if (window.confirm(`Are you sure you want to delete "${connection.name}"?`)) {
      onDelete(connection.id);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  const handleItemClick = () => {
    onSelect(connection);
    setShowContextMenu(false);
  };

  const handleItemDoubleClick = async () => {
    // Auto-connect on double-click if not active
    if (!isActive) {
      setConnectionStatus('connecting');
      const result = await onConnect(connection);
      
      if (result.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        console.error('Connection failed:', result.error);
      }
    }
  };

  return (
    <ItemContainer
      isSelected={isSelected}
      isActive={isActive}
      onClick={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <ItemHeader>
        <ItemInfo>
          <ItemName>{connection.name}</ItemName>
          <ItemDetails>
            {connection.username}@{connection.hostname}:{connection.port}
          </ItemDetails>
        </ItemInfo>
        
        <ActionsContainer>
          {!isActive && (
            <ActionButton
              variant="connect"
              onClick={handleConnect}
              title="Connect"
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? '...' : '→'}
            </ActionButton>
          )}
          
          <ActionButton
            variant="edit"
            onClick={handleEdit}
            title="Edit Connection"
          >
            ✎
          </ActionButton>
          
          <ActionButton
            variant="delete"
            onClick={handleDelete}
            title="Delete Connection"
          >
            ✕
          </ActionButton>
        </ActionsContainer>

        <StatusIndicator status={connectionStatus} />
      </ItemHeader>

      {showContextMenu && (
        <ContextMenu>
          {!isActive && (
            <MenuItem onClick={handleConnect}>
              Connect
            </MenuItem>
          )}
          <MenuItem onClick={handleEdit}>
            Edit Connection
          </MenuItem>
          <MenuItem>
            Duplicate
          </MenuItem>
          <MenuItem>
            Export
          </MenuItem>
          <MenuItem 
            onClick={handleDelete}
            style={{ color: 'var(--neon-pink)' }}
          >
            Delete
          </MenuItem>
        </ContextMenu>
      )}
    </ItemContainer>
  );
};

export default ConnectionItem;