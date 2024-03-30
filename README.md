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

## Used technologies

[<img align="left" width="26" height="26" alt="Svelte" src="https://api.iconify.design/devicon:svelte.svg" style="padding: 0 20px 16px 0"/>](https://svelte.dev "Svelte")
[<img align="left" width="26" height="26" alt="Skeleton" src="readmeIcons\Skeleton.png" style="padding: 0 20px 16px 0"/>](https://www.skeleton.dev "Skeleton")
[<img align="left" width="26" height="26" alt="Typescript" src="https://api.iconify.design/devicon:typescript.svg" style="padding: 0 20px 16px 0"/>](https://www.typescriptlang.org "Typescript")
[<img align="left" width="26" height="26" alt="Javascript" src="https://api.iconify.design/devicon:javascript.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/JavaScript "Javascript")
[<img align="left" width="26" height="26" alt="TailwindCSS" src="https://api.iconify.design/devicon:tailwindcss.svg" style="padding: 0 20px 16px 0"/>](https://tailwindcss.com "TailwindCSS")
[<img align="left" width="26" height="26" alt="Rust" src="https://api.iconify.design/vscode-icons:file-type-rust.svg" style="padding: 0 20px 16px 0"/>](https://www.rust-lang.org "Rust")
[<img align="left" width="26" height="26" alt="Axum" src="readmeIcons\Axum.png" style="padding: 0 20px 16px 0"/>](https://github.com/tokio-rs/axum "Axum")
[<img align="left" width="26" height="26" alt="CSS" src="https://api.iconify.design/devicon:css3.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/CSS "CSS")
[<img align="left" width="26" height="26" alt="HTML" src="https://api.iconify.design/devicon:html5.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/HTML "HTML")
[<img align="left" width="26" height="26" alt="MongoDB" src="https://api.iconify.design/devicon:mongodb.svg" style="padding: 0 20px 16px 0"/>](https://mongodb.com "MongoDB")
[<img width="26" height="26" alt="Tauri" src="https://api.iconify.design/devicon:tauri.svg" style="padding: 0 20px 16px 0"/>](https://tauri.app "Tauri")

## Running locally

frotend:

```
cd frontend
npm run dev
```

backend:

```
cd backend
cargo run
```

## Updating backend

```bash
cargo build --release
fly deploy
```
