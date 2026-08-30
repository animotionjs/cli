# AGENTS.md

## Description

Animotion is a Svelte 5 engine for building animated presentations. A presentation is an ordered sequence of scenes. Each scene is a Svelte component driving its own animation via `createScene` (value tweens, FLIP layout changes, morphing code, per-frame ticks).

## Rules

- **Svelte 5 Runes**: Use runes (`$state`, `$derived`). Avoid legacy Svelte 4 syntax (`$:`).
- **No `$effect`**: Treat `$effect` as a last resort. Use writable `$derived` instead if possible.
- **Library imports**: Scenes import from `@animotion/core`. `#lib/*` is only for the project's own config.
- **Animations**: Do not use built-in Svelte transitions or CSS keyframes for animations. Scenes must be renderable as video through the Animotion API.
