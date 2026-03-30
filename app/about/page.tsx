import Image from "next/image";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="bg-[#f7f6f2] text-[#0d2323]">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.10),rgba(247,246,242,1))]" />
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
                <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                  About Centra Clinic PH
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0d2323] md:text-5xl lg:text-6xl">
                Compassionate care,
                <br />
                centered around you
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7b79]">
                Centra Clinic PH is committed to delivering accessible,
                compassionate, and high-quality healthcare. We bring patients and
                medical professionals together through a modern clinic experience
                built on trust, efficiency, and genuine care.
              </p>

              {/* MISSION */}
              <div className="mt-12 rounded-[28px] border border-[#dbe9e7] bg-white/80 p-8 shadow-sm backdrop-blur">
                <h2 className="text-2xl font-semibold text-[#0d2323]">
                  Our mission
                </h2>
                <p className="mt-4 max-w-xl leading-8 text-[#5f7b79]">
                  Our mission is to improve patient outcomes by providing
                  reliable medical services, innovative healthcare solutions,
                  and a supportive environment where every individual feels
                  heard, respected, and cared for.
                </p>
              </div>
            </div>

            {/* RIGHT IMAGES */}
            <div className="relative h-[420px] sm:h-[500px]">
              <div className="absolute right-0 top-0 overflow-hidden rounded-[28px] border border-[#dbe9e7] bg-white p-2 shadow-[0_20px_50px_rgba(16,37,37,0.08)]">
                <Image
                  src="/e.jpg"
                  alt="ENT consultation at Centra Clinic PH"
                  width={270}
                  height={380}
                  className="rounded-[22px] object-cover"
                />
              </div>

              <div className="absolute right-44 top-24 overflow-hidden rounded-[28px] border border-[#dbe9e7] bg-white p-2 shadow-[0_20px_50px_rgba(16,37,37,0.08)]">
                <Image
                  src="/a.jpg"
                  alt="Patient care experience"
                  width={240}
                  height={300}
                  className="rounded-[22px] object-cover"
                />
              </div>

              <div className="absolute bottom-0 right-12 overflow-hidden rounded-[28px] border border-[#dbe9e7] bg-white p-2 shadow-[0_20px_50px_rgba(16,37,37,0.08)]">
                <Image
                  src="/s.jpg"
                  alt="Modern clinic facility"
                  width={230}
                  height={270}
                  className="rounded-[22px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
          <Stat number="44,000+" label="Patients served nationwide" />
          <Stat number="120+" label="Healthcare professionals partnered" />
          <Stat number="10+ years" label="Of trusted medical service" />
        </section>

        {/* VALUES IMAGE */}
        <section className="mx-auto max-w-7xl px-6">
          <div className="relative h-[320px] overflow-hidden rounded-[36px] border border-[#dbe9e7] shadow-[0_20px_60px_rgba(16,37,37,0.08)] sm:h-[420px]">
            <Image
              src="/sample.avif"
              alt="Centra Clinic PH team values"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2323]/35 via-[#0d2323]/10 to-transparent" />
          </div>
        </section>

        {/* VALUES CONTENT */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
              <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                Our Values
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-4xl">
              Our values
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f7b79]">
              At Centra Clinic PH, our values guide every consultation,
              diagnosis, and interaction. These principles define how we care
              for our patients and support our healthcare professionals.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Value title="Be world-class">
              We uphold the highest medical standards by continuously improving
              our clinical practices, facilities, and quality of patient care.
            </Value>

            <Value title="Share everything you know">
              We believe informed patients make better decisions. Clear
              communication and patient education are central to our care.
            </Value>

            <Value title="Always learning">
              Our team stays updated with the latest medical knowledge,
              technologies, and best practices to provide safe and effective
              treatment.
            </Value>

            <Value title="Be supportive">
              We foster a welcoming and respectful environment where patients
              and staff feel supported at every step of the healthcare journey.
            </Value>

            <Value title="Take responsibility">
              We take full responsibility for our actions, decisions, and
              outcomes to maintain patient safety, trust, and accountability.
            </Value>

            <Value title="Enjoy downtime">
              We value balance and well-being, knowing that healthy and rested
              healthcare professionals provide better care to patients.
            </Value>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* COMPONENTS */
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-[28px] border border-[#dbe9e7] bg-white/85 p-8 shadow-sm">
      <h3 className="text-3xl font-semibold tracking-tight text-[#0d2323]">
        {number}
      </h3>
      <p className="mt-2 text-[#5f7b79]">{label}</p>
    </div>
  );
}

function Value({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#dbe9e7] bg-white/85 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,37,37,0.08)]">
      <h4 className="mb-3 text-lg font-semibold text-[#0d2323]">{title}</h4>
      <p className="leading-7 text-[#5f7b79]">{children}</p>
    </div>
  );
}