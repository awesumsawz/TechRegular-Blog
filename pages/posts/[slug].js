import { createClient } from 'contentful'
import PostContent from '../../components/PostContent'

const client = createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  space: process.env.CONTENTFUL_SPACE_ID,
})

export const getStaticPaths = async () => {
  const res = await client.getEntries({ 
    content_type: 'blogPost'
  })

  const paths = res.items.map(item => {
    return {
      params: { 
        slug: item.fields.slug 
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const res = await client.getEntries({ 
    content_type: 'blogPost', 
    'fields.slug': params.slug
  })
  return {
    props: { post: res.items[0] },
    revalidate: 1 /* TODO: Update to 30 before deploy */
  }
}

export default function Post({ post }) {
  console.log(post)
  return (
    <div>
      <PostContent post={post} />
    </div>
  )
}