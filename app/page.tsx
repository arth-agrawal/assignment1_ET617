export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">LearnTracker</h1>
      <p className="mt-2">Sign up, then log in to the dashboard.</p>
      <div className="mt-4 flex gap-4">
        <a className="underline" href="/signup">Sign up</a>
        <a className="underline" href="/login">Log in</a>
      </div>
    </main>
  );
}