# Blog for Tech Regular

## How to get 'er running

Pull down the repo:

```bash
git clone https://github.com/awesumsawz/TechRegular-Blog.git
```

Navigate to the root of the project:
```bash
cd TechRegular-Blog
```

Install dependencies and run the development server:
```bash
bun install
bun run dev
```

## Data Management

This blog now uses **local static data** instead of Contentful CMS.

### Data Location
- Blog posts: `.docs/posts.json` (gitignored)
- Images: `.docs/images/` (gitignored, copied to `public/images/`)

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_GA_ID=your-google-analytics-id
URLSCAN_API_KEY=your-urlscan-api-key
```

**Note:** Contentful credentials are no longer required for running the site. They're only needed if you want to re-run the migration script.

### Migration from Contentful (Already Completed)

The blog content was migrated from Contentful using the one-time migration script:

```bash
# Only run this if you need to pull fresh data from Contentful
bun scripts/migrate-from-contentful.js
```

This script requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_KEY` in your `.env.local` file.
