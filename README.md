# Build AI Agent SDK Documentation

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment is handled by GitHub Actions (see `.github/workflows/deploy.yml`).

The site will be available at: https://linuxdevil.github.io/agent-sdk-docs/

### Manual Deployment

If you need to deploy manually:

```bash
npm run deploy
```

### Setting up GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", set:
   - **Source**: GitHub Actions
4. Push changes to the `main` branch to trigger automatic deployment
