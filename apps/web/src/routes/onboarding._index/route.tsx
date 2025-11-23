import type { Route } from "./+types/route";
import { Navigate } from "react-router";

export default function OnboardingIndex() {
	// Redirect to first step
	return <Navigate to="/onboarding/organization" replace />;
}

