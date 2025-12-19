# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based blog using the Pages Router. Originally built with Contentful CMS, it has been migrated to use local static data stored in the `.docs/` directory.

## Build & Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Run production build
```

## Architecture

### Pages Structure
- `/pages/index.js` - Home page displaying all blog posts (sorted by date)
- `/pages/posts/[slug].js` - Dynamic route for individual blog posts
- `/pages/urlscan.js` - URL scanner utility page
- `/pages/api/urlscan.js` - API route for urlscan.io integration
- `/pages/_app.js` - Global app wrapper with Layout and Google Analytics

### Data Layer
- **Local Static Data**: Blog posts stored in `.docs/posts.json` (single JSON file)
- **Images**: All blog images stored in `.docs/images/`
- **Data Fetching**: `lib/localData.js` provides functions to read local data
- **Static Generation**: Uses Next.js `getStaticProps` and `getStaticPaths` with ISR (revalidate: 30)

### Content Structure
Blog posts contain:
- `title`, `slug`, `date`, `authorName`
- `heroImage` - Featured image reference
- `blurbContent`, `sidebarContent`, `postContent` - Rich text content (Contentful rich text format)
- Embedded content types: `codeBlock`, `videoEmbed`

### Rich Text Rendering
- Uses `@contentful/rich-text-react-renderer` to render rich text from local data
- Custom renderers in `components/PostContent.js` handle:
  - Embedded code blocks → `<pre><code>`
  - Embedded videos → `<iframe>`
  - Embedded assets/images → `<img>` with local paths
  - Internal post links → `/posts/[slug]`

### Styling
- SCSS with modular architecture
- Entry point: `styles/style.scss` (imported in `_app.js`)
- Settings files: `settings.variables.scss`, `settings.fonts.scss`, etc.
- Component styles: `module.*.scss`
- Page styles: `page.*.scss`

### Components
- `Layout.js` - Header/footer wrapper
- `PostCard.js` - Blog post card for listings
- `PostContent.js` - Detailed post content renderer

## Environment Variables

```
NEXT_PUBLIC_GA_ID    # Google Analytics ID (client-side)
URLSCAN_API_KEY      # API key for urlscan.io service
```

## Key Technologies

- Next.js 15 (Pages Router)
- React 18
- SCSS for styling
- Axios for HTTP requests
- Contentful rich text renderer (for local rich text data)

## Important Notes

- Images use Next.js `Image` component for optimization
- The `.docs/` directory is gitignored (contains local blog data)
- Migration script: `scripts/migrate-from-contentful.js` (one-time use)
- No TypeScript, no testing framework, no ESLint configured
