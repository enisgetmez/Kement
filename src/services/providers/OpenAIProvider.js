const BaseProvider = require('./BaseProvider');

class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'o4-mini';
    this.endpoint = config.endpoint || 'https://api.openai.com/v1';
  }

  getName() {
    return 'OpenAI';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isConnected = true;
        return { success: true };
      } else {
        this.isConnected = false;
        const error = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${error}` };
      }
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  async generateCommand(input, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = `Generate a Linux command for: "${input}"

Current context:
- Working directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}

Please respond with:
1. The exact command
2. Brief explanation
3. Safety level (safe/moderate/dangerous)`;

      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const result = this.parseCommandResponse(data.choices[0].message.content);

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
      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert Linux/Unix system administrator. Explain commands clearly and concisely.'
            },
            {
              role: 'user',
              content: `Explain this command in detail: ${command}

Please include:
1. What the command does
2. Each parameter/flag explained
3. Potential risks
4. Safety level assessment`
            }
          ],
          temperature: 0.2,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      return {
        success: true,
        explanation: data.choices[0].message.content
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async chat(message, history = [], context = {}) {
    try {
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant integrated into KEMENT, a modern SSH terminal.
You help with Linux/Unix administration, command-line operations, and server management.

Current session context:
- OS: ${context.os || 'Linux'}  
- Directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}

Be helpful, practical, and security-conscious in your responses.`
      };

      const messages = [systemMessage];
      
      // Add conversation history
      for (const msg of history.slice(-10)) {
        messages.push({ role: 'user', content: msg.user });
        messages.push({ role: 'assistant', content: msg.assistant });
      }
      
      messages.push({ role: 'user', content: message });

      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices[0].message.content
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildSystemPrompt(context) {
    return `You are a Linux command generator AI for KEMENT SSH terminal.

CONTEXT:
- OS: ${context.os || 'Linux'}
- Directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}

INSTRUCTIONS:
1. Generate safe, appropriate Linux commands
2. Consider current directory and user permissions
3. Avoid destructive operations unless explicitly requested
4. Provide brief explanations
5. Classify safety level

SAFETY CLASSIFICATION:
- safe: Read operations, navigation, information gathering
- moderate: File modifications, permissions, process management
- dangerous: System modifications, deletion, formatting

Always prioritize user and system safety.`;
  }

  parseCommandResponse(response) {
    // Try to extract structured information from the response
    const lines = response.split('\n');
    let command = '';
    let explanation = '';
    let safetyLevel = 'moderate';

    // Look for command in common formats
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('`') && trimmedLine.endsWith('`')) {
        command = trimmedLine.slice(1, -1);
        break;
      }
      if (trimmedLine.match(/^[a-zA-Z]/)) {
        // Likely a command line
        command = trimmedLine;
        break;
      }
    }

    // Extract safety level
    const safetyMatch = response.match(/(safe|moderate|dangerous)/i);
    if (safetyMatch) {
      safetyLevel = safetyMatch[1].toLowerCase();
    }

    return {
      command: command || response.split('\n')[0].trim(),
      explanation: explanation || 'Command generated by OpenAI',
      safetyLevel
    };
  }

  updateConfig(newConfig) {
    super.updateConfig(newConfig);
    this.apiKey = newConfig.apiKey || this.apiKey;
    this.model = newConfig.model || this.model;
    this.endpoint = newConfig.endpoint || this.endpoint;
  }

  isConfigured() {
    return !!(this.apiKey && this.model);
  }
}

module.exports = OpenAIProvider;