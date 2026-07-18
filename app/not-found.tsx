import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          ScholarFlow
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The workspace page you requested is unavailable.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-white transition hover:opacity-95"
        >
          Back to editor
        </Link>
      </section>
    </main>
  );
}
