import { Outlet } from "react-router-dom";

/** Shell for the auth flow. The split-screen composition lands in Phase 2. */
export function AuthLayout() {
  return (
    <main className="h-full w-full overflow-y-auto">
      <Outlet />
    </main>
  );
}
