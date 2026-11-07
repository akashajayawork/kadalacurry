import { ToastProvider } from "@/components/feedback";
import { AuthProvider } from "@/features/auth";
import { AdminConsolePage } from "@/features/console";
import { CreateRoomPage } from "@/features/create-room";
import { LandingPage } from "@/features/landing";

import { NotFoundPage } from "./NotFoundPage";
import { RoomPage } from "./RoomPage";
import { parseRoute, type Route } from "./router";

export default function App() {
  const route = parseRoute(window.location.pathname);

  return (
    <ToastProvider>
      <AuthProvider>
        <RouteView route={route} />
      </AuthProvider>
    </ToastProvider>
  );
}

function RouteView({ route }: { route: Route }) {
  switch (route.kind) {
    case "home":
      return <LandingPage />;
    case "admin":
      return <AdminConsolePage />;
    case "create":
      return <CreateRoomPage />;
    case "room":
      return <RoomPage roomId={route.roomId} />;
    case "not-found":
      return <NotFoundPage />;
  }
}
