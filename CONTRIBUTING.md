# 🤝 Contributing to KEMENT

Thank you for your interest in contributing to KEMENT! This document provides guidelines and instructions for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be Respectful**: Treat all contributors with respect and professionalism
- **Be Inclusive**: Welcome developers of all skill levels and backgrounds
- **Be Constructive**: Provide helpful feedback and constructive criticism
- **Be Patient**: Understand that everyone is learning and growing
- **Be Collaborative**: Work together to build something amazing

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control
- **Linux** development environment (Ubuntu 20.04+ recommended)
- Basic knowledge of **React**, **Electron**, and **Node.js**

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/kement.git
cd kement
```

3. **Add upstream** remote:
```bash
git remote add upstream https://github.com/enisgetmez/kement.git
```

---

## 🔧 Development Setup

### Installation

```bash
# Install dependencies
npm install

# Install development tools globally (optional)
npm install -g electron electron-builder
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start built application
npm start

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Create AppImage distribution
npm run dist
```

### Environment Configuration

Create a `.env` file for development (optional):
```bash
NODE_ENV=development
ELECTRON_DEV_TOOLS=true
```

---

## 📁 Project Structure

```
kement/
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── AIConfigForm.js      # AI configuration modal
│   │   ├── AIChatPanel.js       # AI chat interface
│   │   ├── ConnectionForm.js    # SSH connection form
│   │   ├── FileEditor.js        # Remote file editor
│   │   ├── MainContent.js       # Main application layout
│   │   ├── SFTPBrowser.js       # SFTP file browser
│   │   └── TerminalTab.js       # Terminal interface
│   ├── services/                # Business logic
│   │   ├── providers/           # AI provider implementations
│   │   │   ├── BaseProvider.js  # Abstract base class
│   │   │   ├── OllamaProvider.js
│   │   │   ├── OpenAIProvider.js
│   │   │   ├── GeminiProvider.js
│   │   │   └── ClaudeProvider.js
│   │   ├── AIService.js         # AI service orchestrator
│   │   ├── ConnectionManager.js # SSH connection management
│   │   └── SSHSession.js        # SSH session handling
│   ├── styles/                  # Styling
│   │   ├── global.css          # Global styles and CSS variables
│   │   └── themes.js           # Theme configurations
│   └── utils/                   # Utility functions
├── assets/                      # Static assets
│   ├── icons/                  # Application icons
│   └── images/                 # Screenshots and graphics
├── dist/                       # Built application files
├── main.js                     # Electron main process
├── package.json               # Dependencies and scripts
├── webpack.config.js          # Webpack configuration
└── README.md                  # Project documentation
```

---

## 🎯 Development Guidelines

### Code Style

We follow these coding standards:

#### JavaScript/React
- **ES6+** syntax preferred
- **Functional components** with hooks
- **Destructuring** for props and state
- **Arrow functions** for inline functions
- **Consistent naming**: camelCase for variables, PascalCase for components

```javascript
// ✅ Good
const MyComponent = ({ title, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(!isOpen);
    onClose?.();
  };

  return <div onClick={handleClick}>{title}</div>;
};

// ❌ Avoid
function MyComponent(props) {
  var is_open = false;
  
  function handleClick() {
    is_open = !is_open;
    if (props.onClose) {
      props.onClose();
    }
  }
  
  return <div onClick={handleClick}>{props.title}</div>;
}
```

#### CSS/Styling
- **styled-components** for component styling
- **CSS variables** for theme consistency
- **Mobile-first** responsive design
- **BEM methodology** for utility classes

```javascript
// ✅ Good
const StyledButton = styled.button`
  background: var(--gradient-primary);
  border: 1px solid var(--neon-cyan);
  padding: 12px 24px;
  border-radius: 6px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 166, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
  }
`;
```

### Git Workflow

#### Branch Naming
- **Feature branches**: `feature/description-of-feature`
- **Bug fixes**: `fix/description-of-bug`
- **Documentation**: `docs/description-of-change`
- **Refactoring**: `refactor/description-of-refactor`

#### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add AI command generation for SSH operations"

# Bug fixes
git commit -m "fix: resolve SFTP connection timeout issues"

# Documentation
git commit -m "docs: update installation instructions for AppImage"

# Refactoring
git commit -m "refactor: optimize AI provider loading mechanism"

# Breaking changes
git commit -m "feat!: redesign connection profile storage format"
```

#### Branching Strategy

1. **Create feature branch** from main:
```bash
git checkout main
git pull upstream main
git checkout -b feature/amazing-feature
```

2. **Work on your feature** with regular commits

3. **Keep branch updated** with main:
```bash
git fetch upstream
git rebase upstream/main
```

4. **Push and create PR**:
```bash
git push origin feature/amazing-feature
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] **Test thoroughly**: Ensure your changes work as expected
- [ ] **Run tests**: `npm test` should pass
- [ ] **Check linting**: `npm run lint` should show no errors
- [ ] **Update documentation**: Update README.md if needed
- [ ] **Test builds**: `npm run build` should succeed
- [ ] **Test on different systems**: If possible, test on various Linux distributions

### PR Requirements

1. **Clear Title**: Descriptive title following conventional commit format
2. **Detailed Description**: Explain what changes you made and why
3. **Screenshots**: Include screenshots for UI changes
4. **Testing Steps**: Provide steps to test your changes
5. **Breaking Changes**: Clearly document any breaking changes

### PR Template

```markdown
## 🚀 Description
Brief description of what this PR does.

