import type { Metadata } from "next";
import AdminClient from "./client";

export const metadata: Metadata = {
  title: "Admin — professionals",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminProfessionalsPage() {
  return <AdminClient />;
}
