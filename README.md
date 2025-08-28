# Game Refactor Application

A multiplayer game application built with Node.js, Express, Socket.IO, and React, featuring a modular, scalable architecture following senior engineer best practices.

## 🏗️ Architecture Overview

The application has been refactored from a monolithic `app.js` file into a clean, modular structure that follows the **Single Responsibility Principle** and **Separation of Concerns**.

### **Before (Monolithic)**
- ❌ Single `app.js` file with 1627+ lines
- ❌ Mixed concerns (server setup, game logic, socket handling)
- ❌ Difficult to test and maintain
- ❌ Hard to scale individual components

### **After (Modular)**
- ✅ Clean separation of concerns
- ✅ Testable individual components
- ✅ Scalable architecture
- ✅ Easy to maintain and extend

## 📁 Project Structure

```
src/
├── server.js              # Main server entry point
├── middleware/            # Express middleware configuration
│   └── index.js
├── routes/                # Route configuration
│   └── index.js
├── socket/                # Socket.IO configuration
│   └── index.js
└── services/              # Business logic services
    ├── GameManager.js     # Main game orchestration
    ├── RoomManager.js     # Room management
    ├── GameFlowManager.js # Game flow control
    ├── ParticipantManager.js # Participant management
    └── GameStateManager.js # Game state management
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gameRefactor
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run frontend-install
   ```

3. **Environment setup**
   ```bash
   cp config/keys_dev.example.js config/keys_dev.js
   # Edit config/keys_dev.js with your MongoDB URI
   ```

4. **Start the application**
   ```bash
   # Development mode (both backend and frontend)
   npm run dev
   
   # Backend only
   npm run server
   
   # Frontend only
   npm run frontend
   ```

## 🧪 Testing

The application now includes a comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Tools

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Clean Installation
```bash
# Clean install (useful for dependency issues)
npm run clean
```

## 🏛️ Architecture Principles

### 1. **Single Responsibility Principle**
Each service class has one clear responsibility:
- `GameManager`: Orchestrates game operations
- `RoomManager`: Manages room lifecycle
- `GameFlowManager`: Controls game progression
- `ParticipantManager`: Handles participant operations
- `GameStateManager`: Manages game state

### 2. **Dependency Injection**
Services receive their dependencies through constructor injection:
```javascript
class GameManager {
  constructor(io, config) {
    this.roomManager = new RoomManager(io, config);
    this.gameFlowManager = new GameFlowManager(io, config);
    // ... other managers
  }
}
```

### 3. **Error Handling**
Consistent error handling with proper logging:
```javascript
try {
  const result = await this.roomManager.createNewRoom(params);
  return { success: true, data: result };
} catch (error) {
  logger.error('Error creating room:', error);
  return { success: false, error: error.message };
}
```

### 4. **Async/Await Pattern**
Modern JavaScript patterns for better readability:
```javascript
async handleRoomCreation(socket, params) {
  const result = await this.roomManager.handleRoomCreation(socket, params);
  if (result.success) {
    // Handle success
  }
}
```

## 📊 Benefits of the New Architecture

### **Maintainability**
- ✅ Easy to locate specific functionality
- ✅ Clear separation of concerns
- ✅ Consistent coding patterns

### **Testability**
- ✅ Individual services can be unit tested
- ✅ Mock dependencies easily
- ✅ Test business logic in isolation

### **Scalability**
- ✅ Services can be scaled independently
- ✅ Easy to add new features
- ✅ Clear interfaces between components

### **Team Development**
- ✅ Multiple developers can work on different services
- ✅ Reduced merge conflicts
- ✅ Clear ownership of code

## 🔄 Migration Guide

### From Old `app.js` to New Structure

1. **Update imports in existing files**
   ```javascript
   // Old
   const io = require('socket.io')(server);
   
   // New
   const { io } = require('./src/socket');
   ```

2. **Update server startup**
   ```javascript
   // Old
   node app.js
   
   // New
   node src/server.js
   ```

3. **Update nodemon configuration**
   ```javascript
   // Old
   "server": "nodemon app.js"
   
   // New
   "server": "nodemon src/server.js"
   ```

## 🚧 Future Enhancements

### **Planned Improvements**
- [ ] Add TypeScript support
- [ ] Implement Redis for session storage
- [ ] Add API documentation with Swagger
- [ ] Implement rate limiting
- [ ] Add monitoring and metrics
- [ ] Containerization with Docker

### **Performance Optimizations**
- [ ] Database connection pooling
- [ ] Caching layer
- [ ] Load balancing support
- [ ] Microservices architecture

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new functionality
3. Use the provided linting and formatting tools
4. Update documentation for new features

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ following senior engineer best practices**
