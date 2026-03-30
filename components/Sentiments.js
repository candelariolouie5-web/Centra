export default function Example() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f6f2] px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.12),rgba(247,246,242,1))]" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white/70 shadow-xl ring-1 ring-[#dbe9e7] sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a] shadow-sm ring-1 ring-[#dbe9e7]">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-7 w-7"
          >
            <path d="M7.17 6A5.001 5.001 0 0 0 2 11v7h7v-7H5.08A3.001 3.001 0 0 1 8 8V6H7.17Zm9 0A5.001 5.001 0 0 0 11 11v7h7v-7h-3.92A3.001 3.001 0 0 1 17 8V6h-.83Z" />
          </svg>
        </div>

        <figure className="mt-10">
          <blockquote className="text-center text-xl font-semibold leading-8 text-[#0d2323] sm:text-2xl sm:leading-9">
            <p>
              “Centra Clinic gave me a truly reassuring experience from start to
              finish. The team was warm, professional, and attentive, and I felt
              genuinely cared for throughout my visit.”
            </p>
          </blockquote>

          <figcaption className="mt-10">
            <img
              alt="Judith Black"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="mx-auto size-12 rounded-full ring-4 ring-white shadow-md"
            />

            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-[#0d2323]">Judith Black</div>
              <svg
                width={4}
                height={4}
                viewBox="0 0 2 2"
                aria-hidden="true"
                className="fill-[#1d8d8a]"
              >
                <circle r={1} cx={1} cy={1} />
              </svg>
              <div className="text-[#5f7b79]">Patient at Centra Clinic</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}