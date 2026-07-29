"use client";
 
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
} from "@heroicons/react/20/solid";
 
const features = [
  {
    name: "Smart Appointments",
    description:
      "Patients can book consultations smoothly while doctors and staff manage schedules in one organized system.",
    icon: CalendarDaysIcon,
  },
  {
    name: "Secure Medical Records",
    description:
      "Patient information is stored safely with protected access, helping maintain privacy and dependable record management.",
    icon: ShieldCheckIcon,
  },
  {
    name: "3D Diagnosis Tool",
    description:
      "The system includes a dedicated 3D diagnosis tool to help visualize findings more clearly and support better clinical documentation.",
    icon: CubeTransparentIcon,
  },
];
 
export default function Example() {
  return (
    <div className="overflow-hidden bg-[#f7f6f2] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-14 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {/* ===== LEFT CONTENT ===== */}
          <div className="lg:pr-8">
            <div className="max-w-xl lg:max-w-lg">
              <div className="inline-flex items-center rounded-full border border-[#d7e6e4] bg-white/80 px-4 py-1.5 shadow-sm">
                <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                  Centra Clinic PH
                </span>
              </div>
 
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#0d2323] sm:text-5xl">
                Smarter Clinic Workflow,
                <br />
                Better Patient Care
              </h2>
 
              <p className="mt-6 text-lg leading-8 text-[#5f7b79]">
                Centra Clinic PH is built to support daily clinic operations with
                smoother scheduling, secure records, and better tools for
                diagnosis and documentation.
              </p>
 
              {/* Features list */}
              <dl className="mt-10 space-y-6 text-base text-[#4f6866]">
                {features.map((feature, index) => (
                  <div
                    key={feature.name}
                    className={`rounded-[24px] border p-5 shadow-sm transition ${
                      index === 2
                        ? "border-[#1d8d8a] bg-[#1d8d8a] text-white shadow-[0_18px_45px_rgba(29,141,138,0.18)]"
                        : "border-[#dbe9e7] bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          index === 2
                            ? "bg-white text-[#1d8d8a]"
                            : "bg-[#eaf6f5] text-[#1d8d8a]"
                        }`}
                      >
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
 
                      <div>
                        <dt
                          className={`text-lg font-semibold ${
                            index === 2 ? "text-white" : "text-[#0d2323]"
                          }`}
                        >
                          {feature.name}
                        </dt>
                        <dd
                          className={`mt-2 leading-7 ${
                            index === 2 ? "text-white/85" : "text-[#5f7b79]"
                          }`}
                        >
                          {feature.description}
                        </dd>
                      </div>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
 
          {/* ===== RIGHT VISUAL ===== */}
          <div className="relative">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[#1d8d8a]/10 blur-3xl" />
            <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" />
 
            <div className="relative overflow-hidden rounded-[32px] border border-[#dbe9e7] bg-white p-4 shadow-[0_20px_60px_rgba(16,37,37,0.08)]">
              <div className="rounded-[26px] bg-gradient-to-br from-[#dff3f1] via-[#eef8f7] to-[#d9ecff] p-5">
                <div className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1d8d8a]">
                        Centra System
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#0d2323]">
                        Clinical Overview
                      </h3>
                    </div>
                    <div className="rounded-full bg-[#1d8d8a] px-3 py-1 text-xs font-semibold text-white">
                      Live Tools
                    </div>
                  </div>
 
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#e4efee] bg-[#f8fbfb] p-4">
                      <p className="text-sm font-medium text-[#6a8482]">
                        Appointments
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-[#0d2323]">
                        128
                      </p>
                      <p className="mt-1 text-sm text-[#5f7b79]">
                        Managed consultations
                      </p>
                    </div>
 
                    <div className="rounded-2xl border border-[#e4efee] bg-[#f8fbfb] p-4">
                      <p className="text-sm font-medium text-[#6a8482]">
                        Records
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-[#0d2323]">
                        Secure
                      </p>
                      <p className="mt-1 text-sm text-[#5f7b79]">
                        Protected patient files
                      </p>
                    </div>
                  </div>
 
                  <div className="mt-5 rounded-[24px] bg-[#1d8d8a] p-5 text-white shadow-[0_16px_40px_rgba(29,141,138,0.18)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1d8d8a]">
                        <CubeTransparentIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                          Highlighted Tool
                        </p>
                        <h4 className="mt-1 text-2xl font-semibold">
                          3D Diagnosis Tool
                        </h4>
                        <p className="mt-2 max-w-md text-sm leading-7 text-white/85">
                          Designed to support clearer visualization, better case
                          review, and more detailed clinical recording inside
                          the system.
                        </p>
                      </div>
                    </div>
                  </div>
 
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f8fbfb] p-4 text-center">
                      <p className="text-xl font-semibold text-[#0d2323]">
                        ENT
                      </p>
                      <p className="mt-1 text-sm text-[#6a8482]">Focused care</p>
                    </div>
                    <div className="rounded-2xl bg-[#f8fbfb] p-4 text-center">
                      <p className="text-xl font-semibold text-[#0d2323]">
                        Notes
                      </p>
                      <p className="mt-1 text-sm text-[#6a8482]">
                        Organized records
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f8fbfb] p-4 text-center">
                      <p className="text-xl font-semibold text-[#0d2323]">
                        Tools
                      </p>
                      <p className="mt-1 text-sm text-[#6a8482]">
                        Better workflow
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 