# Digitalgram Connect - Smart Community Notice Board

## Project Overview
Digitalgram Connect is a modern, accessible digital notice board application designed for communities worldwide. It enables efficient information dissemination through multiple channels including visual displays, audio announcements, and offline access capabilities.

## Key Features
- **Multi-language Support**: Content in multiple languages with text-to-speech capabilities
- **Offline Functionality**: Works without internet connection
- **Voice Feedback System**: Community members can provide audio feedback
- **Emergency Alerts**: Priority system for critical announcements
- **QR Code Integration**: Easy sharing and access to notices
- **Responsive Design**: Works on various devices and screen sizes
- **Accessibility Features**: Audio playback for visually impaired users
- **AI Chat Assistant**: Interact with an AI assistant for various categories (Health, Agriculture, Weather, Education, Community, Emergency)
- **User Authentication**: Register, login, and profile management

## Technology Stack
- React with TypeScript
- TailwindCSS for styling
- Web Speech API for text-to-speech
- IndexedDB/LocalStorage for offline data
- QR Code generation
- Node.js with Express for backend API
- MongoDB with Mongoose for database
- JWT for authentication
- Google Gemini API for AI chat functionality

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd digitalgram-connect

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Configuration
1. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb+srv://trey06799:joc2ajmIEega4jxV@cluster0.3isixo3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Starting the Application
```bash
# Start backend server
cd server
npm run dev

# In a separate terminal, start frontend
cd project
npm start
```

## Usage

### Notice Board
Browse and filter notices by category. Listen to audio versions of notices.

### Admin Panel
Create and manage notices with different priorities and categories.

### Voice Feedback
Record and submit audio feedback related to community notices.

### AI Chat
Interact with an AI assistant for various categories. Create new chats, send messages, and get AI-powered responses.

### User Authentication
Register a new account, login with existing credentials, and manage your profile.

## Deployment
The application can be built for production using:
```bash
npm run build
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Created for international hackathon competitions
- Inspired by the need for accessible community information systems