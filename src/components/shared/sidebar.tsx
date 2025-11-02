import { Link } from "@tanstack/react-router";
import {
	Calendar,
	ChevronUp,
	Heart,
	Home,
	LogOut,
	Package,
	PawPrint,
	Settings,
	Shield,
	ShoppingBag,
	Stethoscope,
	User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
	// Mock data - replace with actual auth state
	const isLoggedIn = false;
	const userRole = "customer"; // customer, admin, vet
	const userName = "John Doe";
	const userEmail = "john@example.com";

	// Customer navigation items
	const customerItems = [
		{ title: "Shop", url: "/", icon: Home },
		{ title: "My Orders", url: "/orders", icon: Package },
		{ title: "My Pets", url: "/pets", icon: Heart },
		{ title: "Appointments", url: "/appointments", icon: Calendar },
		{ title: "Adoption Corner", url: "/adoption", icon: PawPrint },
	];

	// Admin navigation items
	const adminItems = [
		{ title: "Dashboard", url: "/admin/dashboard", icon: Shield },
		{ title: "Products", url: "/admin/products", icon: ShoppingBag },
		{ title: "Orders", url: "/admin/orders", icon: Package },
		{ title: "Users", url: "/admin/users", icon: User },
		{ title: "Appointments", url: "/admin/appointments", icon: Calendar },
	];

	// Vet navigation items
	const vetItems = [
		{ title: "Dashboard", url: "/vet/dashboard", icon: Stethoscope },
		{ title: "Appointments", url: "/vet/appointments", icon: Calendar },
		{ title: "Patients", url: "/vet/patients", icon: Heart },
		{ title: "Schedule", url: "/vet/schedule", icon: Calendar },
	];

	const getRoleIcon = () => {
		switch (userRole) {
			case "admin":
				return <Shield className="h-4 w-4" />;
			case "vet":
				return <Stethoscope className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	const getRoleColor = () => {
		switch (userRole) {
			case "admin":
				return "destructive";
			case "vet":
				return "default";
			default:
				return "secondary";
		}
	};

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<span className="font-bold">PC</span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">PetCare</span>
									<span className="truncate text-xs text-muted-foreground">
										Pet Care & E-commerce
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{customerItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
											{item.badge && (
												<Badge variant="secondary" className="ml-auto">
													{item.badge}
												</Badge>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Admin Section */}
				{userRole === "admin" && (
					<SidebarGroup>
						<SidebarGroupLabel>
							<Shield className="h-4 w-4 mr-2" />
							Admin Panel
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{adminItems.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{/* Vet Section */}
				{userRole === "vet" && (
					<>
						<SidebarGroup>
							<SidebarGroupLabel>
								<Stethoscope className="h-4 w-4 mr-2" />
								Vet Portal
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{vetItems.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link to={item.url}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<SidebarSeparator />
					</>
				)}

				{/* Settings Section */}
				{isLoggedIn && (
					<SidebarGroup>
						<SidebarGroupLabel>Settings</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link to="/profile">
											<Settings />
											<span>Profile Settings</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						{isLoggedIn ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={`https://avatar.vercel.sh/${userName}.png`}
												alt={userName}
											/>
											<AvatarFallback className="rounded-lg">
												{userName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">{userName}</span>
											<span className="truncate text-xs text-muted-foreground">
												{userEmail}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={getRoleColor()} className="text-xs">
												{getRoleIcon()}
												<span className="ml-1">{userRole}</span>
											</Badge>
											<ChevronUp className="ml-auto size-4" />
										</div>
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
									side="bottom"
									align="end"
									sideOffset={4}
								>
									<DropdownMenuItem asChild>
										<Link to="/profile">
											<User className="h-4 w-4 mr-2" />
											Account Settings
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/orders">
											<Package className="h-4 w-4 mr-2" />
											Order History
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => {
											// Handle logout logic here
											console.log("Logout clicked");
										}}
									>
										<LogOut className="h-4 w-4 mr-2" />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							// <div className="space-y-2 p-2">
							// 	<Button asChild className="w-full" size="sm">
							// 		<Link to="/auth/login">Login</Link>
							// 	</Button>
							// 	<Button variant="outline" asChild className="w-full" size="sm">
							// 		<Link to="/auth/register">Sign Up</Link>
							// 	</Button>
							// </div>
							<></>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
