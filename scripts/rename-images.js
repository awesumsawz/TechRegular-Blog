const fs = require('fs');
const path = require('path');

// Read posts data
const data = JSON.parse(fs.readFileSync('.docs/posts.json', 'utf8'));
const postsData = data.posts;

// Create a mapping of old image names to new descriptive names
const imageMapping = {};
const usedNames = new Set();

postsData.forEach((post) => {
  const { title, slug, heroImage } = post.fields;

  if (heroImage && heroImage.fields?.file?.fileName) {
    const oldFileName = heroImage.fields.file.fileName;
    const extension = path.extname(oldFileName);

    // Create a descriptive name from the slug (already URL-safe)
    let newFileName = `${slug}${extension}`;

    // Handle duplicates (if same image used multiple times)
    if (usedNames.has(newFileName)) {
      let counter = 2;
      while (usedNames.has(`${slug}-${counter}${extension}`)) {
        counter++;
      }
      newFileName = `${slug}-${counter}${extension}`;
    }

    usedNames.add(newFileName);
    imageMapping[oldFileName] = {
      newName: newFileName,
      postTitle: title,
      slug: slug,
      isHero: true
    };
  }

  // Also check for embedded images in content
  const checkContent = (content) => {
    if (!content || !content.content) return;

    content.content.forEach((node) => {
      if (node.nodeType === 'embedded-asset-block' && node.data?.target) {
        const imageFileName = node.data.target.fields?.file?.fileName;
        if (imageFileName) {
          const oldFileName = imageFileName;
          const extension = path.extname(oldFileName);

          if (!imageMapping[oldFileName]) {
            let baseName = `${slug}-embedded`;
            let newFileName = `${baseName}${extension}`;
            let counter = 1;

            while (usedNames.has(newFileName)) {
              counter++;
              newFileName = `${baseName}-${counter}${extension}`;
            }

            usedNames.add(newFileName);
            imageMapping[oldFileName] = {
              newName: newFileName,
              postTitle: title,
              slug: slug,
              embedded: true
            };
          }
        }
      }

      if (node.content) {
        checkContent(node);
      }
    });
  };

  checkContent(post.fields.postContent);
  checkContent(post.fields.blurbContent);
  checkContent(post.fields.sidebarContent);
});

// Display the mapping
console.log('\n📸 Image Rename Mapping:\n');
console.log('Old Name → New Name (Post)\n');

Object.entries(imageMapping).forEach(([oldName, info]) => {
  const typeLabel = info.isHero ? ' [hero]' : (info.embedded ? ' [embedded]' : '');
  console.log(`${oldName} → ${info.newName}${typeLabel}`);
  console.log(`   Post: ${info.postTitle}`);
  console.log('');
});

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nDo you want to proceed with renaming? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    performRename(imageMapping);
  } else {
    console.log('Rename cancelled.');
  }
  rl.close();
});

function performRename(mapping) {
  console.log('\n🔄 Renaming images...\n');

  const docsDir = '.docs/images';
  const publicDir = 'public/images';

  // Rename in both directories
  Object.entries(mapping).forEach(([oldName, info]) => {
    const docsOldPath = path.join(docsDir, oldName);
    const docsNewPath = path.join(docsDir, info.newName);
    const publicOldPath = path.join(publicDir, oldName);
    const publicNewPath = path.join(publicDir, info.newName);

    // Rename in .docs/images
    if (fs.existsSync(docsOldPath)) {
      fs.renameSync(docsOldPath, docsNewPath);
      console.log(`✓ Renamed in .docs/images: ${oldName} → ${info.newName}`);
    }

    // Rename in public/images
    if (fs.existsSync(publicOldPath)) {
      fs.renameSync(publicOldPath, publicNewPath);
      console.log(`✓ Renamed in public/images: ${oldName} → ${info.newName}`);
    }
  });

  // Update posts.json with new image names
  console.log('\n📝 Updating posts.json...\n');

  postsData.forEach((post) => {
    // Update hero image
    if (post.fields.heroImage && post.fields.heroImage.fields?.file?.fileName) {
      const oldFileName = post.fields.heroImage.fields.file.fileName;
      if (mapping[oldFileName]) {
        post.fields.heroImage.fields.file.fileName = mapping[oldFileName].newName;
        // Also update the URL if it exists
        if (post.fields.heroImage.fields.file.url) {
          post.fields.heroImage.fields.file.url = post.fields.heroImage.fields.file.url.replace(
            oldFileName,
            mapping[oldFileName].newName
          );
        }
      }
    }

    // Update embedded images in content
    const updateContent = (content) => {
      if (!content || !content.content) return;

      content.content.forEach((node) => {
        if (node.nodeType === 'embedded-asset-block' && node.data?.target?.fields?.file?.fileName) {
          const oldFileName = node.data.target.fields.file.fileName;
          if (mapping[oldFileName]) {
            node.data.target.fields.file.fileName = mapping[oldFileName].newName;
            // Also update the URL if it exists
            if (node.data.target.fields.file.url) {
              node.data.target.fields.file.url = node.data.target.fields.file.url.replace(
                oldFileName,
                mapping[oldFileName].newName
              );
            }
          }
        }

        if (node.content) {
          updateContent(node);
        }
      });
    };

    updateContent(post.fields.postContent);
    updateContent(post.fields.blurbContent);
    updateContent(post.fields.sidebarContent);
  });

  // Write updated posts.json
  fs.writeFileSync('.docs/posts.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('✓ Updated posts.json with new image references\n');

  console.log('✅ All done! Images have been renamed and posts.json has been updated.\n');
}
