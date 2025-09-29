const { ipcRenderer } = window.require('electron');

class ConnectionManager {
  static async loadConnections() {
    try {
      return await ipcRenderer.invoke('load-connections');
    } catch (error) {
      console.error('Failed to load connections:', error);
      return { success: false, error: error.message };
    }
  }

  static async saveConnection(connectionData) {
    try {
      // Validate connection data
      const validation = this.validateConnection(connectionData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return await ipcRenderer.invoke('save-connection', connectionData);
    } catch (error) {
      console.error('Failed to save connection:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteConnection(connectionId) {
    try {
      return await ipcRenderer.invoke('delete-connection', connectionId);
    } catch (error) {
      console.error('Failed to delete connection:', error);
      return { success: false, error: error.message };
    }
  }

  static async testConnection(connectionData) {
    try {
      return await ipcRenderer.invoke('test-ssh-connection', connectionData);
    } catch (error) {
      console.error('Failed to test connection:', error);
      return { success: false, error: error.message };
    }
  }

  static validateConnection(data) {
    if (!data.name || data.name.trim() === '') {
      return { valid: false, error: 'Connection name is required' };
    }

    if (!data.hostname || data.hostname.trim() === '') {
      return { valid: false, error: 'Hostname is required' };
    }

    if (!data.username || data.username.trim() === '') {
      return { valid: false, error: 'Username is required' };
    }

    const port = parseInt(data.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      return { valid: false, error: 'Port must be a valid number between 1 and 65535' };
    }

    if (data.authMethod === 'password') {
      if (!data.password || data.password.trim() === '') {
        return { valid: false, error: 'Password is required for password authentication' };
      }
    } else if (data.authMethod === 'key') {
      if (!data.privateKeyPath || data.privateKeyPath.trim() === '') {
        return { valid: false, error: 'Private key path is required for key authentication' };
      }
    }

    return { valid: true };
  }

  static generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDefaultConnectionData() {
    return {
      id: null,
      name: '',
      hostname: '',
      port: 22,
      username: '',
      authMethod: 'password',
      password: '',
      privateKeyPath: '',
      description: '',
      color: '#00ff88',
      createdAt: new Date().toISOString()
    };
  }

  static formatConnectionForDisplay(connection) {
    return {
      ...connection,
      displayText: `${connection.name} (${connection.username}@${connection.hostname}:${connection.port})`,
      isValid: this.validateConnection(connection).valid
    };
  }

  static exportConnections(connections) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      connections: connections.map(conn => ({
        ...conn,
        // Remove sensitive data for export
        password: '',
        privateKeyPath: ''
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async importConnections(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.connections || !Array.isArray(importData.connections)) {
        return { success: false, error: 'Invalid import format' };
      }

      const validConnections = importData.connections.filter(conn => {
        const validation = this.validateConnection(conn);
        return validation.valid;
      });

      return { 
        success: true, 
        connections: validConnections,
        imported: validConnections.length,
        total: importData.connections.length
      };
    } catch (error) {
      return { success: false, error: 'Failed to parse import data' };
    }
  }
}

export default ConnectionManager;