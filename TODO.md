# Future Project Objectives

- Caching

- Contact Form

- Simplify the posts.json file
As it stands, the posts.json file is a copy of what is up on contentful. This is excellent for the cutover. However, when creating new posts, this is a nightmare of complexity. I'd like to simplify the file so that adding new content is easier.

- Retain header slide on homepage but figure out how to do it more organically
This current solution to the movement of the header element from the center of the homepage to the top of the child pages causes lighthouse to rate it poorly as it thinks it's an improperly sized element. I'd like to implement a solution that retains the movement but in a less brute force way. I've heard of solutions that add motion automagically between a start and end point and that might fix it?