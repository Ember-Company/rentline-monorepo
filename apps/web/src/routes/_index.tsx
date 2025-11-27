import { Button, Card, CardBody } from "@heroui/react";
import {
	BarChart3,
	Check,
	DollarSign,
	Home as HomeIcon,
	Users,
} from "lucide-react";
import { Link } from "react-router";
import { Navbar } from "@/components/navbar";
import type { Route } from "./+types/_index";

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
			<section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mb-6 font-bold text-5xl text-gray-900 md:text-6xl">
						Property Management
						<br />
						<span className="text-primary">Made Simple</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl">
						Manage your rental properties with ease. Track tenants, payments,
						and maintenance all in one place.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							as={Link}
							to="/auth/register"
							color="primary"
							size="lg"
							className="px-8 text-lg"
						>
							Get Started Free
						</Button>
						<Button
							as={Link}
							to="/auth/login"
							variant="bordered"
							size="lg"
							className="px-8 text-lg"
						>
							Sign In
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
			>
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-12 text-center font-bold text-3xl text-gray-900">
						Everything you need to manage properties
					</h2>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<Card className="border border-gray-200 shadow-sm">
							<CardBody className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<HomeIcon className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-gray-900 text-xl">
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
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-gray-900 text-xl">
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
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<DollarSign className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-gray-900 text-xl">
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
					<div className="mx-auto max-w-4xl text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							Simple Pricing
						</h2>
						<p className="mb-12 text-gray-600">
							Start free and scale as you grow. No credit card required.
						</p>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Card className="border border-gray-200 shadow-sm">
								<CardBody className="p-8">
									<h3 className="mb-2 font-bold text-2xl text-gray-900">
										Free
									</h3>
									<div className="mb-6">
										<span className="font-bold text-4xl text-gray-900">$0</span>
										<span className="text-gray-600">/month</span>
									</div>
									<ul className="mb-8 space-y-3 text-left">
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
											<span className="text-gray-600">Up to 5 properties</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
											<span className="text-gray-600">
												Basic property management
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
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
									<div className="mb-2 flex items-center justify-between">
										<h3 className="font-bold text-2xl text-gray-900">
											Professional
										</h3>
										<span className="rounded bg-primary px-2 py-1 text-white text-xs">
											Popular
										</span>
									</div>
									<div className="mb-6">
										<span className="font-bold text-4xl text-gray-900">
											$79
										</span>
										<span className="text-gray-600">/month</span>
									</div>
									<ul className="mb-8 space-y-3 text-left">
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
											<span className="text-gray-600">
												Unlimited properties
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
											<span className="text-gray-600">Advanced analytics</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
											<span className="text-gray-600">24/7 phone support</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-5 w-5 flex-shrink-0 text-primary" />
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
			<footer className="bg-gray-900 py-12 text-white">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center justify-between md:flex-row">
							<div className="mb-4 md:mb-0">
								<div className="mb-2 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
											<div className="h-2.5 w-2.5 rounded-full bg-white" />
										</div>
									</div>
									<span className="font-bold text-xl">Rentline</span>
								</div>
								<p className="text-gray-400 text-sm">
									Property management made simple
								</p>
							</div>
							<div className="flex gap-6">
								<Link
									to="/auth/login"
									className="text-gray-400 transition-colors hover:text-white"
								>
									Sign In
								</Link>
								<Link
									to="/auth/register"
									className="text-gray-400 transition-colors hover:text-white"
								>
									Sign Up
								</Link>
							</div>
						</div>
						<div className="mt-8 border-gray-800 border-t pt-8 text-center text-gray-400 text-sm">
							<p>&copy; 2024 Rentline. All rights reserved.</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
