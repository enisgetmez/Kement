/**
 * Base AI Provider Interface
 * All AI providers must implement this interface
 */
class BaseProvider {
  constructor(config) {
    this.config = config;
    this.isConnected = false;
  }

  /**
   * Test connection to the AI provider
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection() {
    throw new Error('testConnection method must be implemented');
  }

  /**
   * Generate command based on natural language input
   * @param {string} input - Natural language input
   * @param {Object} context - SSH session context
   * @returns {Promise<{success: boolean, command?: string, explanation?: string, safetyLevel?: string, error?: string}>}
   */
  async generateCommand(input, context) {
    throw new Error('generateCommand method must be implemented');
  }

  /**
   * Explain what a command does
   * @param {string} command - Shell command to explain
   * @returns {Promise<{success: boolean, explanation?: string, error?: string}>}
   */
  async explainCommand(command) {
    throw new Error('explainCommand method must be implemented');
  }

  /**
   * Chat with AI for general assistance
   * @param {string} message - User message
   * @param {Array} history - Conversation history
   * @param {Object} context - SSH session context
   * @returns {Promise<{success: boolean, response?: string, error?: string}>}
   */
  async chat(message, history = [], context = {}) {
    throw new Error('chat method must be implemented');
  }

  /**
   * Update provider configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.config;
  }

  /**
   * Get provider name
   * @returns {string}
   */
  getName() {
    throw new Error('getName method must be implemented');
  }

  /**
   * Get provider status
   * @returns {string} - 'connected', 'disconnected', 'error'
   */
  getStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

module.exports = BaseProvider;