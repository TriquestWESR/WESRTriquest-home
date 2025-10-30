export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">WESR Portal</h1>
        <p className="text-neutral-600">
          The admin console is live. Continue to the login page to access your dashboard.
        </p>
        <div>
          <a
            href="/login"
            className="inline-flex items-center rounded-2xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    </main>
  );
}
