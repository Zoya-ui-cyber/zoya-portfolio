import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        ZOYA YIN
      </Link>

      <nav className="site-nav">
        <Link href="/">WORK</Link>
        <Link href="/about">ABOUT</Link>

        <button className="language-switch" type="button">
          中 / EN
        </button>
      </nav>
    </header>
  );
}