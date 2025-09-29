const BaseProvider = require('./BaseProvider');

class ClaudeProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-haiku-20240307';
    this.endpoint = config.endpoint || 'https://api.anthropic.com';
  }

  getName() {
    return 'Anthropic Claude';
  }

  async testConnection() {
    try {
      // Test with a minimal request
      const response = await fetch(`${this.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: 'Test connection'
          }]
        })
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
      const userMessage = `Generate a Linux command for: "${input}"

Current context:
- Working directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}

Please respond with:
1. The exact command
2. Brief explanation
3. Safety assessment (safe/moderate/dangerous)`;

      const response = await fetch(`${this.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 200,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userMessage
          }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const responseText = data.content[0]?.text || '';
      const result = this.parseCommandResponse(responseText);

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
      const systemPrompt = 'You are an expert Linux system administrator. Explain commands clearly, focusing on functionality, parameters, and potential risks.';
      
      const userMessage = `Explain this Linux command in detail: ${command}

Please provide:
1. What the command accomplishes
2. Each parameter/flag explained
3. Potential risks or side effects
4. Safety classification (safe/moderate/dangerous)

Be thorough but concise.`;

      const response = await fetch(`${this.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 300,
          temperature: 0.2,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userMessage
          }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const explanation = data.content[0]?.text || 'No explanation available';

      return {
        success: true,
        explanation
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async chat(message, history = [], context = {}) {
    try {
      const systemPrompt = `You are an AI assistant integrated into KEMENT, a modern SSH terminal application.
You help users with Linux system administration, command-line operations, and server management.

Current session context:
- Operating System: ${context.os || 'Linux'}
- Current Directory: ${context.currentDir || '/'}
- Username: ${context.username || 'user'}
- Hostname: ${context.hostname || 'localhost'}

Provide helpful, accurate, and security-conscious assistance. Be concise but thorough in your responses.`;

      const messages = [];
      
      // Add conversation history
      for (const msg of history.slice(-10)) {
        messages.push({ role: 'user', content: msg.user });
        messages.push({ role: 'assistant', content: msg.assistant });
      }
      
      messages.push({ role: 'user', content: message });

      const response = await fetch(`${this.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 500,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const responseText = data.content[0]?.text || 'No response available';

      return {
        success: true,
        response: responseText
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildSystemPrompt(context) {
    return `You are a Linux command generator AI for KEMENT SSH terminal with a focus on safety and accuracy.

CURRENT ENVIRONMENT:
- Operating System: ${context.os || 'Linux'}
- Working Directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Hostname: ${context.hostname || 'localhost'}
- Shell: ${context.shell || 'bash'}

COMMAND GENERATION RULES:
1. Generate safe, contextually appropriate commands
2. Consider current directory and user permissions
3. Avoid destructive operations unless explicitly requested and confirmed
4. Provide clear, executable commands
5. Include brief explanations when helpful

SAFETY CLASSIFICATION:
- safe: Read-only operations (ls, cat, pwd, grep, find, ps)
- moderate: File modifications (cp, mv, chmod, mkdir, touch)  
- dangerous: Destructive operations (rm -rf, dd, mkfs, shutdown, format)

Always prioritize user safety and system integrity. When in doubt, choose the safer option.`;
  }

  parseCommandResponse(response) {
    let command = '';
    let explanation = '';
    let safetyLevel = 'moderate';

    // Look for command in code blocks
    const codeBlockMatch = response.match(/```(?:bash|sh)?\n?(.*?)\n?```/s);
    if (codeBlockMatch) {
      command = codeBlockMatch[1].trim().split('\n')[0];
    } else {
      // Look for inline code
      const inlineCodeMatch = response.match(/`([^`\n]+)`/);
      if (inlineCodeMatch) {
        command = inlineCodeMatch[1];
      } else {
        // Extract first line that looks like a command
        const lines = response.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && /^[a-zA-Z\.]/.test(trimmed) && trimmed.length < 100) {
            command = trimmed;
            break;
          }
        }
      }
    }

    // Extract safety level
    const safetyMatch = response.toLowerCase().match(/safety[:\s]*(safe|moderate|dangerous)/);
    if (safetyMatch) {
      safetyLevel = safetyMatch[1];
    } else {
      // Try to infer from content
      if (response.toLowerCase().includes('dangerous') || response.toLowerCase().includes('risk')) {
        safetyLevel = 'dangerous';
      } else if (response.toLowerCase().includes('safe')) {
        safetyLevel = 'safe';
      }
    }

    // Extract explanation
    const lines = response.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.toLowerCase().includes('explanation') || line.toLowerCase().includes('does')) {
        explanation = lines.slice(i, i + 3).join(' ').replace(/explanation:?/i, '').trim();
        break;
      }
    }

    return {
      command: command || response.split('\n')[0].trim(),
      explanation: explanation || 'Command generated by Claude AI',
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

module.exports = ClaudeProvider;