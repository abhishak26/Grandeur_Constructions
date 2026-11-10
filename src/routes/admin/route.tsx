import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/shell";
import { getAdminGate } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const gate = await getAdminGate();
    const onLogin = location.pathname === "/admin/login";
    if (!gate.admin && !onLogin) throw redirect({ to: "/admin/login" });
    if (gate.admin && onLogin) throw redirect({ to: "/admin" });
  },
  loader: () => getAdminGate(),
  component: AdminLayout,
});

function AdminLayout() {
  const gate = Route.useLoaderData();
  const path = useRouterState({ select: (state) => state.location.pathname });
  if (path === "/admin/login") return <Outlet />;
  return (
    <AdminShell name={gate.admin?.name ?? "Administrator"}>
      <Outlet />
    </AdminShell>
  );
}
