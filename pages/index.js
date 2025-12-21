import PostCard from '../components/PostCard'
import { getAllPosts } from '../lib/localData'

export async function getStaticProps() {
  const posts = getAllPosts()

  const sortedPosts = posts.sort((a, b) => {
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
  return (
    <div className="posts-list grid three-wide">
      {posts.map(post => (
        <PostCard key={post.id || post.fields.slug} post={post} />
      ))}
    </div>
  )
}