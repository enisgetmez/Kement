import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: var(--bg-primary);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 50px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const CloseButton = styled.button`
  background: var(--neon-pink);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px var(--neon-pink);
  }

  &:active {
    transform: scale(0.9);
  }
`;

const ChatTitle = styled.h3`
  color: var(--neon-green);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon {
    font-size: 16px;
    animation: ${props => props.thinking ? pulseAnimation : 'none'} 1.5s infinite;
  }
`;

const ProviderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 11px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'var(--neon-green)';
      case 'connecting': return 'var(--neon-cyan)';
      case 'error': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  animation: ${props => props.status === 'connecting' ? pulseAnimation : 'none'} 1s infinite;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--neon-cyan);
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 90%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  padding: 8px 12px;
  border-radius: ${props => props.isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px'};
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))'
    : 'var(--bg-secondary)'
  };
  color: ${props => props.isUser ? 'var(--bg-primary)' : 'var(--text-primary)'};
  font-size: 13px;
  line-height: 1.4;
  border: ${props => props.isUser ? 'none' : '1px solid var(--border-color)'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommandBlock = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--neon-green);
  border-radius: 6px;
  padding: 8px;
  margin: 8px 0;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  position: relative;
`;

const CommandText = styled.code`
  color: var(--neon-green);
  display: block;
  margin-bottom: 8px;
`;

const ExecuteButton = styled.button`
  background: var(--gradient-primary);
  border: 1px solid var(--neon-green);
  border-radius: 4px;
  color: var(--neon-green);
  padding: 4px 8px;
  font-size: 11px;
  font-family: 'Fira Code', monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--neon-green);
    color: var(--bg-primary);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 0 4px;
`;

const CommandPreview = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  margin-top: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
`;

const CommandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 8px;
  margin-bottom: 8px;
`;

const SafetyBadge = styled.span`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.level) {
      case 'safe': return 'rgba(0, 255, 127, 0.2)';
      case 'moderate': return 'rgba(255, 193, 7, 0.2)';
      case 'dangerous': return 'rgba(255, 64, 129, 0.2)';
      default: return 'var(--bg-secondary)';
    }
  }};
  color: ${props => {
    switch (props.level) {
      case 'safe': return 'var(--neon-green)';
      case 'moderate': return '#ffc107';
      case 'dangerous': return 'var(--neon-pink)';
      default: return 'var(--text-secondary)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.level) {
      case 'safe': return 'var(--neon-green)';
      case 'moderate': return '#ffc107';
      case 'dangerous': return 'var(--neon-pink)';
      default: return 'var(--border-color)';
    }
  }};
`;

const CommandCode = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  color: var(--neon-green);
  margin: 4px 0;
`;

const CommandActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 12px;
  border: 1px solid ${props => props.variant === 'execute' ? 'var(--neon-green)' : 'var(--border-color)'};
  border-radius: 4px;
  background: ${props => props.variant === 'execute' ? 'var(--neon-green)' : 'var(--bg-tertiary)'};
  color: ${props => props.variant === 'execute' ? 'var(--bg-primary)' : 'var(--text-primary)'};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatInput = styled.div`
  display: flex;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  gap: 8px;
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const TextInput = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  resize: none;
  min-height: 36px;
  max-height: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan));
  border: none;
  border-radius: 6px;
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.3;
  }
  
  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-secondary);
  }
  
  .subtitle {
    font-size: 12px;
    line-height: 1.5;
  }
`;

