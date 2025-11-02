import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
	// Mock data - replace with actual state management
	const isLoggedIn = true;
	const userRole = "customer"; // customer, admin, vet

	return (
		<nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Left section - Logo and Sidebar Trigger */}
					<div className="flex items-center gap-4">
						<SidebarTrigger className="lg:hidden" />

						<Link to="/" className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-sm">
									PC
								</span>
							</div>
							<span className="hidden font-bold text-lg md:inline-block">
								PetCare
							</span>
						</Link>
					</div>

					{/* Center section - Search (hidden on mobile) */}
					<div className="hidden flex-1 max-w-md mx-8 md:flex">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search products, services..."
								className="pl-10 pr-4"
							/>
						</div>
					</div>

					{/* Right section - Actions */}
					<div className="flex items-center gap-2">
						{/* Search icon for mobile */}
						<Button variant="ghost" size="icon" className="md:hidden">
							<Search className="h-5 w-5" />
							<span className="sr-only">Search</span>
						</Button>

						{/* Shopping Cart */}
						<Button variant="ghost" size="icon" className="relative">
							<Link to="/cart">
								<ShoppingCart className="h-5 w-5" />
								<span className="sr-only">Shopping cart</span>
							</Link>
						</Button>

						{/* User Menu - Desktop only (mobile handled by sidebar) */}
						{isLoggedIn ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="hidden md:flex">
									<Button variant="ghost" size="icon">
										<User className="h-5 w-5" />
										<span className="sr-only">User menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem asChild>
										<Link to="/orders">My Orders</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/pets">My Pets</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/appointments">Appointments</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									{userRole === "admin" && (
										<>
											<DropdownMenuItem asChild>
												<Link to="/admin/dashboard">Admin Panel</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}
									{userRole === "vet" && (
										<>
											<DropdownMenuItem asChild>
												<Link to="/vet/dashboard">Vet Portal</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}
									<DropdownMenuItem>Logout</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="hidden md:flex items-center gap-2">
								<Button variant="ghost" size="sm" asChild>
									<Link to="/auth/login">Login</Link>
								</Button>
								<Button size="sm" asChild>
									<Link to="/auth/register">Sign Up</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
