import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--neon-green);
  box-shadow: 0 0 50px rgba(0, 255, 136, 0.3);
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-50px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
    padding: 15px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--neon-cyan);
    border-radius: 4px;

    &:hover {
      background: var(--neon-green);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: var(--neon-green);
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '🤖';
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: var(--neon-pink);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  font-size: 16px;
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

const ProviderSection = styled.div`
  margin-bottom: 25px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border-left: 3px solid ${props => props.enabled ? 'var(--neon-green)' : 'var(--text-muted)'};
`;

const ProviderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const ProviderName = styled.h3`
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'var(--neon-green)';
      case 'connecting': return 'var(--neon-cyan)';
      case 'error': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  animation: ${props => props.status === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-tertiary);
    transition: 0.3s;
    border-radius: 24px;
    border: 1px solid var(--border-color);
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: var(--text-muted);
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--neon-green);
    border-color: var(--neon-green);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
    background-color: var(--bg-primary);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  }
  
  &[type="password"] {
    letter-spacing: 2px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  }
  
  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const TestButton = styled.button`
  padding: 8px 16px;
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
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan));
  border: none;
  border-radius: 6px;
  color: var(--bg-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
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

const ErrorMessage = styled.div`
  background: rgba(255, 64, 129, 0.1);
  border: 1px solid var(--neon-pink);
  border-radius: 4px;
  color: var(--neon-pink);
  padding: 10px;
  margin-top: 10px;
  font-size: 12px;
  font-family: 'Fira Code', monospace;
`;

const SuccessMessage = styled.div`
  background: rgba(0, 255, 127, 0.1);
  border: 1px solid var(--neon-green);
  border-radius: 4px;
  color: var(--neon-green);
  padding: 10px;
  margin-top: 10px;
  font-size: 12px;
  font-family: 'Fira Code', monospace;
`;

const AIConfigForm = ({ onSave, onClose }) => {
  const [config, setConfig] = useState({
    selectedProvider: 'ollama',
    providers: {
      ollama: {
        enabled: true,
        endpoint: 'http://localhost:11434',
        model: 'llama2',
        status: 'disconnected'
      },
      openai: {
        enabled: false,
        apiKey: '',
        model: 'gpt-4',
        endpoint: 'https://api.openai.com/v1',
        status: 'disconnected'
      },
      gemini: {
        enabled: false,
        apiKey: '',
        model: 'gemini-pro',
        endpoint: 'https://generativelanguage.googleapis.com',
        status: 'disconnected'
      },
      claude: {
        enabled: false,
        apiKey: '',
        model: 'claude-3-sonnet-20240229',
        endpoint: 'https://api.anthropic.com',
        status: 'disconnected'
      }
    },
    settings: {
      safetyLevel: 'medium',
      autoExecute: false,
      contextWindow: 4096,
      temperature: 0.7
    }
  });

  const [testing, setTesting] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('get-ai-config');
      if (result.success && result.config) {
        setConfig(prevConfig => ({
          ...prevConfig,
          ...result.config
        }));
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
  };

  const updateProviderConfig = (provider, field, value) => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          [field]: value
        }
      }
    }));
    
    // Clear previous errors
    if (errors[provider]) {
      setErrors(prev => ({
        ...prev,
        [provider]: null
      }));
    }
  };

  const updateSettings = (field, value) => {
    setConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const testProvider = async (provider) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    setErrors(prev => ({ ...prev, [provider]: null }));
    
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('test-ai-provider', provider, config.providers[provider]);
      
      if (result.success) {
        setConfig(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [provider]: {
              ...prev.providers[provider],
              status: 'connected'
            }
          }
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [provider]: result.error
        }));
        setConfig(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [provider]: {
              ...prev.providers[provider],
              status: 'error'
            }
          }
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [provider]: error.message
      }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    setSuccess('');
    
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('save-ai-config', config);
      
      if (result.success) {
        setSuccess('AI configuration saved successfully! AI Assistant is now ready.');
        
        if (onSave) {
          onSave(config);
        }
      } else {
        setErrors({ general: result.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const getProviderIcon = (provider) => {
    const icons = {
      ollama: '🦙',
      openai: '🤖',
      gemini: '💎',
      claude: '🎭'
    };
    return icons[provider] || '🔧';
  };

  const renderProviderConfig = (provider, providerName) => {
    const providerConfig = config.providers[provider];
    const isEnabled = providerConfig.enabled;
    
    return (
      <ProviderSection key={provider} enabled={isEnabled}>
        <ProviderHeader>
          <ProviderName>
            <span>{getProviderIcon(provider)}</span>
            {providerName}
            <StatusIndicator status={providerConfig.status} />
          </ProviderName>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => updateProviderConfig(provider, 'enabled', e.target.checked)}
            />
            <span className="slider"></span>
          </ToggleSwitch>
        </ProviderHeader>
        
        {isEnabled && (
          <>
            <FormGroup>
              <Label>Endpoint</Label>
              <Input
                type="text"
                value={providerConfig.endpoint}
                onChange={(e) => updateProviderConfig(provider, 'endpoint', e.target.value)}
                placeholder={`Enter ${providerName} endpoint`}
              />
            </FormGroup>
            
            {(provider !== 'ollama') && (
              <FormGroup>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={providerConfig.apiKey}
                  onChange={(e) => updateProviderConfig(provider, 'apiKey', e.target.value)}
                  placeholder={`Enter ${providerName} API key`}
                />
              </FormGroup>
            )}
            
            <FormGroup>
              <Label>Model</Label>
              <Input
                type="text"
                value={providerConfig.model}
                onChange={(e) => updateProviderConfig(provider, 'model', e.target.value)}
                placeholder="Enter model name"
              />
            </FormGroup>
            
            <TestButton
              onClick={() => testProvider(provider)}
              disabled={testing[provider] || (provider !== 'ollama' && !providerConfig.apiKey)}
            >
              {testing[provider] ? 'Testing...' : 'Test Connection'}
            </TestButton>
            
            {errors[provider] && (
              <ErrorMessage>{errors[provider]}</ErrorMessage>
            )}
          </>
        )}
      </ProviderSection>
    );
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ConfigContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>AI Assistant Configuration</Title>
          <CloseButton onClick={onClose} title="Close AI Settings">
            ×
          </CloseButton>
        </Header>
        
        {renderProviderConfig('ollama', 'Ollama')}
        {renderProviderConfig('openai', 'OpenAI')}
        {renderProviderConfig('gemini', 'Google Gemini')}
        {renderProviderConfig('claude', 'Anthropic Claude')}
        
        <ProviderSection enabled={true}>
          <ProviderHeader>
            <ProviderName>⚙️ General Settings</ProviderName>
          </ProviderHeader>
        
        <FormGroup>
          <Label>Default Provider</Label>
          <Select
            value={config.selectedProvider}
            onChange={(e) => setConfig(prev => ({ ...prev, selectedProvider: e.target.value }))}
          >
            {Object.entries(config.providers)
              .filter(([_, provider]) => provider.enabled)
              .map(([key, _]) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Safety Level</Label>
          <Select
            value={config.settings.safetyLevel}
            onChange={(e) => updateSettings('safetyLevel', e.target.value)}
          >
            <option value="low">Low - Execute most commands</option>
            <option value="medium">Medium - Confirm risky commands</option>
            <option value="high">High - Confirm all commands</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={config.settings.autoExecute}
              onChange={(e) => updateSettings('autoExecute', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Auto-execute safe commands
          </Label>
        </FormGroup>
      </ProviderSection>
      
      {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <SaveButton onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Configuration'}
      </SaveButton>
      </ConfigContainer>
    </ModalOverlay>
  );
};

export default AIConfigForm;