const AIChatPanel = ({ sessionId, sshContext, onExecuteCommand, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({ isReady: false, activeProvider: null });
  const [pendingCommand, setPendingCommand] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadAiStatus();
    scrollToBottom();
    
    // Refresh AI status every 5 seconds to detect config changes
    const statusInterval = setInterval(loadAiStatus, 5000);
    
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAiStatus = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('get-ai-status');
      if (result.success) {
        setAiStatus(result.status);
      }
    } catch (error) {
      console.error('Failed to load AI status:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !aiStatus.isReady) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      const { ipcRenderer } = window.require('electron');
      
      // Check if user is asking for a command
      if (userMessage.toLowerCase().includes('command') || 
          userMessage.toLowerCase().includes('how to') ||
          userMessage.toLowerCase().includes('create') ||
          userMessage.toLowerCase().includes('delete') ||
          userMessage.toLowerCase().includes('install')) {
        
        // Generate command
        const commandResult = await ipcRenderer.invoke('ai-generate-command', userMessage, sshContext);
        
        if (commandResult.success) {
          const aiMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: commandResult.explanation || 'Here\'s the command I generated:',
            timestamp: new Date(),
            command: {
              code: commandResult.command,
              explanation: commandResult.explanation,
              safetyLevel: commandResult.safetyLevel
            }
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setPendingCommand(commandResult);
        } else {
          throw new Error(commandResult.error);
        }
      } else {
        // Regular chat
        const chatResult = await ipcRenderer.invoke('ai-chat', userMessage, sshContext);
        
        if (chatResult.success) {
          const aiMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: chatResult.response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(chatResult.error);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCommand = async (command) => {
    if (!command || !sessionId) return;

    try {
      // Execute via parent component
      if (onExecuteCommand) {
        await onExecuteCommand(command.code);
      }

      // Add execution confirmation message
      const confirmMessage = {
        id: Date.now(),
        type: 'system',
        content: `✅ Executed: ${command.code}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      setPendingCommand(null);
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'system',
        content: `❌ Failed to execute: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleExplainCommand = async (command) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('ai-explain-command', command.code);
      
      if (result.success) {
        const explanationMessage = {
          id: Date.now(),
          type: 'assistant',
          content: result.explanation,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, explanationMessage]);
      }
    } catch (error) {
      console.error('Failed to explain command:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message) => {
    // Extract commands from AI responses
    const extractCommands = (text) => {
      if (message.type === 'user') return [];
      
      const commandMatches = text.match(/`([^`\n]+)`/g) || [];
      return commandMatches
        .map(match => match.slice(1, -1))
        .filter(cmd => cmd.includes(' ') || cmd.startsWith('./') || cmd.startsWith('sudo') || 
                       cmd.includes('ls') || cmd.includes('cd') || cmd.includes('mkdir') ||
                       cmd.includes('nano') || cmd.includes('vim') || cmd.includes('cat'))
        .slice(0, 3); // Max 3 commands per message
    };

    const detectedCommands = extractCommands(message.content);
    
    return (
      <Message key={message.id} isUser={message.type === 'user'}>
        <MessageBubble 
          isUser={message.type === 'user'}
          isError={message.isError}
        >
          {message.content}
          
          {message.command && (
            <CommandPreview>
              <CommandHeader>
                <SafetyBadge level={message.command.safetyLevel}>
                  {message.command.safetyLevel}
                </SafetyBadge>
              </CommandHeader>
              
              <CommandCode>{message.command.code}</CommandCode>
              
              <CommandActions>
                <ActionButton 
                  variant="execute"
                  onClick={() => handleExecuteCommand(message.command)}
                  disabled={!sessionId}
                >
                  Execute
                </ActionButton>
                <ActionButton onClick={() => handleExplainCommand(message.command)}>
                  Explain
                </ActionButton>
              </CommandActions>
            </CommandPreview>
          )}
          
          {detectedCommands.length > 0 && (
            <div>
              {detectedCommands.map((cmd, index) => (
                <CommandBlock key={index}>
                  <CommandText>{cmd}</CommandText>
                  <ExecuteButton 
                    onClick={() => onExecuteCommand && onExecuteCommand(cmd)}
                    title="Execute this command"
                  >
                    ▶ Execute
                  </ExecuteButton>
                </CommandBlock>
              ))}
            </div>
          )}
        </MessageBubble>
        <MessageTime isUser={message.type === 'user'}>
          {formatTime(message.timestamp)}
        </MessageTime>
      </Message>
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderLeft>
          <ChatTitle thinking={isLoading}>
            <span className="icon">🤖</span>
            AI Assistant
          </ChatTitle>
          <ProviderStatus>
            <StatusDot status={aiStatus.activeProvider?.status || 'disconnected'} />
            {aiStatus.activeProvider?.name || 'Not Connected'}
          </ProviderStatus>
        </HeaderLeft>
        <CloseButton onClick={onClose} title="Close AI Assistant">
          ×
        </CloseButton>
      </ChatHeader>

      <ChatMessages>
        {messages.length === 0 ? (
          <EmptyState>
            <div className="icon">🚀</div>
            <div className="title">AI-Powered SSH Assistant</div>
            <div className="subtitle">
              Ask me to generate commands, explain syntax, or help with server administration.
              <br />
              Try: "How to list all files?" or "Create a backup script"
            </div>
          </EmptyState>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isLoading && (
          <Message isUser={false}>
            <MessageBubble>
              <span>AI is thinking... 🤔</span>
            </MessageBubble>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInput>
        <InputContainer>
          <TextInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiStatus.isReady ? "Ask AI for help or command generation..." : "AI service not configured"}
            disabled={!aiStatus.isReady || isLoading}
            rows={1}
          />
        </InputContainer>
        <SendButton 
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading || !aiStatus.isReady}
        >
          Send
        </SendButton>
      </ChatInput>
    </ChatContainer>
  );
};

export default AIChatPanel;