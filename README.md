# Tool for creating complex Anki notes quickly

Allows for faster note creation by allowing to:

- create note presets
- automatically fill fields with predefined default values
- select fields' values from predefined values
- hide fields which don't need to be visible
- quickly import data to Anki

## Live site

https://ankicc.vercel.app/

Frontend: Vercel (from GitHub)  
Backend: Fly.io (from docker image)  
MongoDB: MongoDB Atlas

## Updating backend

cargo build --release
fly deploy

## Used technologies

- Axum
  - Rust
- MongoDB
- Skeleton (https://www.skeleton.dev)
  - Tailwind
  - SvelteKit
    - Svelte
      - HTML
      - CSS
      - JavaScript
