import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-400">This page doesn&apos;t exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-400"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
