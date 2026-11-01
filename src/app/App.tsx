import { ToastProvider } from "@/components/feedback";
import { AuthGate, AuthProvider } from "@/features/auth";

import { AppShell } from "./AppShell";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGate>
          <AppShell />
        </AuthGate>
      </AuthProvider>
    </ToastProvider>
  );
}
