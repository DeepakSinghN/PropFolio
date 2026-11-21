import { Suspense } from "react";
import LoginClient from "./LoginClient";
import BrandedSpinner from "@/components/BrandedSpinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<BrandedSpinner message="Loading login portal..." subMessage="Securing broker authentication" />}>
      <LoginClient />
    </Suspense>
  );
}

