# Blog for Tech Regular

## How to get 'er running
pull down the repo
```
git clone https://github.com/awesumsawz/TechRegular-Blog.git
```
Navigate to the root of the project (relative to where you ran the ```git clone``` command)
```
cd TechRegular-Blog
```
Build out the .env.local file with the two contentful variables ```CONTENTFUL_SPACE_ID``` & ```CONTENTFUL_ACCESS_KEY```

Then install the dependencies and spin up the site
```
npm install
npm run dev
```

## Current Issue(s):
- The root blog post list is clickable and opens the correct URL w/ slug attached. However, the content on the page is coming from JUST the most recently published post. I need to figure out how to get the content from other post as well. 