import { Button } from "@heroui/react";
import { LogIn } from "lucide-react";
import { Link } from "react-router";

export function Navbar() {
	return (
		<nav className="sticky top-0 z-50 border-gray-200 border-b bg-white">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
							<div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
								<div className="h-2.5 w-2.5 rounded-full bg-white" />
							</div>
						</div>
						<span className="font-bold text-gray-900 text-xl">Rentline</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden items-center gap-6 md:flex">
						<Link
							to="/#features"
							className="font-medium text-gray-700 text-sm transition-colors hover:text-primary"
						>
							Features
						</Link>
						<Link
							to="/#pricing"
							className="font-medium text-gray-700 text-sm transition-colors hover:text-primary"
						>
							Pricing
						</Link>
						<Link
							to="/#about"
							className="font-medium text-gray-700 text-sm transition-colors hover:text-primary"
						>
							About
						</Link>
					</div>

					{/* Auth Button */}
					<Button
						as={Link}
						to="/auth/login"
						color="primary"
						startContent={<LogIn className="h-4 w-4" />}
					>
						Sign In
					</Button>
				</div>
			</div>
		</nav>
	);
}
