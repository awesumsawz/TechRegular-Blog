import { createClient } from 'contentful'
import PostCard from '../components/PostCard'

export async function getStaticProps() {
  const client = createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
    space: process.env.CONTENTFUL_SPACE_ID,
  })

  const res = await client.getEntries({ content_type: 'blogPost'})

  const sortedPosts = res.items.sort((a, b) => {
    const dateA = new Date(a.fields.date)
    const dateB = new Date(b.fields.date)
    return dateB - dateA
  })

  return {
    props: { posts: sortedPosts },
    revalidate: 30
  }
}

export default function Posts({ posts }) {
  console.log(posts);

  return (
    <div className="posts-list grid three-wide">
      {posts.map(post => (
        <PostCard key={post.sys.id} post={post} />
      ))}
    </div>
  )
}