## 🔧 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] I have tested this change locally
- [ ] I have added tests for my changes (if applicable)
- [ ] All existing tests pass

## 📸 Screenshots (if applicable)
Add screenshots here...

## 📝 Additional Notes
Any additional information about this change.
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and builds
2. **Code Review**: Maintainers will review your code
3. **Feedback Incorporation**: Address review comments
4. **Final Approval**: Once approved, PR will be merged

---

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Clear Title**: Descriptive summary of the issue
- **Environment Details**: OS, Node version, KEMENT version
- **Steps to Reproduce**: Detailed steps to recreate the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots/Logs**: Visual evidence and error messages
- **Additional Context**: Any other relevant information

### Feature Requests

For feature requests, please provide:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: Your suggested implementation
- **Alternative Solutions**: Other approaches you considered
- **Use Cases**: How would this feature be used?
- **Priority**: How important is this feature to you?

### Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority:high` - High priority issues
- `priority:medium` - Medium priority issues
- `priority:low` - Low priority issues

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=AIService
```

### Writing Tests

#### Unit Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionForm from '../ConnectionForm';

describe('ConnectionForm', () => {
  it('should validate required fields', () => {
    render(<ConnectionForm />);
    
    const submitButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/hostname is required/i)).toBeInTheDocument();
  });
});
```

#### Integration Tests
```javascript
import { testConnection } from '../services/SSHSession';

describe('SSH Integration', () => {
  it('should establish connection with valid credentials', async () => {
    const connection = {
      host: 'test-server',
      username: 'testuser',
      password: 'testpass'
    };
    
    const result = await testConnection(connection);
    expect(result.success).toBe(true);
  });
});
```

### Manual Testing Checklist

Before submitting, test these scenarios:

#### SSH Connections
- [ ] Password authentication works
- [ ] SSH key authentication works
- [ ] Connection profiles save/load correctly
- [ ] Multiple simultaneous connections
- [ ] Connection recovery after network issues

#### SFTP Operations
- [ ] Directory navigation
- [ ] File upload/download
- [ ] File editing
- [ ] Progress tracking
- [ ] Error handling

#### AI Integration
- [ ] All AI providers connect properly
- [ ] Command generation works
- [ ] Command execution from AI suggestions
- [ ] Configuration saving/loading
- [ ] Error handling for API failures

#### User Interface
- [ ] Responsive design on different screen sizes
- [ ] Theme consistency
- [ ] Keyboard shortcuts work
- [ ] Tab management
- [ ] Modal interactions

---

## 📚 Documentation

### Writing Documentation

- **Clear and Concise**: Use simple language and short sentences
- **Code Examples**: Include practical examples for code-related docs
- **Screenshots**: Add visual guides for UI features
- **Keep Updated**: Update docs when you change functionality
- **Cross-reference**: Link to related documentation sections

### Documentation Types

1. **README.md**: Overview, installation, basic usage
2. **CONTRIBUTING.md**: This file - contributor guidelines
3. **API.md**: API documentation for services and components
4. **CHANGELOG.md**: Version history and changes
5. **Code Comments**: Inline documentation for complex logic

### JSDoc Standards

Use JSDoc for function documentation:

```javascript
/**
 * Establishes SSH connection to remote server
 * @param {Object} connectionData - Connection configuration
 * @param {string} connectionData.host - Server hostname or IP
 * @param {number} connectionData.port - SSH port number
 * @param {string} connectionData.username - SSH username
 * @param {string} [connectionData.password] - SSH password
 * @returns {Promise<Object>} Connection result with success status
 * @throws {Error} When connection parameters are invalid
 */
async function connectToServer(connectionData) {
  // Implementation...
}
```

---

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **CHANGELOG.md**: Release notes
- **GitHub**: Contributor graphs and statistics
- **Social Media**: Shout-outs for significant contributions

---

## 💬 Getting Help

Need help while contributing?

- **GitHub Discussions**: Use [GitHub Discussions](https://github.com/enisgetmez/kement/discussions)
- **GitHub Issues**: Create an issue for specific problems
- **Email**: Contact maintainer at enis@enisgetmez.com
- **Documentation**: Check existing docs first

---

## 🎯 Areas We Need Help

We're especially looking for contributions in:

- **Testing**: Automated test coverage improvements
- **Documentation**: User guides and API documentation
- **Performance**: Memory and CPU optimization
- **Accessibility**: Making KEMENT accessible to all users
- **Internationalization**: Multi-language support
- **AI Providers**: Support for additional AI services
- **Security**: Security auditing and improvements
- **Mobile**: Responsive design improvements

---

Thank you for contributing to KEMENT! 🚀

Together, we're building the future of SSH terminal applications with AI assistance.

**Happy Coding!** 💻✨