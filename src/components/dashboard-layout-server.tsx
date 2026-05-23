// components/layout/dashboard-layout-server.tsx
import { getCookie } from "@/context/cookie";
import DashboardLayout from "./dashboard-layout";

export type UserData = {
  nama: string;
  email: string;
  jabatan: string;
  departemen: string;
  role: string;
};

export default async function DashboardLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const raw = await getCookie("__vxu_meta-Us");
  let role = "";
  let userData: UserData = {
    nama: "",
    email: "",
    jabatan: "",
    departemen: "",
    role: "",
  };

  try {
    if (raw) {
      const parsed = JSON.parse(raw);
      role = parsed?.role ?? "";
      userData = {
        nama: parsed?.nama ?? "",
        email: parsed?.email ?? "",
        jabatan: parsed?.jabatan ?? "",
        departemen: parsed?.departemen ?? "",
        role: parsed?.role ?? "",
      };
    }
  } catch {}

  return (
    <DashboardLayout role={role} userData={userData}>
      {children}
    </DashboardLayout>
  );
}
