import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ConnectionManager from '../services/ConnectionManager';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const FormContainer = styled.div`
  background: var(--gradient-primary);
  border: 2px solid var(--neon-green);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 0 50px rgba(0, 255, 136, 0.3);
  animation: slideIn 0.3s ease-out;
`;

const FormTitle = styled.h2`
  color: var(--neon-green);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 25px 0;
  text-align: center;
  text-shadow: 0 0 10px var(--neon-green);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--neon-green);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    background: var(--bg-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--neon-green);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--neon-green);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    background: var(--bg-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan));
    color: var(--bg-primary);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
    }
  ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--neon-cyan);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: var(--neon-pink);
  font-size: 12px;
  margin-top: 5px;
  padding: 8px 12px;
  background: rgba(255, 0, 102, 0.1);
  border: 1px solid rgba(255, 0, 102, 0.3);
  border-radius: 4px;
`;

const TestButton = styled(Button)`
  background: var(--neon-cyan);
  color: var(--bg-primary);
  font-size: 12px;
  padding: 8px 15px;
  margin-top: 10px;

  &:hover:not(:disabled) {
    box-shadow: 0 0 15px var(--neon-cyan);
  }
`;

const ConnectionForm = ({ connection, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    connection || ConnectionManager.getDefaultConnectionData()
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    setTestResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await onSubmit(formData);
      if (!result.success) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Failed to save connection' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await ConnectionManager.testConnection(formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <FormTitle>
          {connection ? 'Edit Connection' : 'New Connection'}
        </FormTitle>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Connection Name *</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="My Server"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Hostname/IP Address *</Label>
            <Input
              type="text"
              value={formData.hostname}
              onChange={(e) => handleChange('hostname', e.target.value)}
              placeholder="192.168.1.100 or example.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Port</Label>
            <Input
              type="number"
              value={formData.port}
              onChange={(e) => handleChange('port', parseInt(e.target.value) || 22)}
              min="1"
              max="65535"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Username *</Label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="root or admin"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Authentication Method</Label>
            <Select
              value={formData.authMethod}
              onChange={(e) => handleChange('authMethod', e.target.value)}
            >
              <option value="password">Password</option>
              <option value="key">Private Key</option>
            </Select>
          </FormGroup>

          {formData.authMethod === 'password' ? (
            <FormGroup>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter your password"
                required
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <Label>Private Key Path *</Label>
              <Input
                type="text"
                value={formData.privateKeyPath}
                onChange={(e) => handleChange('privateKeyPath', e.target.value)}
                placeholder="/home/user/.ssh/id_rsa"
                required
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description for this connection"
            />
          </FormGroup>

          <TestButton
            type="button"
            onClick={handleTest}
            disabled={isTesting || !formData.hostname || !formData.username}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </TestButton>

          {testResult && (
            <ErrorMessage style={{
              color: testResult.success ? 'var(--neon-green)' : 'var(--neon-pink)',
              borderColor: testResult.success ? 'var(--neon-green)' : 'var(--neon-pink)',
              backgroundColor: testResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 102, 0.1)'
            }}>
              {testResult.success ? 'Connection successful!' : testResult.error}
            </ErrorMessage>
          )}

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : connection ? 'Update' : 'Save'}
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Overlay>
  );
};

export default ConnectionForm;