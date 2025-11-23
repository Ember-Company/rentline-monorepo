import { Link } from "react-router";
import { Button } from "@heroui/react";
import { LogIn } from "lucide-react";

export function Navbar() {
	return (
		<nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
							<div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
								<div className="w-2.5 h-2.5 rounded-full bg-white" />
							</div>
						</div>
						<span className="text-xl font-bold text-gray-900">Rentline</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center gap-6">
						<Link
							to="/#features"
							className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
						>
							Features
						</Link>
						<Link
							to="/#pricing"
							className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
						>
							Pricing
						</Link>
						<Link
							to="/#about"
							className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
						>
							About
						</Link>
					</div>

					{/* Auth Button */}
					<Button
						as={Link}
						to="/auth/login"
						color="primary"
						startContent={<LogIn className="w-4 h-4" />}
					>
						Sign In
					</Button>
				</div>
			</div>
		</nav>
	);
}

