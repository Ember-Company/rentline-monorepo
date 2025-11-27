import { Navigate } from "react-router";
import type { Route } from "./+types/route";

export default function OnboardingIndex() {
	// Redirect to first step
	return <Navigate to="/onboarding/organization" replace />;
}
