const BaseProvider = require('./BaseProvider');

class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash';
    this.endpoint = config.endpoint || 'https://generativelanguage.googleapis.com';
  }

  getName() {
    return 'Google Gemini';
  }

  async testConnection() {
    try {
      const response = await fetch(
        `${this.endpoint}/v1/models?key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

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
      const userPrompt = `${systemPrompt}

User request: "${input}"

Context:
- Current directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Host: ${context.hostname || 'localhost'}

Generate the appropriate Linux command following the safety guidelines.`;

      const response = await fetch(
        `${this.endpoint}/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: userPrompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 200
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text || '';
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
      const prompt = `As a Linux expert, explain this command in detail:

Command: ${command}

Please provide:
1. Command purpose and functionality
2. Each parameter/option explained
3. Potential security implications
4. Risk assessment (safe/moderate/dangerous)

Be concise but thorough.`;

      const response = await fetch(
        `${this.endpoint}/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 300
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const explanation = data.candidates[0]?.content?.parts[0]?.text || 'No explanation available';

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
      const systemContext = `You are an AI assistant integrated into KEMENT SSH terminal.
You help users with Linux system administration and command-line operations.

Current session:
- OS: ${context.os || 'Linux'}
- Directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}  
- Host: ${context.hostname || 'localhost'}

Be helpful, accurate, and prioritize system security.`;

      let conversationText = systemContext;
      
      // Add conversation history
      for (const msg of history.slice(-8)) {
        conversationText += `\n\nUser: ${msg.user}`;
        conversationText += `\nAssistant: ${msg.assistant}`;
      }
      
      conversationText += `\n\nUser: ${message}`;

      const response = await fetch(
        `${this.endpoint}/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: conversationText }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text || 'No response available';

      return {
        success: true,
        response: responseText.trim()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildSystemPrompt(context) {
    return `You are a Linux command generator for KEMENT SSH terminal.

ENVIRONMENT:
- OS: ${context.os || 'Linux'}
- Current directory: ${context.currentDir || '/'}
- User: ${context.username || 'user'}
- Hostname: ${context.hostname || 'localhost'}

GUIDELINES:
1. Generate safe, appropriate Linux commands
2. Consider user permissions and current context
3. Avoid destructive operations unless explicitly requested
4. Provide clear, concise commands
5. Include brief explanations when helpful

SAFETY LEVELS:
- safe: ls, cat, pwd, grep, find (read-only operations)
- moderate: chmod, cp, mv, mkdir (file system modifications)
- dangerous: rm -rf, dd, mkfs, reboot (destructive operations)

Focus on user safety and system integrity.`;
  }

  parseCommandResponse(response) {
    // Extract command from various formats
    let command = '';
    let explanation = '';
    let safetyLevel = 'moderate';

    // Look for code blocks or commands
    const codeBlockMatch = response.match(/```(?:bash|sh)?\n?(.*?)\n?```/s);
    if (codeBlockMatch) {
      command = codeBlockMatch[1].trim();
    } else {
      // Look for inline code
      const inlineCodeMatch = response.match(/`([^`]+)`/);
      if (inlineCodeMatch) {
        command = inlineCodeMatch[1];
      } else {
        // Try to find command-like text
        const lines = response.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && /^[a-zA-Z]/.test(trimmed) && !trimmed.includes('explanation')) {
            command = trimmed;
            break;
          }
        }
      }
    }

    // Extract safety level
    const safetyMatch = response.toLowerCase().match(/(safe|moderate|dangerous)/);
    if (safetyMatch) {
      safetyLevel = safetyMatch[1];
    }

    return {
      command: command || response.split('\n')[0].trim(),
      explanation: 'Command generated by Gemini AI',
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

module.exports = GeminiProvider;