const BaseProvider = require('./BaseProvider');

class OllamaProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.endpoint = config.endpoint || 'http://localhost:11434';
    this.model = config.model || 'llama2';
  }

  getName() {
    return 'Ollama';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.endpoint}/api/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isConnected = true;
        return { success: true };
      } else {
        this.isConnected = false;
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  async generateCommand(input, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildCommandPrompt(input, context);

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = this.parseCommandResponse(data.response);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async explainCommand(command) {
    try {
      const prompt = `Explain this Linux/Unix command in detail:

Command: ${command}

Please provide:
1. What the command does
2. Each part/flag explained
3. Potential risks or side effects
4. Safety level (safe/moderate/dangerous)

Format your response clearly and concisely.`;

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        explanation: data.response
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async chat(message, history = [], context = {}) {
    try {
      const systemPrompt = `You are an AI assistant integrated into KEMENT, a modern SSH terminal. 
You help users with Linux/Unix system administration, command-line operations, and server management.

Current context:
- OS: ${context.os || 'Linux'}
- Current directory: ${context.currentDir || 'unknown'}
- User: ${context.username || 'unknown'}
- Host: ${context.hostname || 'unknown'}

Be helpful, concise, and practical in your responses.`;

      let conversationHistory = systemPrompt;
      
      // Add conversation history
      for (const msg of history.slice(-10)) { // Keep last 10 messages
        conversationHistory += `\n\nUser: ${msg.user}`;
        conversationHistory += `\nAssistant: ${msg.assistant}`;
      }
      
      conversationHistory += `\n\nUser: ${message}\nAssistant:`;

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: conversationHistory,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response.trim()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildSystemPrompt(context) {
    return `You are a Linux/Unix command generator AI integrated into KEMENT SSH terminal.

CONTEXT:
- OS: ${context.os || 'Linux'}
- Current directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}
- Shell: ${context.shell || 'bash'}

RULES:
1. Generate ONLY the command, no explanations unless asked
2. Commands must be valid for the current OS/context
3. Prioritize safety - avoid destructive operations
4. Use relative paths when appropriate
5. Consider current directory context

SAFETY LEVELS:
- SAFE: ls, cat, pwd, whoami, date, etc.
- MODERATE: chmod, chown, service operations, package management
- DANGEROUS: rm -rf, dd, mkfs, shutdown, etc.

Response format:
COMMAND: [the actual command]
EXPLANATION: [brief explanation]
SAFETY: [SAFE/MODERATE/DANGEROUS]`;
  }

  buildCommandPrompt(input, context) {
    return `Generate a Linux command for: "${input}"

Current working directory: ${context.currentDir || '/'}
Available commands in context: ${context.availableCommands || 'standard Unix utilities'}

Respond with the command following the specified format.`;
  }

  parseCommandResponse(response) {
    const commandMatch = response.match(/COMMAND:\s*(.+)/i);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/i);
    const safetyMatch = response.match(/SAFETY:\s*(SAFE|MODERATE|DANGEROUS)/i);

    return {
      command: commandMatch ? commandMatch[1].trim() : response.split('\n')[0].trim(),
      explanation: explanationMatch ? explanationMatch[1].trim() : 'Command generated by AI',
      safetyLevel: safetyMatch ? safetyMatch[1].toLowerCase() : 'moderate'
    };
  }

  updateConfig(newConfig) {
    super.updateConfig(newConfig);
    this.endpoint = newConfig.endpoint || this.endpoint;
    this.model = newConfig.model || this.model;
  }
}

module.exports = OllamaProvider;