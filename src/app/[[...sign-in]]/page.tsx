"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Username or email
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <SignIn.Action
            submit
            className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
          >
            Continue
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step
          name="verifications"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-3 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400 text-sm">
            Continue as <span className="font-medium text-gray-600"><SignIn.SafeIdentifier /></span>
          </h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <SignIn.Strategy name="password">
            <Clerk.Field name="password" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-gray-500">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="p-2 rounded-md ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
            >
              Sign In
            </SignIn.Action>

            <div className="flex items-center justify-between text-xs">
              <SignIn.Action
                navigate="forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </SignIn.Action>
              <SignIn.Action
                navigate="choose-strategy"
                className="text-gray-500 hover:underline"
              >
                Use another method
              </SignIn.Action>
            </div>
          </SignIn.Strategy>

          <SignIn.Strategy name="email_code">
            <p className="text-xs text-gray-500">
              Enter the code sent to <span className="font-medium"><SignIn.SafeIdentifier /></span>.
            </p>
            <Clerk.Field name="code" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-gray-500">Code</Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="p-2 rounded-md ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
            >
              Continue
            </SignIn.Action>
            <div className="flex items-center justify-between text-xs">
              <SignIn.Action
                resend
                className="text-blue-600 hover:underline disabled:text-gray-400"
              >
                Resend
              </SignIn.Action>
              <SignIn.Action
                navigate="choose-strategy"
                className="text-gray-500 hover:underline"
              >
                Use another method
              </SignIn.Action>
            </div>
          </SignIn.Strategy>

          <SignIn.Strategy name="phone_code">
            <p className="text-xs text-gray-500">
              Enter the code sent to <span className="font-medium"><SignIn.SafeIdentifier /></span>.
            </p>
            <Clerk.Field name="code" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-gray-500">Code</Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="p-2 rounded-md ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
            >
              Continue
            </SignIn.Action>
            <div className="flex items-center justify-between text-xs">
              <SignIn.Action
                resend
                className="text-blue-600 hover:underline disabled:text-gray-400"
              >
                Resend
              </SignIn.Action>
              <SignIn.Action
                navigate="choose-strategy"
                className="text-gray-500 hover:underline"
              >
                Use another method
              </SignIn.Action>
            </div>
          </SignIn.Strategy>
        </SignIn.Step>

        <SignIn.Step
          name="choose-strategy"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-3 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Choose a sign-in method</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <div className="flex flex-col gap-2">
            <SignIn.SupportedStrategy
              name="password"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              Use password
            </SignIn.SupportedStrategy>
            <SignIn.SupportedStrategy
              name="email_code"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              Email code
            </SignIn.SupportedStrategy>
            <SignIn.SupportedStrategy
              name="phone_code"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              SMS code
            </SignIn.SupportedStrategy>
            <SignIn.SupportedStrategy
              name="passkey"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              Passkey
            </SignIn.SupportedStrategy>
          </div>

          <SignIn.Action navigate="previous" className="text-xs text-gray-500 hover:underline">
            Back
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step
          name="forgot-password"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-3 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Reset your password</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <p className="text-xs text-gray-500">
            Choose where you want to receive your reset code.
          </p>

          <div className="flex flex-col gap-2">
            <SignIn.SupportedStrategy
              name="reset_password_email_code"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              Email me a code
            </SignIn.SupportedStrategy>
            <SignIn.SupportedStrategy
              name="reset_password_phone_code"
              className="ring-1 ring-gray-300 rounded-md p-2 text-sm text-left hover:bg-gray-50"
            >
              Text me a code
            </SignIn.SupportedStrategy>
          </div>

          <SignIn.Action navigate="previous" className="text-xs text-gray-500 hover:underline">
            Back
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step
          name="reset-password"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-3 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Set a new password</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <Clerk.Field name="code" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">Code</Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              New password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <SignIn.Action
            submit
            className="bg-blue-500 text-white my-2 rounded-md text-sm p-[10px]"
          >
            Reset password
          </SignIn.Action>

          <SignIn.Action navigate="start" className="text-xs text-gray-500 hover:underline">
            Back to sign in
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step
          name="choose-session"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-3 w-[400px]"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Choose a session</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <SignIn.SessionList className="flex flex-col gap-2">
            <SignIn.SessionListItem className="ring-1 ring-gray-300 rounded-md p-2">
              {({ session }) => (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-gray-700 truncate">
                    {`${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() ||
                      session.identifier ||
                      session.id}
                  </div>
                  <SignIn.Action
                    setActiveSession
                    className="bg-blue-500 text-white rounded-md text-xs px-3 py-2"
                  >
                    Continue
                  </SignIn.Action>
                </div>
              )}
            </SignIn.SessionListItem>
          </SignIn.SessionList>

          <SignIn.Action navigate="start" className="text-xs text-gray-500 hover:underline">
            Use a different account
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
