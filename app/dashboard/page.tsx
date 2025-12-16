import { validateRequest } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import MobileNav from "@/app/components/MobileNav"; // <--- Import the new component
import {
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Lock,
  Mail,
  Fingerprint,
  Shield,
  Activity,
} from "lucide-react";

export default async function DashboardPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="w-64 fixed h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Hash Lock</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Overview"
            active
          />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">
                {user.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      {/* Added md:ml-64 to push content on desktop, but full width on mobile */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Top Header Area */}
        <header className="flex items-center gap-4 mb-8">
          {/* 1. INSERT MOBILE NAV HERE */}
          <MobileNav user={user} />

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Welcome back to your secure vault.
            </p>
          </div>
        </header>

        {/* --- RBAC SECTION: ADMIN ONLY --- */}
        {isAdmin && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 bg-red-500/10 w-40 h-40 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/20 h-fit">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Admin Console Access
                  </h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                    You have elevated privileges. Access the user management
                    system.
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                className="whitespace-nowrap bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
              >
                Enter Admin Panel
                <ShieldAlert className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* --- USER IDENTITY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Email */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4 hover:border-blue-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Mail className="w-6 h-6" />
            </div>
            <div className="overflow-hidden w-full">
              <p className="text-sm font-medium text-slate-400">
                Email Identity
              </p>
              <p
                className="text-lg font-bold text-white mt-1 truncate"
                title={user.email}
              >
                {user.email}
              </p>
              <div className="mt-2 text-xs text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Active Session
              </div>
            </div>
          </div>

          {/* Card 2: Role */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4 hover:border-purple-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Account Role</p>
              <p className="text-lg font-bold text-white mt-1 uppercase tracking-wider">
                {user.role}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {isAdmin ? "Full System Access" : "Standard Permissions"}
              </p>
            </div>
          </div>

          {/* Card 3: User ID */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="w-full overflow-hidden">
              <p className="text-sm font-medium text-slate-400">System ID</p>
              <p
                className="text-sm font-mono text-white mt-1 truncate w-full opacity-80"
                title={user.id}
              >
                {user.id}
              </p>
              <p className="mt-2 text-xs text-slate-500">Unique Identifier</p>
            </div>
          </div>
        </div>

        {/* Activity Placeholder */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-white font-medium text-lg">No Recent Activity</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-2">
            Your secure logs will appear here once you start performing actions
            within the system.
          </p>
        </div>
      </main>
    </div>
  );
}

// Keep the NavItem component for the server-side sidebar
function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
