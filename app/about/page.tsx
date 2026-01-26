import Image from "next/image";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="bg-white text-gray-900">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Compassionate care, centered around you
            </h1>

            <p className="text-gray-600 max-w-xl">
              Centra Clinic PH is committed to delivering accessible,
              compassionate, and high-quality healthcare. We bring patients and
              medical professionals together through a modern clinic experience
              built on trust, efficiency, and genuine care.
            </p>

            {/* MISSION */}
            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-4">Our mission</h2>
              <p className="text-gray-600 max-w-xl">
                Our mission is to improve patient outcomes by providing reliable
                medical services, innovative healthcare solutions, and a
                supportive environment where every individual feels heard,
                respected, and cared for.
              </p>
            </div>
          </div>

          {/* RIGHT IMAGES */}
          <div className="relative h-[420px]">
            <Image
              src="/e.jpg"
              alt="ENT consultation at Centra Clinic PH"
              width={260}
              height={360}
              className="absolute right-0 top-0 rounded-xl shadow-lg object-cover"
            />
            <Image
              src="/a.jpg"
              alt="Patient care experience"
              width={240}
              height={300}
              className="absolute right-40 top-24 rounded-xl shadow-lg object-cover"
            />
            <Image
              src="/s.jpg"
              alt="Modern clinic facility"
              width={220}
              height={260}
              className="absolute right-16 bottom-0 rounded-xl shadow-lg object-cover"
            />
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-12">
          <Stat number="44,000+" label="Patients served nationwide" />
          <Stat number="120+" label="Healthcare professionals partnered" />
          <Stat number="10+ years" label="Of trusted medical service" />
        </section>

        {/* VALUES IMAGE */}
        <section className="relative h-[420px]">
          <Image
            src="/sample.avif"
            alt="Centra Clinic PH team values"
            fill
            className="object-cover"
          />
        </section>

        {/* VALUES CONTENT */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold mb-4">Our values</h2>
          <p className="text-gray-600 max-w-2xl mb-16">
            At Centra Clinic PH, our values guide every consultation, diagnosis,
            and interaction. These principles define how we care for our patients
            and support our healthcare professionals.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
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
              We foster a welcoming and respectful environment where patients and
              staff feel supported at every step of the healthcare journey.
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
    <div>
      <h3 className="text-3xl font-bold mb-1">{number}</h3>
      <p className="text-gray-500">{label}</p>
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
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}
