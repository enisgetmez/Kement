import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';

const EditorContainer = styled.div`
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

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.div`
  color: var(--neon-green);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
`;

const FilePath = styled.div`
  color: var(--text-muted);
  font-size: 11px;
  font-family: 'Fira Code', monospace;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    switch (props.status) {
      case 'saved': return 'var(--neon-green)';
      case 'modified': return 'var(--neon-cyan)';
      case 'saving': return 'var(--neon-cyan)';
      case 'error': return 'var(--neon-pink)';
      default: return 'var(--text-muted)';
    }
  }};
  font-size: 12px;
  font-weight: 500;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: ${props => props.status === 'saving' ? 'pulse 1.5s infinite' : 'none'};
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))';
      case 'danger': return 'var(--neon-pink)';
      default: return 'var(--bg-tertiary)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return 'var(--neon-green)';
      case 'danger': return 'var(--neon-pink)';
      default: return 'var(--border-color)';
    }
  }};
  border-radius: 4px;
  color: ${props => props.variant ? 'var(--bg-primary)' : 'var(--text-primary)'};
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  background: var(--bg-primary);
  
  .monaco-editor {
    background: var(--bg-primary) !important;
  }

  .monaco-editor .margin {
    background: var(--bg-primary) !important;
  }

  .monaco-editor .monaco-editor-background {
    background: var(--bg-primary) !important;
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
  padding: 12px 15px;
  background: rgba(255, 0, 102, 0.1);
  border: 1px solid rgba(255, 0, 102, 0.3);
  border-radius: 6px;
  color: var(--neon-pink);
  font-size: 12px;
  margin: 10px 15px;
`;

const InfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 15px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 10px;
  color: var(--text-muted);
  min-height: 24px;
`;

const InfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const InfoRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const FileEditor = ({ connection, filePath }) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading');
  const [language, setLanguage] = useState('plaintext');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    // Determine language based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      php: 'php',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      html: 'html',
      xml: 'xml',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
      sql: 'sql',
      go: 'go',
      rust: 'rust',
      rb: 'ruby',
      conf: 'ini',
      ini: 'ini',
      dockerfile: 'dockerfile'
    };
    
    setLanguage(languageMap[extension] || 'plaintext');
    loadFile();
  }, [filePath]);

  useEffect(() => {
    const isModified = content !== originalContent;
    setStatus(isModified ? 'modified' : 'saved');
    setWordCount(content.split(/\s+/).filter(word => word.length > 0).length);
  }, [content, originalContent]);

  useEffect(() => {
    if (autoSave && status === 'modified' && !isSaving) {
      const timeout = setTimeout(() => {
        handleSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [content, autoSave, status, isSaving]);

  const loadFile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate file loading from remote server
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock file content based on file type
      const mockContent = generateMockContent(filePath, language);
      setContent(mockContent);
      setOriginalContent(mockContent);
      setStatus('saved');
    } catch (err) {
      setError('Failed to load file: ' + err.message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockContent = (path, lang) => {
    const fileName = path.split('/').pop();
    
    switch (lang) {
      case 'javascript':
        return `// ${fileName}
// JavaScript file loaded via SSH
const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from remote server!' });
});

app.get('/api/users', (req, res) => {
  // Mock user data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json(users);
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`;

      case 'python':
        return `#!/usr/bin/env python3
# ${fileName}
# Python script loaded via SSH

import os
import sys
import json
import datetime

class ServerManager:
    def __init__(self, config_path):
        self.config_path = config_path
        self.config = self.load_config()
    
    def load_config(self):
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file not found: {self.config_path}")
            return {}
    
    def get_system_info(self):
        return {
            'hostname': os.uname().nodename,
            'platform': sys.platform,
            'timestamp': datetime.datetime.now().isoformat()
        }
    
    def start_services(self):
        print("Starting services...")
        # Service startup logic here
        pass

if __name__ == "__main__":
    manager = ServerManager("/etc/server.conf")
    print("Server manager initialized")
    print(json.dumps(manager.get_system_info(), indent=2))`;

      case 'json':
        return `{
  "name": "${fileName}",
  "description": "Configuration file loaded via SSH",
  "version": "1.0.0",
  "environment": "production",
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "cert": "/etc/ssl/certs/server.crt",
      "key": "/etc/ssl/private/server.key"
    }
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "ssl": true,
    "pool": {
      "min": 5,
      "max": 20
    }
  },
  "logging": {
    "level": "info",
    "file": "/var/log/app.log",
    "rotation": {
      "enabled": true,
      "maxSize": "10MB",
      "maxFiles": 5
    }
  },
  "features": {
    "authentication": true,
    "rate_limiting": true,
    "monitoring": true,
    "backup": {
      "enabled": true,
      "schedule": "0 2 * * *",
      "retention": "30d"
    }
  }
}`;

      case 'shell':
        return `#!/bin/bash
# ${fileName}
# Shell script loaded via SSH

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/deployment.log"
BACKUP_DIR="/backup/\$(date +%Y%m%d)"

# Functions
log() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "\$LOG_FILE"
}

create_backup() {
    local src_dir=\$1
    local backup_name=\$2
    
    log "Creating backup: \$backup_name"
    mkdir -p "\$BACKUP_DIR"
    tar -czf "\$BACKUP_DIR/\$backup_name.tar.gz" -C "\$src_dir" .
    log "Backup completed: \$BACKUP_DIR/\$backup_name.tar.gz"
}

deploy_application() {
    log "Starting deployment process"
    
    # Stop services
    log "Stopping services..."
    sudo systemctl stop nginx
    sudo systemctl stop myapp
    
    # Create backup
    create_backup "/var/www/myapp" "pre-deployment"
    
    # Deploy new version
    log "Deploying new version..."
    sudo cp -r "\$SCRIPT_DIR/../build/*" "/var/www/myapp/"
    sudo chown -R www-data:www-data "/var/www/myapp"
    
    # Start services
    log "Starting services..."
    sudo systemctl start myapp
    sudo systemctl start nginx
    
    log "Deployment completed successfully"
}

# Main execution
log "Deployment script started"
deploy_application
log "Deployment script finished"`;

      case 'yaml':
        return `# ${fileName}
# YAML configuration loaded via SSH

apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP`;

      default:
        return `# ${fileName}
# File loaded via SSH connection from ${connection.hostname}

This is a sample file loaded from the remote server.
You can edit this content and save it back to the server.

File path: ${path}
Connection: ${connection.username}@${connection.hostname}
Language: ${lang}

Line 1
Line 2  
Line 3
Line 4
Line 5

Add your content here...`;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setStatus('saving');

    try {
      // Simulate file saving to remote server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOriginalContent(content);
      setStatus('saved');
      
      // Log save action
      console.log(`File saved: ${filePath} on ${connection.hostname}`);
    } catch (err) {
      setError('Failed to save file: ' + err.message);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (window.confirm('Are you sure you want to revert all changes?')) {
      setContent(originalContent);
      setStatus('saved');
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
  };

  const getStatusText = () => {
    switch (status) {
      case 'saved': return 'Saved';
      case 'modified': return 'Modified';
      case 'saving': return 'Saving...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  const fileName = filePath.split('/').pop();

  return (
    <EditorContainer>
      <ToolBar>
        <ToolBarLeft>
          <FileInfo>
            <FileName>{fileName}</FileName>
            <FilePath>{filePath}</FilePath>
          </FileInfo>
          
          <StatusIndicator status={status}>
            <div className="dot" />
            {getStatusText()}
          </StatusIndicator>
        </ToolBarLeft>

        <ToolBarRight>
          <ActionButton onClick={handleRevert} disabled={status !== 'modified'}>
            Revert
          </ActionButton>
          <ActionButton 
            variant="primary"
            onClick={handleSave} 
            disabled={isSaving || status === 'saved'}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </ActionButton>
        </ToolBarRight>
      </ToolBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <EditorWrapper>
        {isLoading ? (
          <LoadingOverlay>
            <div className="spinner" />
            Loading file from {connection.hostname}...
          </LoadingOverlay>
        ) : (
          <Editor
            height="100%"
            language={language}
            value={content}
            onChange={setContent}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: '"Fira Code", "Courier New", monospace',
              lineNumbers: 'on',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              folding: true,
              renderLineHighlight: 'all',
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: true,
              smoothScrolling: true,
              mouseWheelZoom: true,
              contextmenu: true,
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              glyphMargin: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlightOnlyWhenFocus: false
            }}
          />
        )}
      </EditorWrapper>

      <InfoBar>
        <InfoLeft>
          <span>Language: {language}</span>
          <span>Lines: {content.split('\n').length}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {content.length}</span>
        </InfoLeft>
        
        <InfoRight>
          <span>Line {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>Auto-save: {autoSave ? 'ON' : 'OFF'}</span>
          <span>{connection.username}@{connection.hostname}</span>
        </InfoRight>
      </InfoBar>
    </EditorContainer>
  );
};

export default FileEditor;