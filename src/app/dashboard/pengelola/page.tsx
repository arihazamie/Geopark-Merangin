import { getSession } from "@/lib/authRoute";
import PengelolaDashboard from "@/components/Pengelola/dashboard";

export default async function Pengelola() {
  const session = await getSession({
    allowedRoles: ["PENGELOLA"],
    redirectTo: "/",
  });
  return <PengelolaDashboard />;
}
