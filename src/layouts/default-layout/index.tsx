import { AppSidebar } from "@/components/screens-component/layouts/app-side-bar";
import { Topbar } from "@/components/screens-component/layouts/topbar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";


function DefaultLayout() {
  return (
     <SidebarProvider defaultOpen={false}>
      {/* Full app shell */}
      <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Sticky header */}
          <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-5" />

            {/* Put your breadcrumb/title/actions here */}
            <Topbar />
          </header>

          {/* Scrollable content only */}
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>  
    );
}

export default DefaultLayout;
