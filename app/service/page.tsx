"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  SpeakerWaveIcon,
  AcademicCapIcon,
  BeakerIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  CursorArrowRippleIcon,
  EyeIcon,
  HeartIcon,
  FaceSmileIcon,
  SparklesIcon,
  ScissorsIcon,
  PaintBrushIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import Footer from "../../components/Footer";

// ---------- TYPES ----------
type ServiceIconKey =
  | "EarIcon"
  | "NoseIcon"
  | "ThroatIcon"
  | "EndoscopyIcon"
  | "HearingIcon"
  | "RhinoplastyIcon"
  | "BlepharoplastyIcon"
  | "OtoplastyIcon"
  | "BotoxIcon"
  | "FillersIcon"
  | "ThreadLiftIcon"
  | "SkinIcon"
  | "FacialRejuvenationIcon"
  | "VestibularIcon";

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceDetails {
  heroImage: string;
  overview: string;
  idealCandidates: string[];
  procedureOptions: string[];
  benefits: string[];
  recoveryTimeline: string;
  beforeSurgery: string;
  aftercare: string;
  risks: string;
  faqs: FAQ[];
}

interface Service {
  id: string;
  category: string;
  name?: string;        // from DB
  title: string;        // for compatibility
  description: string;
  icon: ServiceIconKey;
  status: "Active" | "Inactive";
  image?: string;       // from DB
  details: ServiceDetails;
}

// Map icon string to Heroicon component
const iconMap: Record<ServiceIconKey, React.ComponentType<{ className?: string }>> = {
  EarIcon: SpeakerWaveIcon,
  NoseIcon: AcademicCapIcon,
  ThroatIcon: BeakerIcon,
  EndoscopyIcon: MicrophoneIcon,
  HearingIcon: MusicalNoteIcon,
  RhinoplastyIcon: CursorArrowRippleIcon,
  BlepharoplastyIcon: EyeIcon,
  OtoplastyIcon: HeartIcon,
  BotoxIcon: FaceSmileIcon,
  FillersIcon: SparklesIcon,
  ThreadLiftIcon: ScissorsIcon,
  SkinIcon: PaintBrushIcon,
  FacialRejuvenationIcon: DocumentTextIcon,
  VestibularIcon: UserGroupIcon,
};

// ---------- MAIN COMPONENT ----------
export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          // Only show active services
          const activeServices = data.filter((s: Service) => s.status === "Active");
          setServices(activeServices);
        } else {
          console.error("Failed to fetch services");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const openModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setExpandedAccordion(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const toggleAccordion = (sectionId: string) => {
    setExpandedAccordion(expandedAccordion === sectionId ? null : sectionId);
  };

  const getModalSections = (service: Service) => {
    return [
      { id: "overview", title: "Overview", content: service.details.overview },
      {
        id: "ideal-candidates",
        title: "Ideal Candidates",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            {service.details.idealCandidates.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ),
      },
      {
        id: "procedure-options",
        title: "Procedure Options",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            {service.details.procedureOptions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ),
      },
      {
        id: "benefits",
        title: "Benefits",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            {service.details.benefits.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ),
      },
      {
        id: "recovery",
        title: "Recovery Timeline",
        content: service.details.recoveryTimeline,
      },
      {
        id: "before-surgery",
        title: "Before Surgery",
        content: service.details.beforeSurgery,
      },
      {
        id: "aftercare",
        title: "Aftercare",
        content: service.details.aftercare,
      },
      {
        id: "risks",
        title: "Risks & Complications",
        content: service.details.risks,
      },
      {
        id: "faqs",
        title: "Frequently Asked Questions",
        content: (
          <div className="space-y-4">
            {service.details.faqs.map((faq, idx) => (
              <div key={idx}>
                <p className="font-medium text-gray-800">{faq.question}</p>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        ),
      },
    ];
  };

  const modalSections = selectedService ? getModalSections(selectedService) : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  // No services
  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold">No Services Available</h1>
          <p className="text-gray-500 mt-2">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden py-24 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.12),rgba(247,246,242,1))]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {/* Left side */}
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <p className="text-base/7 font-semibold text-teal-600">ENT & Aesthetics Services</p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                  Comprehensive ENT & Aesthetic Care
                </h2>
                <p className="mt-6 text-lg/8 text-gray-700">
                  Centra Clinic PH provides both expert medical ENT treatments and advanced cosmetic procedures.
                  Our integrated approach ensures holistic care for your ear, nose, throat, and aesthetic needs.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <a
                    href="#"
                    className="rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                  >
                    Book a Consultation
                  </a>
                  <a href="#" className="text-sm font-semibold text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right side - Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const IconComponent = iconMap[service.icon] || Square3Stack3DIcon;
                // Use name from DB if available, fallback to title
                const displayTitle = service.name || service.title;
                return (
                  <div
                    key={service.id}
                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => openModal(service)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/50 group-hover:to-teal-50/30 transition-colors duration-300" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">{displayTitle}</h3>
                      <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                      <p className="mt-3 text-sm font-medium text-teal-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More
                        <ArrowRightIcon className="h-4 w-4" />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Slide-over Panel */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* Panel */}
          <div
            className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out"
            style={{ transform: isModalOpen ? 'translateX(0)' : 'translateX(100%)' }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow-md"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Hero Image */}
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={selectedService.details.heroImage || selectedService.image || "/placeholder.jpg"}
                alt={selectedService.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-medium text-teal-200">{selectedService.category}</p>
                <h2 className="text-3xl font-bold">{selectedService.name || selectedService.title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Accordion sections */}
              {modalSections.map((section) => {
                const isExpanded = expandedAccordion === section.id;
                return (
                  <div key={section.id} className="border-b border-gray-200 pb-4">
                    <button
                      className="flex w-full items-center justify-between text-left font-medium text-gray-900 hover:text-teal-600 transition-colors"
                      onClick={() => toggleAccordion(section.id)}
                    >
                      <span>{section.title}</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="pt-3 text-gray-700">{section.content}</div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button className="w-full sm:w-auto rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors">
                  Book Consultation
                </button>
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Back to Services
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <Footer />
    </>
  );
}