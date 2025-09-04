import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

const AdminPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    unauthorized();
  }
  return <AdminDashboard />;
};

export default AdminPage;
