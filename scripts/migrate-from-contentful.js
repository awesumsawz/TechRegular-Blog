/**
 * One-time migration script to pull all blog posts and images from Contentful
 * and save them as local static data in the .docs directory.
 *
 * Usage: node scripts/migrate-from-contentful.js
 */

const contentful = require('contentful');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const DOCS_DIR = path.join(__dirname, '..', '.docs');
const IMAGES_DIR = path.join(DOCS_DIR, 'images');
const POSTS_FILE = path.join(DOCS_DIR, 'posts.json');

// Initialize Contentful client
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  space: process.env.CONTENTFUL_SPACE_ID,
});

/**
 * Download an image from a URL to a local path
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Ensure URL has https protocol
    const fullUrl = url.startsWith('//') ? `https:${url}` : url;

    const file = fs.createWriteStream(filepath);
    https.get(fullUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Extract a clean filename from a Contentful asset
 */
function getAssetFilename(asset, index) {
  const assetId = asset.sys.id;
  const fileUrl = asset.fields.file.url;
  const extension = path.extname(fileUrl.split('?')[0]); // Remove query params
  return `${assetId}${extension}`;
}

/**
 * Process rich text content to find all embedded assets
 */
function extractAssetsFromRichText(richTextContent, allAssets) {
  if (!richTextContent || !richTextContent.content) return;

  for (const node of richTextContent.content) {
    // Check for embedded assets
    if (node.nodeType === 'embedded-asset-block' && node.data && node.data.target) {
      allAssets.add(node.data.target.sys.id);
    }

    // Recursively check nested content
    if (node.content) {
      extractAssetsFromRichText(node, allAssets);
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('Starting Contentful migration...\n');

  // Create directories if they don't exist
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  try {
    // Fetch all blog posts
    console.log('Fetching blog posts from Contentful...');
    const response = await client.getEntries({
      content_type: 'blogPost',
      include: 10 // Include all linked entries and assets
    });

    console.log(`Found ${response.items.length} blog posts\n`);

    // Build a map of all assets
    const assetMap = new Map();
    if (response.includes && response.includes.Asset) {
      response.includes.Asset.forEach(asset => {
        assetMap.set(asset.sys.id, asset);
      });
    }

    // Track which assets we need to download
    const assetsToDownload = new Set();

    // Process each blog post
    const posts = response.items.map(item => {
      const post = {
        id: item.sys.id,
        createdAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt,
        fields: {
          title: item.fields.title,
          slug: item.fields.slug,
          date: item.fields.date,
          authorName: item.fields.authorName,
          blurbContent: item.fields.blurbContent,
          sidebarContent: item.fields.sidebarContent,
          postContent: item.fields.postContent,
        }
      };

      // Handle hero image
      if (item.fields.heroImage) {
        const heroAsset = item.fields.heroImage;
        assetsToDownload.add(heroAsset.sys.id);
        post.fields.heroImage = {
          sys: { id: heroAsset.sys.id },
          fields: {
            title: heroAsset.fields.title,
            description: heroAsset.fields.description,
            file: {
              url: heroAsset.fields.file.url,
              details: heroAsset.fields.file.details,
              fileName: getAssetFilename(heroAsset),
              contentType: heroAsset.fields.file.contentType,
            }
          }
        };
      }

      // Extract embedded assets from rich text fields
      extractAssetsFromRichText(post.fields.blurbContent, assetsToDownload);
      extractAssetsFromRichText(post.fields.sidebarContent, assetsToDownload);
      extractAssetsFromRichText(post.fields.postContent, assetsToDownload);

      return post;
    });

    // Download all images
    console.log(`\nDownloading ${assetsToDownload.size} images...`);
    let downloadCount = 0;

    for (const assetId of assetsToDownload) {
      const asset = assetMap.get(assetId);
      if (asset && asset.fields.file) {
        const filename = getAssetFilename(asset);
        const filepath = path.join(IMAGES_DIR, filename);

        try {
          await downloadImage(asset.fields.file.url, filepath);
          downloadCount++;
        } catch (error) {
          console.error(`Failed to download ${filename}:`, error.message);
        }
      }
    }

    console.log(`\nSuccessfully downloaded ${downloadCount} images\n`);

    // Update embedded asset references in rich text to use local paths
    function updateRichTextAssetPaths(richTextContent) {
      if (!richTextContent || !richTextContent.content) return richTextContent;

      for (const node of richTextContent.content) {
        if (node.nodeType === 'embedded-asset-block' && node.data && node.data.target) {
          const asset = assetMap.get(node.data.target.sys.id);
          if (asset) {
            node.data.target = {
              sys: { id: asset.sys.id },
              fields: {
                title: asset.fields.title,
                description: asset.fields.description,
                file: {
                  url: asset.fields.file.url,
                  details: asset.fields.file.details,
                  fileName: getAssetFilename(asset),
                  contentType: asset.fields.file.contentType,
                }
              }
            };
          }
        }

        if (node.content) {
          updateRichTextAssetPaths(node);
        }
      }

      return richTextContent;
    }

    // Update all posts with local asset paths
    posts.forEach(post => {
      if (post.fields.blurbContent) {
        updateRichTextAssetPaths(post.fields.blurbContent);
      }
      if (post.fields.sidebarContent) {
        updateRichTextAssetPaths(post.fields.sidebarContent);
      }
      if (post.fields.postContent) {
        updateRichTextAssetPaths(post.fields.postContent);
      }
    });

    // Also include embedded entries (code blocks, video embeds, etc.)
    const embeddedEntries = [];
    if (response.includes && response.includes.Entry) {
      response.includes.Entry.forEach(entry => {
        embeddedEntries.push({
          id: entry.sys.id,
          contentType: entry.sys.contentType.sys.id,
          fields: entry.fields
        });
      });
    }

    // Save posts to JSON file
    const data = {
      posts,
      embeddedEntries,
      migratedAt: new Date().toISOString(),
      source: 'contentful',
      spaceId: process.env.CONTENTFUL_SPACE_ID
    };

    fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));
    console.log(`Saved ${posts.length} posts to ${POSTS_FILE}\n`);

    console.log('Migration complete!');
    console.log(`\nSummary:`);
    console.log(`- Posts: ${posts.length}`);
    console.log(`- Images: ${downloadCount}`);
    console.log(`- Embedded entries: ${embeddedEntries.length}`);
    console.log(`\nData location: ${DOCS_DIR}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
