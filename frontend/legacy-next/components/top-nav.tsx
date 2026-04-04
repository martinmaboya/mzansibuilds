export function TopNav() {
  return (
    <header className="border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="container-width flex items-center justify-between py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-forest-300">MzansiBuilds</p>
          <p className="text-xs text-neutral-400">Derivco Code Skills Quest</p>
        </div>
        <nav className="hidden gap-4 text-sm text-neutral-300 lg:flex">
          <a href="#auth" className="transition-colors hover:text-forest-300">Auth</a>
          <a href="#create" className="transition-colors hover:text-forest-300">Create</a>
          <a href="#feed" className="transition-colors hover:text-forest-300">Feed</a>
          <a href="#celebration" className="transition-colors hover:text-forest-300">Wall</a>
        </nav>
        <nav className="flex gap-3 text-xs text-neutral-300 lg:hidden">
          <a href="#auth" className="transition-colors hover:text-forest-300">Auth</a>
          <a href="#feed" className="transition-colors hover:text-forest-300">Feed</a>
          <a href="#celebration" className="transition-colors hover:text-forest-300">Celebration</a>
        </nav>
      </div>
    </header>
  )
}
