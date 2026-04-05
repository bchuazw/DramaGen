# Workspace

## Overview

pnpm workspace monorepo using TypeScript. **DramaGen** — a full-stack hackathon web app (Replit x ElevenLabs) where users sign in, type a mild message, pick a drama style, choose a preset voice or clone their own via microphone, and generate a dramatic audio rant.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui
- **Animations**: framer-motion, canvas particle system
- **Auth**: Clerk (@clerk/react + @clerk/express)
- **AI**: OpenAI GPT-4o-mini (text translation), ElevenLabs (TTS + voice cloning)

## Architecture

### Frontend (artifacts/dramagen)
- **Home** (`/`): Landing page with animated hero, "How It Works" 3-step section, 8 drama mode preview cards, animated stat counters, scroll CTA; interactive canvas particle background (embers/sparks/emojis), mouse-reactive effects
- **Generate** (`/generate`): Protected route — text input, 8 drama modes, voice selection (6 presets + cloned voice), microphone voice cloning, audio playback with animated waveform, multi-stage loading skeleton
- **My Rants** (`/my-rants`): Protected — user's personal generation history with play/download/share
- **Gallery** (`/gallery`): Public — "The Hall of Screams" showing community generations with play/react/share; animated empty state with CTA
- **About** (`/about`): Public — how it works, disclaimer
- **404** (`/*`): Custom "You've Yelled Into the Void" themed page with animated emoji, navigation buttons
- **Sign-in/Sign-up** (`/sign-in`, `/sign-up`): Clerk auth pages
- **InteractiveBackground**: Canvas particle system with mobile optimization (reduced particles on small screens)
- **Theme toggle**: Dark/light mode with theme provider, persisted to localStorage
- **Mobile navigation**: Hamburger menu with animated slide-down on small screens

### Backend (artifacts/api-server)
- **POST /api/translate**: Takes text + drama mode, uses OpenAI to rewrite dramatically (auth required)
- **POST /api/generate**: Takes translated text + voice_id, generates audio via ElevenLabs TTS (auth required, rate limited 10/hr)
- **GET /api/voices/presets**: Returns 6 preset voices
- **POST /api/voice/clone**: Clones user voice from audio upload, saves to user account via upsert (auth required, rate limited)
- **GET /api/voice/my-clone**: Returns user's cloned voice if any (auth required)
- **GET /api/gallery**: Public gallery entries
- **GET /api/my-rants**: User's generation history (auth required)
- **POST /api/gallery/:id/react**: Add emoji reaction
- **GET /api/audio/:filename**: Serve generated audio files
- **CORS**: Restricted to Replit domains only (not wildcard)
- **Cleanup**: Auto-deletes audio files older than 24 hours

### Database Tables
- **generations**: id, original_text, translated_text, mode, voice_type, voice_name, audio_filename, userId, is_public, created_at
- **preset_voices**: id, elevenlabsVoiceId, name, description, emoji
- **users**: id, clerkId (unique), clonedVoiceId, clonedVoiceName, displayName, createdAt, updatedAt
- **reactions**: id, generationId, emoji, createdAt

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
