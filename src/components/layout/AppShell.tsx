import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layout/Sidebar";

/** The frame every signed-in screen renders inside. */
const AppShell = () => (
  <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppShell;
