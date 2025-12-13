# Kalky AI Copilot Instructions

## Architecture Overview

This is a React TypeScript web application built with Vite, featuring two main AI-powered modes:

1. **Kalky GPT**: Chat interface with specialized knowledge about Kalky Group companies (Interior, Infra, Digital, Kitzine)
2. **GEN AI**: Image editing/mixing tool using Gemini AI for creative content generation

Key directories:
- `components/`: React components (GenAIView, ChatView, Login, etc.)
- `services/`: API integration (geminiService.ts for Gemini AI calls)
- `types.ts`: TypeScript interfaces for state management

## Development Workflow

### Setup
1. Set `GEMINI_API_KEY` in `.env.local`
2. Run `npm run dev` (uses Vite dev server)
3. Login with username: `kalky`, password: `Sivam@111`

### Building
- Uses Vite with base path `/test/` for deployment
- Dependencies loaded via importmap in `index.html` (no package.json)

## Code Patterns

### UI Components
- Use `glass-panel` class for translucent UI elements with backdrop blur
- Mac-style design with animations (float, fade-in variants)
- Color scheme: primary `#000044`, gradients with blue/indigo
- Buttons use `Button` component with variants: primary, secondary, danger

### State Management
- Local component state with `useState` hooks
- File uploads converted to base64 for Gemini API
- Streaming responses for chat (use `for await` with `result`)

### API Integration
- Gemini service functions: `editImageWithGemini()`, `createChatSession()`
- Error handling: Check `finishReason` for SAFETY/RECITATION blocks
- Chat system instructions embedded in `createChatSession()`

### Authentication
- Simple hardcoded login in `Login.tsx`
- App renders login screen until authenticated

## Key Files
- `App.tsx`: Main app with mode switching
- `services/geminiService.ts`: All AI API calls
- `components/GenAIView.tsx`: Image generation UI
- `components/ChatView.tsx`: Chat interface
- `types.ts`: Core type definitions

## Conventions
- Aspect ratios: '16:9', '9:16', '1:1' for image generation
- Max 10 images for mixing
- Streaming chat responses with typing indicators
- Download generated images as PNG

This application serves as an AI-powered showcase for Kalky Digital's services, combining conversational AI with creative image tools.