import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/shared/navbar";
import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<SidebarProvider>
				<Toaster />
				<div className="flex min-h-screen w-full">
					<AppSidebar />
					<div className="flex-1 flex flex-col">
						<Navbar />
						<main className="flex-1">
							<Outlet />
						</main>
					</div>
				</div>
			</SidebarProvider>
		</>
	),
});
