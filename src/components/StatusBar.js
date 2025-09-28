import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  height: 24px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'Fira Code', monospace;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatusRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  .label {
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 500;
  }
  
  .value {
    color: ${props => {
      switch (props.type) {
        case 'connected': return 'var(--neon-green)';
        case 'error': return 'var(--neon-pink)';
        case 'warning': return 'var(--neon-cyan)';
        default: return 'var(--text-primary)';
      }
    }};
    font-weight: 600;
  }
`;

const Indicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'var(--neon-green)';
      case 'connecting': return 'var(--neon-cyan)';
      case 'error': return 'var(--neon-pink)';
      case 'warning': return 'var(--neon-cyan)';
      default: return 'var(--text-muted)';
    }
  }};
  animation: ${props => 
    props.status === 'connecting' ? 'pulse 1.5s infinite' : 
    props.status === 'connected' ? 'glow 3s infinite' : 'none'
  };
  box-shadow: ${props => 
    props.status === 'connected' ? '0 0 8px currentColor' : 'none'
  };
`;

const Clock = styled.div`
  color: var(--neon-green);
  font-weight: 600;
  text-shadow: 0 0 5px var(--neon-green);
`;

const Version = styled.div`
  color: var(--text-muted);
  font-size: 10px;
`;

const StatusBar = ({ activeConnections, selectedConnection }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [networkStatus, setNetworkStatus] = useState('online');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionStatus = () => {
    if (!selectedConnection) {
      return { status: 'none', text: 'No connection' };
    }

    if (selectedConnection.sessionId) {
      return { status: 'connected', text: `Connected to ${selectedConnection.name}` };
    }

    return { status: 'disconnected', text: 'Disconnected' };
  };

  const connectionStatus = getConnectionStatus();
  const activeCount = activeConnections.length;

  return (
    <StatusContainer>
      <StatusLeft>
        <StatusItem type={connectionStatus.status}>
          <Indicator status={connectionStatus.status} />
          <span className="value">{connectionStatus.text}</span>
        </StatusItem>

        {activeCount > 0 && (
          <StatusItem type="connected">
            <span className="label">Sessions:</span>
            <span className="value">{activeCount}</span>
          </StatusItem>
        )}

        <StatusItem type={networkStatus === 'online' ? 'connected' : 'error'}>
          <Indicator status={networkStatus === 'online' ? 'connected' : 'error'} />
          <span className="value">{networkStatus === 'online' ? 'Online' : 'Offline'}</span>
        </StatusItem>
      </StatusLeft>

      <StatusRight>
        <StatusItem>
          <span className="label">CPU:</span>
          <span className="value">--</span>
        </StatusItem>

        <StatusItem>
          <span className="label">Memory:</span>
          <span className="value">--</span>
        </StatusItem>

        <Clock>{formatTime(currentTime)}</Clock>

        <Version>v1.0.0</Version>
      </StatusRight>
    </StatusContainer>
  );
};

export default StatusBar;