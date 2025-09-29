const { Client } = require('ssh2');
const EventEmitter = require('events');

class SSHSession extends EventEmitter {
  constructor(connectionData) {
    super();
    this.connectionData = connectionData;
    this.client = null;
    this.shell = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  async connect() {
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.isConnecting = true;
      this.client = new Client();
      
      const timeout = setTimeout(() => {
        this.client.end();
        this.isConnecting = false;
        reject(new Error('Connection timeout'));
      }, 15000);

      this.client.on('ready', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.isConnecting = false;
        this.emit('connected');
        resolve();
      });

      this.client.on('error', (err) => {
        clearTimeout(timeout);
        this.isConnecting = false;
        this.isConnected = false;
        this.emit('error', err);
        reject(err);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.isConnecting = false;
        if (this.shell) {
          this.shell = null;
        }
        this.emit('disconnected');
      });

      // Connect with credentials
      const connectConfig = {
        host: this.connectionData.hostname,
        port: this.connectionData.port || 22,
        username: this.connectionData.username,
        readyTimeout: 15000,
        keepaliveInterval: 30000
      };

      if (this.connectionData.authMethod === 'password') {
        connectConfig.password = this.connectionData.password;
      } else if (this.connectionData.authMethod === 'key') {
        connectConfig.privateKey = require('fs').readFileSync(this.connectionData.privateKeyPath);
        if (this.connectionData.passphrase) {
          connectConfig.passphrase = this.connectionData.passphrase;
        }
      }

      this.client.connect(connectConfig);
    });
  }

  async createShell() {
    if (!this.isConnected) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      this.client.shell((err, shell) => {
        if (err) {
          reject(err);
          return;
        }

        this.shell = shell;
        
        // Handle shell data
        shell.on('data', (data) => {
          this.emit('data', data);
        });

        shell.on('close', () => {
          this.shell = null;
          this.emit('shell-close');
        });

        shell.stderr.on('data', (data) => {
          this.emit('data', data);
        });

        resolve(shell);
      });
    });
  }

  writeToShell(data) {
    if (this.shell) {
      this.shell.write(data);
    }
  }

  async executeCommand(command) {
    if (!this.isConnected) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('data', (data) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        stream.on('close', (code, signal) => {
          resolve({
            stdout,
            stderr,
            exitCode: code,
            signal
          });
        });
      });
    });
  }

  resizeShell(cols, rows) {
    if (this.shell) {
      this.shell.setWindow(rows, cols);
    }
  }

  async readFile(filePath) {
    if (!this.isConnected) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }

        sftp.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });
    });
  }

  async writeFile(filePath, content) {
    if (!this.isConnected) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }

        sftp.writeFile(filePath, content, 'utf8', (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.shell = null;
  }

  getConnectionInfo() {
    return {
      hostname: this.connectionData.hostname,
      port: this.connectionData.port,
      username: this.connectionData.username,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    };
  }
}

module.exports = SSHSession;