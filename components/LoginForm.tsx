"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

interface Props {
  redirectUrl?: string;
}

const LoginForm = ({ redirectUrl = "/" }: Props) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;

    if (session.user.role === "USER") {
      router.push(redirectUrl);
    }
  }, [status, session, router, redirectUrl]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-8">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    const res = await signIn("user-credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push(redirectUrl);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: redirectUrl });
    } catch (err) {
      console.error(err);
      setError("Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-indigo-100 to-purple-100">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome
        </h2>

        <p className="text-center text-gray-500 mb-4">
          Sign in to continue to your account
        </p>

{session?.user?.role && session.user.role !== "USER" && (
          <div className="text-amber-600 text-sm text-center mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p>Staff account detected ({session.user.role}). Please use:</p>
            <ul className="mt-1 text-xs list-disc list-inside">
              <li>ADMIN: /adminlogin</li>
              <li>DOCTOR: /doctorlogin</li>
            </ul>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleManualLogin} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading || (session?.user?.role && session.user.role !== "USER")}
          className="w-full py-3 border rounded-lg flex justify-center items-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title={session?.user?.role && session.user.role !== "USER" ? "Google login for USER accounts only" : ""}
        >
          <FontAwesomeIcon icon={faGoogle} />
          <span className="ml-2">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>

        <p className="text-center mt-6 text-gray-500">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;