import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-ink/10">
      <div className="container-narrow flex items-center justify-between py-5">
        <Link
          href="/"
          className="font-serif text-2xl tracking-tightish text-ink"
          aria-label="Clinksy home"
        >
          Clinksy
        </Link>

        <nav className="flex items-center gap-5 text-[15px] sm:gap-7">
          <Link href="/blog" className="text-ink/70 transition-colors hover:text-ink">
            Blog
          </Link>
          <Link href="/guides" className="text-ink/70 transition-colors hover:text-ink">
            Guides
          </Link>
          <Link href="/dashboard" className="text-ink/70 transition-colors hover:text-ink">
            Dashboard
          </Link>
<Link href="/advisor-portal" className="text-ink/70 transition-colors hover:text-ink">
            Advisors
          </Link>
          <Link href="/start" className="btn-solid">
            See my next steps
          </Link>
        </nav>
      </div>
    </header>
  );
}
