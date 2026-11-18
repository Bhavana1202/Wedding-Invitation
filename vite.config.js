
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGitHubPages ? '/Wedding-Invitation/' : '/',
  plugins: [svelte()]
});
