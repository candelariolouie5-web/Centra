'use client'
import React from 'react'
 
export default function Example() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Top Gradient Shape */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] w-6xl aspect-1155/678 -translate-x-1/2 rotate-30 bg-linear-to-tr from-pink-400 to-indigo-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-576"
          />
        </div>
 
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          {/* Badge */}
          <div className="hidden sm:flex justify-center mb-8">
            <span className="relative rounded-full px-3 py-1 text-sm text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Trusted healthcare.{' '}
              <a href="#" className="font-semibold text-indigo-600">
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </span>
          </div>
 
          {/* Main Text */}
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
            Your Health, Our Priority
          </h1>
          <p className="mt-8 text-lg font-medium text-gray-500 sm:text-xl">
            Experience personalized care and advanced treatments at Centra
            Clinic Ph. Your journey to better health starts here.
          </p>
 
          {/* Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              Get Started
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900 hover:underline">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
 
        {/* Bottom Gradient Shape */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:bottom-120"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] w-6xl aspect-1155/678 -translate-x-1/2 bg-linear-to-tr from-pink-400 to-indigo-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-144rem"
          />
        </div>
      </div>
 
      {/* Logos Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold text-gray-900">
            Trusted by the world’s most innovative teams
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <img
              alt="Transistor"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            />
            <img
              alt="Reform"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            />
            <img
              alt="Tuple"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            />
            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
            />
            <img
              alt="Statamic"
              src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
              className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
            />
          </div>
        </div>
      </div>
    </div>
   
  )
}