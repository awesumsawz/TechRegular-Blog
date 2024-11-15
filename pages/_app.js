import '../styles/style.scss'
import Script from 'next/script';
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {

  function formatDate(unformattedDate) {
		const date = new Date(unformattedDate)
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
		const day = String(date.getDate()).padStart(2, '0');
		const year = date.getFullYear();
		return `${month}-${day}-${year}`;	
	}

  return (
    <Layout>
			<Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_KEY}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS_KEY}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
