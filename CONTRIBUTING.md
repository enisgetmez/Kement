# Contributing to KEMENT

First off, thank you for considering contributing to KEMENT! It's people like you that make KEMENT such a great tool for the Linux community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- **Git** for version control
- **Linux** development environment (Ubuntu, Debian, Fedora, etc.)
- Basic knowledge of **JavaScript**, **React**, and **Electron**

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/enisgetmez/Kement.git
   cd Kement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   # Terminal 1: Build in watch mode
   npm run dev
   
   # Terminal 2: Start Electron
   npm start
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🛠️ How to Contribute

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Ubuntu 22.04]
- Node.js Version: [e.g. 18.15.0]
- KEMENT Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### ✨ Suggesting Features

We love feature suggestions! Please use this template:

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples about the feature request.
```

### 🔧 Code Contributions

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment**: Let others know you're working on it
3. **Branch**: Create a feature branch from `main`
4. **Code**: Implement your changes
5. **Test**: Ensure your changes work and don't break existing functionality
6. **Commit**: Use clear, descriptive commit messages
7. **Push**: Push to your fork
8. **PR**: Create a Pull Request

## 🏗️ Development Process

### Project Structure
```
kement/
├── src/                    # React frontend source
│   ├── components/         # React components
│   │   ├── ConnectionForm.js
│   │   ├── TerminalTab.js
│   │   ├── SFTPBrowser.js
│   │   └── ...
│   ├── services/          # Business logic services
│   │   ├── ConnectionManager.js
│   │   ├── SSHSession.js
│   │   └── ...
│   ├── styles/            # CSS and themes
│   └── index.js           # React entry point
├── main.js                # Electron main process
├── webpack.config.js      # Build configuration
└── assets/                # Static assets
```

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation only
- `refactor/code-improvement` - Code refactoring

### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):

```
feat: add broadcast command functionality
fix: resolve SSH session disconnection issue
docs: update installation instructions
style: improve terminal color scheme
refactor: optimize SFTP file operations
test: add unit tests for ConnectionManager
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, styling
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

## 📏 Coding Standards

### JavaScript/React
- Use **ES6+** modern JavaScript features
- Follow **React Hooks** patterns (no class components)
- Use **Styled Components** for styling
- Prefer **functional components**
- Use **async/await** over Promise chains

### Code Formatting
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line Length**: 100 characters max
- **Trailing Commas**: Required in objects/arrays

### Example Code Style
```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledComponent = styled.div`
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 16px;
`;

const MyComponent = ({ connection, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    // Effect logic here
  }, [connection]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(connection);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <StyledComponent>
      <button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
    </StyledComponent>
  );
};

export default MyComponent;
```

### CSS/Styling
- Use **CSS Custom Properties** for theming
- Follow **BEM-like** naming for CSS classes
- **Mobile-first** responsive design
- Use **rem/em** units over px when appropriate

### File Organization
- One React component per file
- Use **PascalCase** for component filenames
- Use **camelCase** for utility functions
- Group related files in appropriate directories

## 🧪 Testing

### Manual Testing
- Test on multiple Linux distributions
- Verify SSH connections work with different servers
- Test SFTP operations (upload, download, delete)
- Verify UI responsiveness and accessibility

### Automated Testing (Future)
We're planning to add:
- Unit tests with Jest
- Integration tests for SSH operations
- End-to-end tests with Playwright
- Performance testing for large file operations

### Testing Checklist
Before submitting a PR, ensure:
- [ ] New features work as expected
- [ ] Existing features still work
- [ ] No console errors or warnings
- [ ] UI is responsive across different screen sizes
- [ ] SSH connections work with password and key auth
- [ ] SFTP operations function correctly
- [ ] Application builds without errors
- [ ] No memory leaks in long-running sessions

## 📚 Documentation

### Code Documentation
- Use **JSDoc** comments for functions and classes
- Include parameter and return type information
- Document complex algorithms and business logic

```javascript
/**
 * Establishes an SSH connection to a remote server
 * @param {Object} connection - Connection configuration
 * @param {string} connection.hostname - Server hostname or IP
 * @param {number} connection.port - SSH port (default: 22)
 * @param {string} connection.username - SSH username
 * @param {string} [connection.password] - SSH password
 * @param {string} [connection.privateKey] - SSH private key path
 * @returns {Promise<SSHSession>} Connected SSH session
 * @throws {Error} If connection fails
 */
const connectSSH = async (connection) => {
  // Implementation here
};
```

### README Updates
- Update feature lists when adding new functionality
- Include screenshots for visual changes
- Update installation instructions if dependencies change
- Add troubleshooting info for common issues

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- **Bug fixes** and stability improvements
- **Performance optimizations** for large files/long sessions
- **Accessibility** improvements
- **Error handling** and user feedback
- **Documentation** improvements

### Medium Priority
- **New SSH features** (tunneling, X11 forwarding)
- **UI/UX enhancements**
- **Additional themes** and customization
- **File manager** improvements
- **Keyboard shortcuts** and productivity features

### Future/Experimental
- **Multi-platform support** (Windows, macOS)
- **Plugin system** architecture
- **Cloud integration** features
- **Advanced terminal** features (split panes)
- **Monitoring and alerting**

## 🏷️ Issue Labels

We use these labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements to docs
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue already exists

## 💬 Communication

- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code discussions
- **GitHub Discussions**: For general questions and ideas
- **Email**: For security issues or private matters

## 🙏 Recognition

Contributors will be:
- Listed in our CONTRIBUTORS.md file
- Mentioned in release notes
- Given credit in commit messages
- Featured in our README if contributions are substantial

## ❓ Questions?

Don't hesitate to ask questions:
- Open a GitHub Discussion for general questions
- Comment on relevant issues for specific questions
- Check existing documentation first
- Be respectful and patient with responses

---

Thank you for contributing to KEMENT! Your help makes this project better for everyone. 🚀