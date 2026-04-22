import { requireSession } from "@/lib/auth/server";

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold">Profile</h1>
      <p className="text-sm text-gray-500 mt-2">
        Signed in as <span className="font-medium">{session.username}</span> (
        {session.role})
      </p>
    </div>
  );
}

