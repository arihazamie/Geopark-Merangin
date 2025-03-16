import { getSession } from "@/lib/authRoute";
import DashboardAdmin from "@/components/admin/dashboard";

export default async function AdminDashboard() {
  const session = await getSession({
    allowedRoles: ["ADMIN"],
    redirectTo: "/",
  });

  return (
    <>
      <DashboardAdmin />
    </>
  );
}
