/**
 * Local data fetching layer
 * Provides functions to read blog posts from local static data
 */

import postsData from '../.docs/posts.json';

/**
 * Get all blog posts
 * @returns {Array} Array of blog post objects
 */
export function getAllPosts() {
  return postsData.posts || [];
}

/**
 * Get a single blog post by slug
 * @param {string} slug - The post slug
 * @returns {Object|null} The blog post object or null if not found
 */
export function getPostBySlug(slug) {
  const posts = postsData.posts || [];
  return posts.find(post => post.fields.slug === slug) || null;
}

/**
 * Get all post slugs (for static path generation)
 * @returns {Array} Array of slug strings
 */
export function getAllPostSlugs() {
  const posts = postsData.posts || [];
  return posts.map(post => post.fields.slug);
}

/**
 * Get embedded entry by ID
 * @param {string} id - The entry ID
 * @returns {Object|null} The embedded entry or null if not found
 */
export function getEmbeddedEntry(id) {
  const entries = postsData.embeddedEntries || [];
  return entries.find(entry => entry.id === id) || null;
}

/**
 * Get local image path for an asset
 * @param {Object} asset - The asset object from post data
 * @returns {string} Local image path
 */
export function getLocalImagePath(asset) {
  if (!asset || !asset.fields || !asset.fields.file) {
    return '';
  }
  return `/images/${asset.fields.file.fileName}`;
}

/**
 * Get local image URL (for Next.js Image component)
 * @param {Object} asset - The asset object from post data
 * @returns {string} Local image URL
 */
export function getLocalImageUrl(asset) {
  return getLocalImagePath(asset);
}
