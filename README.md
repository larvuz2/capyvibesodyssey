# Capyverse

A 3D multiplayer capybara virtual world built with Three.js and Socket.io.

## Features

- 3D environment with dynamic lighting and physics
- Playable capybara character with animations
- Multiplayer functionality
- Mobile and desktop support
- Beautiful nature environment

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. **Important:** Add the 3D model files (see section below)
4. Start development server: `npm run dev:all`

## 3D Model Files

The following binary 3D model files need to be manually added to the repository:

1. Character model:
   - Add `capybara.glb` to the `public/character/` directory

2. Animation files:
   - Add `idle.glb`, `walk.glb`, and `jump.glb` to the `public/animations/` directory

3. Asset files:
   - Add `orange.glb` to the `public/assets/` directory

See the markdown files in each directory for more details.

## Technologies Used

- Three.js for 3D rendering
- Vite for build and development
- Socket.io for multiplayer
- Rapier for physics

## Structure

- `src/` - Client-side code
- `server/` - Server-side code
- `public/` - Static assets
- `models/` - 3D models