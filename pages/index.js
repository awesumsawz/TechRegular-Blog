import { createClient } from 'contentful'
import PostCard from '../components/PostCard'

export async function getStaticProps() {
  const client = createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
    space: process.env.CONTENTFUL_SPACE_ID,
  })

  const res = await client.getEntries({ content_type: 'blogPost'})

  return {
    props: {
      posts: res.items
    }
  }

}

export default function Posts({ posts }) {
  console.log(posts);

  return (
    <div className="posts-list">
      {posts.map(post => (
        <PostCard key={post.sys.id} post={post} />
      ))}
    </div>
  )
}