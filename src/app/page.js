import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome to Just Go
      </h1>
      <div className="flex gap-4">
        <Link href="/auth/login" legacyBehavior>
          <a className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Login
          </a>
        </Link>
        <Link href="/auth/signup" legacyBehavior>
          <a className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
            Sign Up
          </a>
        </Link>
      </div>
    </main>
  );
}
