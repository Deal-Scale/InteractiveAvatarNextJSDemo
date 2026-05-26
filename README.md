# MindStream - Interactive AI Avatar Platform

![MindStream Interactive Avatar Platform](./public/demo.png)

A sophisticated, full-stack AI avatar platform built with Next.js, featuring multi-provider chat capabilities, knowledge base integration, and advanced real-time interactions.

## ✨ Features

### 🤖 Multi-Provider AI Integration
- **HeyGen Streaming Avatars** - Interactive video avatars with real-time speech
- **Pollinations** - Text-to-image and avatar generation
- **OpenRouter** - Access to 100+ AI models (Claude, GPT, Gemini, etc.)
- **Google GenAI** - Advanced multimodal AI capabilities

### 💬 Advanced Chat System
- **Real-time messaging** with streaming responses
- **Chat mode switching** between different AI providers
- **Message persistence** with Zustand state management
- **Asset upload support** for images and files within chats

### 🧠 Knowledge Base Integration
- **Dynamic knowledge bases** with vector search
- **Connector system** for external data sources
- **Incremental sync** and real-time updates

### 🎨 Modern UI/UX
- **Responsive design** with mobile-first approach
- **Dark/light theme** support
- **Smooth animations** with Framer Motion
- **Accessible components** using Radix UI
- **Interactive tours** and guided experiences

### 🚀 Production-Ready Architecture
- **TypeScript** for type safety
- **TanStack Query** for server state management
- **TanStack Router** for client-side routing
- **Zustand** for global state management
- **Comprehensive testing** with Vitest
- **Code quality** with Biome linting and formatting

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Framer Motion** - Animation library
- **Zustand** - Lightweight state management

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **TanStack Query** - Server state management
- **HeyGen Streaming Avatar SDK** - Real-time avatar interactions
- **OpenRouter** - Multi-model AI gateway
- **Google GenAI** - Advanced AI capabilities

### Development & Quality
- **Biome** - Fast linting and formatting
- **Vitest** - Modern testing framework
- **Husky** - Git hooks for quality gates
- **TypeScript** - Strict type checking

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **npm** or **pnpm** (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone --recurse-submodules https://github.com/TechWithTy/InteractiveAvatarNextJSDemo.git
   cd InteractiveAvatarNextJSDemo
   ```

   If you cloned without submodules:
   ```bash
   git submodule update --init --recursive
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Configure your API keys in `.env.local`:
   ```env
   # HeyGen API (Server-side only - keep secret!)
   HEYGEN_API_KEY=your_heygen_api_key_here

   # OpenRouter API (for multi-model access)
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Google AI (Optional)
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here

   # Base API URL
   NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

### Starting an Avatar Session

1. **Configure Session Settings**
   - Choose your preferred avatar
   - Select voice settings (rate, emotion, model)
   - Configure speech-to-text provider
   - Set language preferences

2. **Start Interactive Session**
   - Click "Start" to begin the session
   - The avatar will appear and connect via WebSocket
   - Real-time audio and video streaming begins

3. **Chat with Your Avatar**
   - Use voice input or text chat
   - Switch between different AI providers seamlessly
   - Upload images and files for context

### Knowledge Base Features

- **Create Knowledge Bases** with custom content
- **Connect External Sources** via the connector system
- **Search and Query** your knowledge bases in real-time
- **Incremental Sync** keeps data fresh

## 🔧 API Reference

### Avatar Session Management
- `POST /api/streaming/new` - Create new avatar session
- `POST /api/streaming/stop` - Stop active session
- `GET /api/streaming/list` - List active sessions
- `GET /api/streaming/history` - Session history

### Chat & AI Providers
- `POST /api/chat/send` - Send chat messages
- `POST /api/openrouter/*` - OpenRouter model endpoints
- `POST /api/gemini-stream` - Google Gemini streaming

### Knowledge Base
- `POST /api/knowledge-base/create` - Create new KB
- `POST /api/knowledge-base/sync` - Sync KB data
- `GET /api/knowledge-base/search` - Search KB content

## 🚢 Deployment

### Vercel (Recommended)
```bash
pnpm build
# Deploy to Vercel automatically via GitHub integration
```

### Cloudflare Pages
```bash
pnpm cf:build
pnpm cf:preview
```

### Docker
```bash
docker build -f docker/Dockerfile -t mindstream .
docker run -p 3000:3000 mindstream
```

## 🧪 Testing

```bash
# Run test suite
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

## 🎨 Customization

### Adding New AI Providers
1. Create provider adapter in `lib/providers/`
2. Add provider configuration to chat context
3. Update UI components for provider selection

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `styles/globals.css` for global styles
- Use CSS variables for dynamic theming

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── lib/               # Shared utilities
├── components/            # Reusable UI components
├── lib/                   # Core business logic
│   ├── providers/         # AI provider integrations
│   ├── services/          # External service clients
│   └── stores/            # Zustand stores
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HeyGen** for the Streaming Avatar SDK
- **OpenRouter** for multi-model AI access
- **Vercel** for the excellent Next.js platform
- **Radix UI** for accessible component primitives

## 📞 Support

For support and questions:
- 📧 Email: support@techwithty.com
- 💬 Discord: [Join our community](https://discord.gg/techwithty)
- 🐛 Issues: [GitHub Issues](https://github.com/TechWithTy/InteractiveAvatarNextJSDemo/issues)

---

**Made with ❤️ by TechWithTy**
