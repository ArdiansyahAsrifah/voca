# Voca — AI-Powered Voice Bridge for the Hearing and Speech Impaired

> Real-time speech-to-text, smart reply generation, and text-to-speech powered by Gemma 4 — enabling seamless two-way communication for people with hearing or speech disabilities.

Built for the **Kaggle x Google DeepMind Gemma 4 Good Hackathon**.

---

## What is Voca?

Voca is a mobile-first web app that bridges the communication gap for people with hearing or speech impairments. Instead of relying on sign language or expensive AAC (Augmentative and Alternative Communication) devices, Voca creates a seamless two-way conversation experience powered by Gemma 4.

---

## How It Works

1. **Listen** — The conversation partner speaks naturally. Voca transcribes their speech to text in real time via the Web Speech API.
2. **Understand** — Gemma 4 analyzes the transcribed speech and understands the context and intent.
3. **Suggest** — Gemma 4 generates 4 contextually relevant smart reply options tailored to the user's personal tone and style.
4. **Speak** — The user taps a reply (or types a custom one), and Voca speaks it aloud via text-to-speech so the conversation partner hears a natural voice response immediately.
5. **Emergency** — A dedicated Emergency & Safety panel with pre-defined phrases lets users instantly display or speak critical messages with a single tap — no typing required.

---

## Features

- **Real-time speech-to-text** — Continuous listening with interim and final transcript display
- **Gemma 4 smart replies** — 4 context-aware reply suggestions generated per conversation turn
- **Text-to-speech output** — Speaks selected replies aloud naturally
- **Custom reply input** — Type and send any message if smart replies don't fit
- **Emergency & Safety panel** — Pre-defined Medical and Safety phrases, each speakable or displayable in fullscreen
- **Onboarding & voice profile** — Users set their tone, reply style, and favorite topics so replies sound like them
- **Offline-friendly UI** — Core STT and TTS run natively in the browser, no extra dependencies

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| AI / Smart Replies | Gemma 4 (`gemma-4-26b-a4b-it`) via Google Gemini API |
| Speech-to-Text | Web Speech API (browser-native) |
| Text-to-Speech | Web Speech Synthesis API (browser-native) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google AI Studio API key (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/voca.git
cd voca

# Install dependencies
npm install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and add your API key:

```
VITE_GOOGLE_AI_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** Speech recognition requires a browser that supports the Web Speech API (Chrome or Edge recommended). Use HTTPS or localhost — microphone access is blocked on plain HTTP.

---

## Project Structure

```
src/
├── pages/
│   ├── Onboarding.jsx     # First-time setup flow (tone, style, topics)
│   ├── Conversation.jsx   # Main conversation screen
│   ├── Emergency.jsx      # Emergency & Safety panel
│   └── Profile.jsx        # Edit voice profile
├── services/
│   ├── gemma.js           # Gemma 4 API integration & smart reply generation
│   └── speechToText.js    # Web Speech API wrapper
└── index.css              # Global styles & glassmorphism design system
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_AI_KEY` | Google AI Studio API key for Gemma 4 access |

---

## Live Demo

[voca-gemma.vercel.app](https://voca-gemma.vercel.app)

---

## Hackathon

This project was built for the [Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon) hosted by Kaggle and Google DeepMind.

**Tracks:** Digital Equity & Inclusivity · Health & Sciences

---

## License

MIT
