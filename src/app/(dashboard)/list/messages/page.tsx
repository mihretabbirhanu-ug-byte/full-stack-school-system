import { requireSession } from "@/lib/auth/server";

export default async function MessagesPage() {
  await requireSession();
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold">Messages</h1>
      <p className="text-sm text-gray-500 mt-2">
        Not implemented yet.
      </p>
    </div>
  );
}

