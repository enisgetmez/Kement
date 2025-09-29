const OllamaProvider = require('./providers/OllamaProvider');
const OpenAIProvider = require('./providers/OpenAIProvider');
const GeminiProvider = require('./providers/GeminiProvider');
const ClaudeProvider = require('./providers/ClaudeProvider');

class AIService {
  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.conversationHistory = [];
    this.config = null;
  }

  /**
   * Initialize AI service with configuration
   * @param {Object} config - AI configuration
   */
  async initialize(config) {
    this.config = config;
    this.providers.clear();

    // Initialize enabled providers
    for (const [providerName, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig.enabled) {
        const provider = this.createProvider(providerName, providerConfig);
        if (provider) {
          this.providers.set(providerName, provider);
        }
      }
    }

    // Set active provider
    if (config.selectedProvider && this.providers.has(config.selectedProvider)) {
      this.activeProvider = this.providers.get(config.selectedProvider);
    } else {
      // Fallback to first available provider
      const firstProvider = Array.from(this.providers.values())[0];
      if (firstProvider) {
        this.activeProvider = firstProvider;
      }
    }

    return this.activeProvider !== null;
  }

  /**
   * Create provider instance based on type
   * @param {string} type - Provider type
   * @param {Object} config - Provider configuration
   * @returns {BaseProvider|null}
   */
  createProvider(type, config) {
    switch (type) {
      case 'ollama':
        return new OllamaProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      default:
        console.warn(`Unknown provider type: ${type}`);
        return null;
    }
  }

  /**
   * Test connection for a specific provider
   * @param {string} providerName - Provider name
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testProvider(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    return await provider.testConnection();
  }

  /**
   * Static method to test a provider with given config
   * @param {string} providerType - Provider type
   * @param {Object} providerConfig - Provider configuration
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async testProviderWithConfig(providerType, providerConfig) {
    try {
      let provider;
      
      switch (providerType) {
        case 'ollama':
          provider = new OllamaProvider(providerConfig);
          break;
        case 'openai':
          provider = new OpenAIProvider(providerConfig);
          break;
        case 'gemini':
          provider = new GeminiProvider(providerConfig);
          break;
        case 'claude':
          provider = new ClaudeProvider(providerConfig);
          break;
        default:
          return { success: false, error: `Unknown provider type: ${providerType}` };
      }

      return await provider.testConnection();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test all configured providers
   * @returns {Promise<Object>} Results for each provider
   */
  async testAllProviders() {
    const results = {};
    
    for (const [name, provider] of this.providers) {
      results[name] = await provider.testConnection();
    }

    return results;
  }

  /**
   * Switch to a different provider
   * @param {string} providerName - Provider name to switch to
   * @returns {boolean} Success status
   */
  switchProvider(providerName) {
    const provider = this.providers.get(providerName);
    if (provider) {
      this.activeProvider = provider;
      return true;
    }
    return false;
  }

  /**
   * Generate command using active provider
   * @param {string} input - Natural language input
   * @param {Object} context - SSH session context
   * @returns {Promise<{success: boolean, command?: string, explanation?: string, safetyLevel?: string, error?: string}>}
   */
  async generateCommand(input, context = {}) {
    if (!this.activeProvider) {
      return { success: false, error: 'No AI provider available' };
    }

    if (!this.activeProvider.isConfigured()) {
      return { success: false, error: 'Active provider is not properly configured' };
    }

    try {
      const result = await this.activeProvider.generateCommand(input, context);
      
      // Log command generation for safety
      if (result.success) {
        console.log(`AI Command Generated: ${result.command} (Safety: ${result.safetyLevel})`);
      }

      return result;
    } catch (error) {
      console.error('AI command generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Explain a command using active provider
   * @param {string} command - Command to explain
   * @returns {Promise<{success: boolean, explanation?: string, error?: string}>}
   */
  async explainCommand(command) {
    if (!this.activeProvider) {
      return { success: false, error: 'No AI provider available' };
    }

    try {
      return await this.activeProvider.explainCommand(command);
    } catch (error) {
      console.error('AI command explanation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Chat with AI assistant
   * @param {string} message - User message
   * @param {Object} context - SSH session context
   * @returns {Promise<{success: boolean, response?: string, error?: string}>}
   */
  async chat(message, context = {}) {
    if (!this.activeProvider) {
      return { success: false, error: 'No AI provider available' };
    }

    try {
      const result = await this.activeProvider.chat(message, this.conversationHistory, context);
      
      // Update conversation history
      if (result.success) {
        this.conversationHistory.push({
          user: message,
          assistant: result.response,
          timestamp: new Date().toISOString(),
          context: { ...context }
        });

        // Keep only last 20 messages to prevent memory bloat
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      }

      return result;
    } catch (error) {
      console.error('AI chat error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Assess command safety level
   * @param {string} command - Command to assess
   * @returns {string} Safety level: 'safe', 'moderate', 'dangerous'
   */
  assessCommandSafety(command) {
    const dangerousPatterns = [
      /rm\s+.*-rf/i,
      /dd\s+if=/i,
      /mkfs/i,
      /format/i,
      /fdisk/i,
      /parted/i,
      /shutdown/i,
      /reboot/i,
      /halt/i,
      /init\s+0/i,
      /kill\s+-9\s+1/i,
      />/i // Redirection can be dangerous
    ];

    const moderatePatterns = [
      /chmod/i,
      /chown/i,
      /chgrp/i,
      /su\s/i,
      /sudo/i,
      /service/i,
      /systemctl/i,
      /mount/i,
      /umount/i,
      /crontab/i,
      /firewall/i,
      /iptables/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return 'dangerous';
      }
    }

    for (const pattern of moderatePatterns) {
      if (pattern.test(command)) {
        return 'moderate';
      }
    }

    return 'safe';
  }

  /**
   * Get active provider information
   * @returns {Object|null} Provider info
   */
  getActiveProviderInfo() {
    if (!this.activeProvider) {
      return null;
    }

    return {
      name: this.activeProvider.getName(),
      status: this.activeProvider.getStatus(),
      isConfigured: this.activeProvider.isConfigured()
    };
  }

  /**
   * Get all providers information
   * @returns {Object} Providers info
   */
  getAllProvidersInfo() {
    const info = {};
    
    for (const [name, provider] of this.providers) {
      info[name] = {
        name: provider.getName(),
        status: provider.getStatus(),
        isConfigured: provider.isConfigured()
      };
    }

    return info;
  }

  /**
   * Update provider configuration
   * @param {string} providerName - Provider name
   * @param {Object} newConfig - New configuration
   */
  updateProviderConfig(providerName, newConfig) {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.updateConfig(newConfig);
    }
  }

  /**
   * Check if AI service is ready
   * @returns {boolean}
   */
  isReady() {
    return this.activeProvider !== null && this.activeProvider.isConfigured();
  }

  /**
   * Get service status
   * @returns {Object}
   */
  getStatus() {
    return {
      isReady: this.isReady(),
      activeProvider: this.getActiveProviderInfo(),
      availableProviders: this.getAllProvidersInfo(),
      conversationLength: this.conversationHistory.length
    };
  }
}

// Singleton instance
const aiService = new AIService();

module.exports = aiService;
module.exports.AIService = AIService;