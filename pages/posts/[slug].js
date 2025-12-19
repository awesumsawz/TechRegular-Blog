import PostContent from '../../components/PostContent'
import { getAllPostSlugs, getPostBySlug } from '../../lib/localData'

export const getStaticPaths = async () => {
  const slugs = getAllPostSlugs()

  const paths = slugs.map(slug => {
    return {
      params: {
        slug
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug)

  return {
    props: { post },
    revalidate: 30
  }
}

export default function Post({ post }) {
  return (
    <div>
      <PostContent post={post} />
    </div>
  )
}