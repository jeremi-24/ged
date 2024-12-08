import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelLayout>
    <ProtectedRoute>
    {children}
    </ProtectedRoute>
    </AdminPanelLayout>;
}
