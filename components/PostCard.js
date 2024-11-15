import { FormatDate } from '../utils/FormatDate'
import Link from 'next/link'
import Image from 'next/image'

export default function PostCard({ post }) {
	const { title, slug, date, authorName, heroImage } = post.fields

	return (
		<div className="card">
			<div className="featured">
				<Image 
					src={'https:' + heroImage.fields.file.url}
					width={heroImage.fields.file.details.image.width}
					height={heroImage.fields.file.details.image.height}
					alt={heroImage.fields.description}
				/>
			</div>
			<div className="content">
				<div className="info">
					<Link href={'/posts/' + slug}><h3>{title}</h3></Link>
					<p className="author">By {authorName}</p>
					<p className="date">Posted on {FormatDate(date)}</p>
				</div>
				<div className="actions">
					<Link className="button" href={'/posts/' + slug}>Read It</Link>
				</div>
			</div>
		</div>
	)
}