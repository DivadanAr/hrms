import FormLogin from "@/components/login/form-login";
import { getCookie } from "@/context/cookie";
import { Leaf } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const incomeCookie = await getCookie("__vxu_KeySid");
  const outcomeCookie = await getCookie("__vxu_meta-Us");
  if (incomeCookie && outcomeCookie) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] md:p-0 p-2">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden overflow-hidden bg-emerald-500 lg:flex">
          {/* Background Blur */}
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-400/40 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          {/* Floating Shapes */}
          <div className="absolute left-16 top-24 h-5 w-5 rounded-full bg-yellow-300" />
          <div className="absolute right-24 top-40 h-4 w-4 rounded-full bg-red-300" />
          <div className="absolute left-32 bottom-28 h-6 w-6 rounded-full bg-purple-300" />
          <div className="absolute right-40 bottom-40 h-5 w-5 rounded-full bg-lime-300" />

          {/* Content */}
          <div className="relative z-10 flex w-full flex-col items-center justify-center px-16 text-white">
            {/* Card Illustration */}
            <div className="relative">
              {/* Main Card */}
              <div className="rotate-[-8deg] rounded-[32px] bg-white p-6 text-gray-800 shadow-2xl">
                <div className="h-44 w-72 rounded-3xl bg-emerald-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-emerald-600">
                        Employee
                      </p>

                      <h2 className="mt-3 text-2xl font-bold">
                        HR Management Dashboard
                      </h2>
                    </div>

                    <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Active
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="h-3 rounded-full bg-emerald-300" />

                    <div className="h-3 w-3/4 rounded-full bg-emerald-200" />

                    <div className="h-3 w-1/2 rounded-full bg-emerald-100" />
                  </div>
                </div>
              </div>

              {/* Floating Small Card */}
              <div className="absolute -bottom-10 -right-10 rounded-3xl bg-white p-5 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2">
                      <Leaf size={18} className="text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Attendance
                      </p>

                      <span className="text-xs text-gray-400">98% Present</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2">
                      <Leaf size={18} className="text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Employee
                      </p>

                      <span className="text-xs text-gray-400">148 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="mt-28 max-w-md text-center">
              <h1 className="text-4xl font-bold leading-tight">
                Smart HR Management Solution
              </h1>

              <p className="mt-5 text-lg text-emerald-50">
                Manage attendance, payroll, employee performance and more in one
                dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <FormLogin />
      </div>
    </main>
  );
}
