import type { Route } from "./+types/_index";
import { Navbar } from "@/components/navbar";
import { Button, Card, CardBody } from "@heroui/react";
import { Link } from "react-router";
import {
	Home as HomeIcon,
	Users,
	DollarSign,
	BarChart3,
	Check,
} from "lucide-react";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Rentline - Property Management Made Simple" },
		{
			name: "description",
			content:
				"Manage your rental properties with ease. Track tenants, payments, and maintenance all in one place.",
		},
	];
}

export default function Home() {
	// Landing page is always visible - no redirect needed

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<Navbar />

			{/* Hero Section */}
			<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
						Property Management
						<br />
						<span className="text-primary">Made Simple</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Manage your rental properties with ease. Track tenants, payments,
						and maintenance all in one place.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							as={Link}
							to="/auth/register"
							color="primary"
							size="lg"
							className="text-lg px-8"
						>
							Get Started Free
						</Button>
						<Button
							as={Link}
							to="/auth/login"
							variant="bordered"
							size="lg"
							className="text-lg px-8"
						>
							Sign In
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
			>
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
						Everything you need to manage properties
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="border border-gray-200 shadow-sm">
							<CardBody className="p-6">
								<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
									<HomeIcon className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Property Management
								</h3>
								<p className="text-gray-600">
									Keep track of all your properties, their details, and
									occupancy status in one centralized location.
								</p>
							</CardBody>
						</Card>
						<Card className="border border-gray-200 shadow-sm">
							<CardBody className="p-6">
								<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
									<Users className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Tenant Management
								</h3>
								<p className="text-gray-600">
									Manage tenant information, lease agreements, and communication
									all in one place.
								</p>
							</CardBody>
						</Card>
						<Card className="border border-gray-200 shadow-sm">
							<CardBody className="p-6">
								<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
									<DollarSign className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Financial Tracking
								</h3>
								<p className="text-gray-600">
									Track rent payments, expenses, and generate financial reports
									effortlessly.
								</p>
							</CardBody>
						</Card>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section id="pricing" className="bg-gray-50 py-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Simple Pricing
						</h2>
						<p className="text-gray-600 mb-12">
							Start free and scale as you grow. No credit card required.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="border border-gray-200 shadow-sm">
								<CardBody className="p-8">
									<h3 className="text-2xl font-bold text-gray-900 mb-2">
										Free
									</h3>
									<div className="mb-6">
										<span className="text-4xl font-bold text-gray-900">$0</span>
										<span className="text-gray-600">/month</span>
									</div>
									<ul className="space-y-3 mb-8 text-left">
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">Up to 5 properties</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">
												Basic property management
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">Email support</span>
										</li>
									</ul>
									<Button
										as={Link}
										to="/auth/register"
										variant="bordered"
										className="w-full"
									>
										Get Started
									</Button>
								</CardBody>
							</Card>
							<Card className="border-2 border-primary shadow-lg">
								<CardBody className="p-8">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-2xl font-bold text-gray-900">
											Professional
										</h3>
										<span className="text-xs bg-primary text-white px-2 py-1 rounded">
											Popular
										</span>
									</div>
									<div className="mb-6">
										<span className="text-4xl font-bold text-gray-900">
											$79
										</span>
										<span className="text-gray-600">/month</span>
									</div>
									<ul className="space-y-3 mb-8 text-left">
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">
												Unlimited properties
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">Advanced analytics</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">24/7 phone support</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-5 h-5 text-primary flex-shrink-0" />
											<span className="text-gray-600">API access</span>
										</li>
									</ul>
									<Button
										as={Link}
										to="/auth/register"
										color="primary"
										className="w-full"
									>
										Get Started
									</Button>
								</CardBody>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-6xl mx-auto">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="mb-4 md:mb-0">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
										<div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
											<div className="w-2.5 h-2.5 rounded-full bg-white" />
										</div>
									</div>
									<span className="text-xl font-bold">Rentline</span>
								</div>
								<p className="text-gray-400 text-sm">
									Property management made simple
								</p>
							</div>
							<div className="flex gap-6">
								<Link
									to="/auth/login"
									className="text-gray-400 hover:text-white transition-colors"
								>
									Sign In
								</Link>
								<Link
									to="/auth/register"
									className="text-gray-400 hover:text-white transition-colors"
								>
									Sign Up
								</Link>
							</div>
						</div>
						<div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
							<p>&copy; 2024 Rentline. All rights reserved.</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
