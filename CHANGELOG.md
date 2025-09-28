# Changelog

All notable changes to KEMENT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-29

### Added
- **Initial Release** of KEMENT SSH Terminal Emulator
- **Multi-Terminal Management**: SSH sessions in tabs with session persistence
- **Dual-Pane SFTP Browser**: Full-featured file manager with local and remote browsing
- **Real SSH Integration**: Full SSH shell functionality using ssh2 library
- **Broadcast Commands**: Send commands to all active SSH terminals simultaneously
- **Saved Commands System**: Store and execute frequently used commands with one click
- **Modern Cyberpunk UI**: Dark theme with neon accents and modern design
- **Connection Management**: Save, edit, and organize SSH connection profiles
- **Address Bar Navigation**: Direct path navigation in SFTP browser
- **Secure Authentication**: Support for password and SSH key authentication
- **Session Persistence**: SSH sessions remain active during tab switching
- **File Operations**: Upload, download, delete files via SFTP
- **Terminal Emulation**: Full-featured terminal with xterm.js integration
- **Connection Testing**: Test SSH connections before saving
- **Import/Export**: Connection profiles backup and restore
- **Error Handling**: Comprehensive error messages and recovery
- **Performance Optimization**: Efficient resource management and memory usage

### Technical Implementation
- **Frontend**: React 19.1+ with Styled Components
- **Backend**: Electron 38.2.0 main process
- **SSH Client**: ssh2 library for real SSH connections
- **SFTP**: ssh2-sftp-client for file operations
- **Terminal**: @xterm/xterm for terminal emulation
- **Storage**: electron-store for persistent connection data
- **Build System**: Webpack 5 with optimization
- **Architecture**: IPC communication between main and renderer processes

### Security Features
- Local-only data storage (no cloud dependencies)
- Encrypted connection data storage
- Support for encrypted SSH private keys
- Secure IPC communication
- No telemetry or data collection

### Platform Support
- Linux distributions (Ubuntu, Debian, Fedora, SUSE, etc.)
- Built as Electron app with native Linux integration
- AppImage distribution format planned

### Known Limitations
- Linux-only support (Windows/macOS support planned for future releases)
- No SSH tunnel/port forwarding support yet
- No X11 forwarding support yet
- No SCP support (SFTP only)

---

## Upcoming Features (Roadmap)

### [1.1.0] - Planned
- **SSH Tunneling**: Local and remote port forwarding
- **X11 Forwarding**: GUI application support over SSH
- **Session Recording**: Terminal session recording and playback
- **Themes**: Additional color themes and customization options
- **Plugin System**: Extensions and custom integrations

### [1.2.0] - Planned
- **Multi-Platform**: Windows and macOS support
- **SCP Support**: Additional file transfer protocol
- **SSH Agent**: Integration with system SSH agent
- **Proxy Support**: SOCKS and HTTP proxy connections
- **Advanced Terminal**: Split panes and multiple terminals per tab

### [2.0.0] - Future
- **Cloud Integration**: Optional cloud sync for connections
- **Team Features**: Shared connection profiles
- **Monitoring**: SSH connection monitoring and alerts
- **Scripting**: Automation and scripting capabilities
- **Advanced SFTP**: Synchronization and advanced file operations

---

## Development Changelog

### Development Process
- Project started as MobaXterm alternative for Linux
- Built using modern web technologies (Electron + React)
- Focus on cyberpunk aesthetics and user experience
- Emphasis on real SSH functionality vs. simulation
- Community-driven development approach

### Version History
- **v1.0.0**: Initial public release
- **v0.9.x**: Beta testing and bug fixes
- **v0.8.x**: Advanced features implementation (broadcast, saved commands)
- **v0.7.x**: SFTP browser and file operations
- **v0.6.x**: Real SSH integration and session management
- **v0.5.x**: Basic terminal emulation and UI
- **v0.1.x**: Initial prototyping and architecture

---

## Contributing

We welcome contributions! Please read our contributing guidelines and feel free to:

- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation
- Share the project

## Links

- **GitHub Repository**: https://github.com/enisgetmez/Kement
- **Issue Tracker**: https://github.com/enisgetmez/Kement/issues
- **Documentation**: See README.md
- **License**: MIT License