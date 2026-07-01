// Server component wrapper — provides Suspense boundary for useSearchParams in client.tsx
import { Suspense } from "react";
import Dashboard2Client from "./client";

export default function Dashboard2Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard2Client />
    </Suspense>
  );
}
