import Image from "next/image";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getSession, setSessionCookie } from "@/lib/auth/server";

async function signInAction(formData: FormData) {
  "use server";

  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    redirect("/sign-in?error=missing");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (
    !user ||
    !verifyPassword({
      password,
      salt: user.passwordSalt,
      hash: user.passwordHash,
    })
  ) {
    redirect("/sign-in?error=invalid");
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role,
    username: user.username,
  });

  redirect(`/${user.role}`);
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getSession();
  if (session) redirect(`/${session.role}`);

  const error = searchParams.error;
  const errorMessage =
    error === "missing"
      ? "Please enter your username/email and password."
      : error === "invalid"
        ? "Invalid username/email or password."
        : null;

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <div className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 w-[400px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Sign in to your account</h2>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md p-2">
            {errorMessage}
          </p>
        )}

        <form action={signInAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500" htmlFor="identifier">
              Username or email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

