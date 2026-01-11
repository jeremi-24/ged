'use client';
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminPanelLayout>
      <ProtectedRoute>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </ProtectedRoute>
    </AdminPanelLayout>
  );
}
