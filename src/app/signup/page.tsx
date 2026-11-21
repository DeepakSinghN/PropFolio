import { Suspense } from "react";
import SignupClient from "./SignupClient";
import BrandedSpinner from "@/components/BrandedSpinner";

export default function SignupPage() {
  return (
    <Suspense fallback={<BrandedSpinner message="Loading onboarding..." subMessage="Setting up your broker workspace" />}>
      <SignupClient />
    </Suspense>
  );
}

