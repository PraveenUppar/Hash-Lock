import { validateRequest } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Check session on the server
  const { user } = await validateRequest();

  // 2. Redirect if not logged in
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome back, {user.email}</h1>
      <p>Role: {user.role}</p>

      {/* We can do a form submission for logout here */}
      <form action="/api/auth/logout" method="POST">
        <button type="submit" className="text-red-500 underline">
          Sign Out
        </button>
      </form>
    </div>
  );
}
