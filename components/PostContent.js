import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { getImageProps } from 'next/image'
import { FormatDate } from '../utils/FormatDate'

import Image from 'next/image'


const renderOptions = {
	renderNode: {
	  [INLINES.EMBEDDED_ENTRY]: (node, children) => {
			// target the contentType of the EMBEDDED_ENTRY to display as you need
			if (node.data.target.sys.contentType.sys.id === "blogPost") {
				return (
					<a href={`/blog/${node.data.target.fields.slug}`}>            {node.data.target.fields.title}
					</a>
				);
			}
	  },
	  
		[BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
			// target the contentType of the EMBEDDED_ENTRY to display as you need
			if (node.data.target.sys.contentType.sys.id === "codeBlock") {
				return (
					<pre>
						<code>{node.data.target.fields.code}</code>
					</pre>
				);
			}
			if (node.data.target.sys.contentType.sys.id === "videoEmbed") {
				return (
					<iframe
						src={node.data.target.fields.embedUrl}
						height="100%"
						width="100%"
						frameBorder="0"
						scrolling="no"
						title={node.data.target.fields.title}
						allowFullScreen={true}
					/>
				);
			}
	  },
  
	  [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
			// render the EMBEDDED_ASSET as you need
			return (
				<img
				src={`https://${node.data.target.fields.file.url}`}
				height={node.data.target.fields.file.details.image.height}
				width={node.data.target.fields.file.details.image.width}
				alt={node.data.target.fields.description}
				/>
			);
	  },
	},
};




export default function PostContent({ post }) {
	const { title, date, authorName, heroImage, postContent } = post.fields

	const style = {
		backgroundImage: `url(https:${heroImage.fields.file.url})`,
	}

	return (
		<div className="postContent">
			<div className="featured backgroundImage" style={style}>
				<div className="backgroundImage__overlay"></div>
				<div className="info backgroundImage__content">
					<h2>{title}</h2>
					<p className="byLine">By { authorName } <br/><span>{ FormatDate( date ) }</span></p>
				</div>
			</div>
			<div className="contentWrapper">
				<div>{ documentToReactComponents( postContent, renderOptions ) }</div>
			</div>
		</div>
	)
}