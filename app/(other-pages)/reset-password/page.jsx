import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import ResetPassword from "@/components/otherPages/ResetPassword";
import Link from "next/link";
import React, { Suspense } from "react";
import { NO_INDEX } from "@/lib/site";

export const metadata = {
  title: "Choose a New Password",
  robots: NO_INDEX,
  // The URL holds the reset token: don't pass it on to other sites as the "referrer".
  referrer: "no-referrer",
};

// The ERP's password-reset email links here: /reset-password?token=...
export default function ResetPasswordPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">Reset your password</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>Reset your password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* useSearchParams (reads ?token=) needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <ResetPassword />
      </Suspense>
      <Footer1 />
    </>
  );
}
