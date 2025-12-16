import { validateRequest } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/db";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Search,
  MoreVertical,
  Download,
  Filter,
  Lock,
  LayoutDashboard,
  LogOut,
  UserCog,
} from "lucide-react";

export default async function AdminDashboard() {
  // 1. Get current user & Security Check
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  // 2. Fetch Data
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Stats
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;
  const newUsersToday = allUsers.filter((u) => {
    const today = new Date();
    const userDate = new Date(u.createdAt);
    return userDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-red-500/30">
      {/* --- ADMIN SIDEBAR (Red Theme) --- */}
      <aside className="w-64 fixed h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg shadow-lg shadow-red-900/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Admin Core
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20"
          >
            <Users className="w-4 h-4" />
            User Management
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white">System Admin</p>
              <p className="text-[10px] text-red-400">Elevated Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              User Database
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-normal border border-slate-700">
                Live
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Monitor user activity and manage permissions.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-900/20 transition-colors">
              <UserCog className="w-4 h-4" />
              Add Admin
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AdminStatCard label="Total Users" value={totalUsers} icon={Users} />
          <AdminStatCard
            label="Administrators"
            value={adminCount}
            icon={ShieldAlert}
            highlight
          />
          <AdminStatCard
            label="New Signups (24h)"
            value={newUsersToday}
            icon={Search}
          />
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex justify-between items-center mb-6 bg-slate-900/30 p-2 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by email or ID..."
              className="bg-transparent text-sm w-full pl-10 pr-4 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-medium">User Identity</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {allUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {u.email}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {u.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Lock className="w-3 h-3" />
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {allUsers.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50">
                Prev
              </button>
              <button className="px-3 py-1 rounded border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple Stat Component
function AdminStatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between group hover:border-slate-700 transition-all">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
        <p
          className={`text-3xl font-bold ${
            highlight ? "text-red-500" : "text-white"
          }`}
        >
          {value}
        </p>
      </div>
      <div
        className={`p-3 rounded-xl border ${
          highlight
            ? "bg-red-500/10 border-red-500/20 text-red-500"
            : "bg-slate-800 border-slate-700 text-slate-400"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
