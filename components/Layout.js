import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header>
        <Link legacyBehavior href="/">
          <a>
            <h1>
              <span>TechRegular</span>
            </h1>
            <h2>Tech on the Reg</h2>
          </a>
        </Link>
      </header>

      <div className="page-content">
        { children }
      </div>

      <footer>
        <p>Copyright 2024 TechRegular</p>
      </footer>
    </div>
  )
}