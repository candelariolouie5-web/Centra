"use client";
 
import React, { useState } from "react";
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
import Footer from "../../components/Footer"; // ← Footer import
 
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
  title: string;
  description: string;
  icon: ServiceIconKey;
  details: ServiceDetails;
}
 
// ---------- SERVICE DATA ----------
const servicesData: Service[] = [
  // ENT Services
  {
    id: "ear-consultation",
    category: "ENT Services",
    title: "Ear Consultation",
    description: "Comprehensive evaluation and treatment for ear-related conditions.",
    icon: "EarIcon",
    details: {
      heroImage: "/ear.jpg",
      overview:
        "Ear consultation involves a thorough examination of the ear canal, eardrum, and hearing function. Our specialists diagnose and manage conditions such as hearing loss, ear infections, tinnitus, and balance disorders.",
      idealCandidates: [
        "Patients with hearing difficulties",
        "Those suffering from recurring ear infections",
        "Individuals experiencing tinnitus or vertigo",
        "People with ear pain or discharge",
      ],
      procedureOptions: [
        "Microscopic examination",
        "Audiometry and tympanometry",
        "Ear cleaning and microsuction",
        "Medical management",
      ],
      benefits: [
        "Accurate diagnosis",
        "Personalized treatment plans",
        "Improved quality of life",
        "Prevention of complications",
      ],
      recoveryTimeline: "Most patients resume normal activities immediately after consultation. If procedures are done, recovery varies.",
      beforeSurgery:
        "No special preparation needed for consultation, but bring any relevant medical records.",
      aftercare:
        "Follow prescribed medication and attend follow-up appointments as advised.",
      risks: "Minimal risks associated with diagnostic procedures; rare allergic reactions to medications.",
      faqs: [
        { question: "How long does an ear consultation take?", answer: "Typically 30-45 minutes." },
        { question: "Is it painful?", answer: "No, the examination is painless." },
        { question: "Do I need a referral?", answer: "Not necessarily; you can book directly." },
      ],
    },
  },
  {
    id: "nose-consultation",
    category: "ENT Services",
    title: "Nose Consultation",
    description: "Expert evaluation of nasal and sinus issues.",
    icon: "NoseIcon",
    details: {
      heroImage: "/s.jpg",
      overview:
        "Nose consultation addresses nasal obstruction, sinusitis, allergies, and breathing difficulties. Our ENT specialists use advanced endoscopic techniques to assess and treat nasal conditions.",
      idealCandidates: [
        "Chronic nasal congestion",
        "Sinus pain or pressure",
        "Frequent nosebleeds",
        "Loss of smell",
      ],
      procedureOptions: ["Nasal endoscopy", "Allergy testing", "CT scan (if needed)", "Medical therapy"],
      benefits: ["Clearer breathing", "Reduced sinus infections", "Better sleep quality"],
      recoveryTimeline: "Minor discomfort may occur after endoscopy; most return to normal within a day.",
      beforeSurgery: "Avoid nasal sprays or decongestants for 24 hours before procedure.",
      aftercare: "Use saline sprays as recommended; avoid strenuous activity for 48 hours.",
      risks: "Rare bleeding or infection; endoscopic procedures are generally safe.",
      faqs: [
        { question: "Will I need imaging?", answer: "Sometimes, if sinus disease is suspected." },
        { question: "How soon will I see improvement?", answer: "Many patients notice relief within days." },
      ],
    },
  },
  {
    id: "throat-consultation",
    category: "ENT Services",
    title: "Throat Consultation",
    description: "Diagnosis and management of throat and voice disorders.",
    icon: "ThroatIcon",
    details: {
      heroImage: "/y.jpg",
      overview:
        "Throat consultation covers voice problems, swallowing difficulties, tonsillitis, and laryngeal conditions. We perform laryngoscopy and other diagnostic procedures to pinpoint issues.",
      idealCandidates: [
        "Hoarseness lasting more than 2 weeks",
        "Sore throat not responding to treatment",
        "Swallowing pain or difficulty",
        "Frequent tonsillitis",
      ],
      procedureOptions: ["Indirect laryngoscopy", "Flexible laryngoscopy", "Stroboscopy", "Voice therapy"],
      benefits: ["Improved voice quality", "Safe swallowing", "Early detection of serious conditions"],
      recoveryTimeline: "Usually no downtime; voice rest may be recommended after certain procedures.",
      beforeSurgery: "Avoid eating or drinking for 2 hours before laryngoscopy.",
      aftercare: "Rest your voice; stay hydrated.",
      risks: "Very low risk; slight gagging during examination.",
      faqs: [
        { question: "Is the examination uncomfortable?", answer: "Mild discomfort, but it's brief." },
        { question: "Can I eat after?", answer: "Yes, once the anesthetic wears off." },
      ],
    },
  },
  {
    id: "endoscopy",
    category: "ENT Services",
    title: "Endoscopy",
    description: "Minimally invasive diagnostic and surgical procedures.",
    icon: "EndoscopyIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?endoscopy,scope",
      overview:
        "Endoscopy allows direct visualization of the upper aerodigestive tract. It is used for both diagnosis and treatment of various ENT conditions.",
      idealCandidates: [
        "Patients with unexplained swallowing issues",
        "Suspected tumors or polyps",
        "Chronic cough or throat clearing",
        "Evaluation of vocal cord function",
      ],
      procedureOptions: ["Flexible nasopharyngoscopy", "Rigid laryngoscopy", "Biopsy", "Stroboscopy"],
      benefits: ["Accurate diagnosis", "Minimal discomfort", "Quick recovery"],
      recoveryTimeline: "Most return to normal activities the same day.",
      beforeSurgery: "Follow fasting instructions if sedation is used.",
      aftercare: "Rest and avoid hot liquids for a few hours.",
      risks: "Rare perforation or bleeding; infection is uncommon.",
      faqs: [
        { question: "Do I need anesthesia?", answer: "Usually topical anesthetic is used; sedation may be offered." },
        { question: "How long does it take?", answer: "About 15–20 minutes." },
      ],
    },
  },
  {
    id: "hearing-assessment",
    category: "ENT Services",
    title: "Hearing Assessment",
    description: "Comprehensive evaluation of hearing ability.",
    icon: "HearingIcon",
    details: {
      heroImage: "/image.png",
      overview:
        "Hearing assessment includes pure-tone audiometry, speech testing, and tympanometry to evaluate hearing sensitivity and middle ear function.",
      idealCandidates: [
        "Adults and children with suspected hearing loss",
        "Those exposed to occupational noise",
        "Patients with tinnitus",
        "Pre-employment and routine screenings",
      ],
      procedureOptions: ["Audiometry", "Speech audiometry", "Impedance testing", "Otoacoustic emissions"],
      benefits: ["Early detection", "Appropriate hearing aid selection", "Protection of remaining hearing"],
      recoveryTimeline: "No recovery time needed; results are immediate.",
      beforeSurgery: "No special preparation; avoid loud noise for 12 hours prior.",
      aftercare: "Follow up with audiologist for hearing aid fitting if needed.",
      risks: "None; non-invasive.",
      faqs: [
        { question: "Is the test painful?", answer: "No, it's completely painless." },
        { question: "How long does it take?", answer: "About 30 minutes." },
      ],
    },
  },
  {
    id: "vestibular-rehab",
    category: "ENT Services",
    title: "Vestibular Rehabilitation",
    description: "Specialized therapy for balance and dizziness disorders.",
    icon: "VestibularIcon",
    details: {
      heroImage: "/Clean.jpg",
      overview:
        "Vestibular rehabilitation is a specialized therapy designed to treat balance problems and dizziness caused by inner ear disorders. Our therapists use customized exercises to retrain the brain to compensate for vestibular dysfunction.",
      idealCandidates: [
        "Patients with benign paroxysmal positional vertigo (BPPV)",
        "Those with vestibular neuritis or labyrinthitis",
        "Individuals with chronic dizziness or imbalance",
        "People who experience motion sensitivity",
      ],
      procedureOptions: [
        "Canalith repositioning maneuvers (Epley, Semont)",
        "Balance training exercises",
        "Gaze stabilization exercises",
        "Habituation exercises",
      ],
      benefits: ["Reduced dizziness and vertigo", "Improved balance and stability", "Increased confidence in movement", "Reduced risk of falls"],
      recoveryTimeline: "Improvement is often seen within 2–4 weeks, with full results in 3–6 months.",
      beforeSurgery: "No special preparation; bring a list of current medications.",
      aftercare: "Continue home exercises as prescribed; follow-up sessions as needed.",
      risks: "Minimal; some may experience temporary increase in dizziness during initial sessions.",
      faqs: [
        { question: "How long are the sessions?", answer: "Typically 45–60 minutes." },
        { question: "Is it painful?", answer: "No, but some exercises may cause mild discomfort." },
        { question: "Will I need to do exercises at home?", answer: "Yes, daily exercises are crucial for best results." },
      ],
    },
  },
  // Aesthetic Services
  {
    id: "rhinoplasty",
    category: "Aesthetic Services",
    title: "Rhinoplasty",
    description: "Surgical reshaping of the nose for cosmetic and functional improvement.",
    icon: "RhinoplastyIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?rhinoplasty,nose",
      overview:
        "Rhinoplasty, or nose surgery, improves the appearance and function of the nose. It can correct breathing problems and enhance facial harmony.",
      idealCandidates: [
        "Individuals unhappy with nose shape",
        "Those with breathing difficulties",
        "Patients with nasal deformities from injury",
        "Adults with fully developed nasal structures",
      ],
      procedureOptions: ["Open rhinoplasty", "Closed rhinoplasty", "Tip refinement", "Septoplasty combined"],
      benefits: ["Improved facial balance", "Enhanced breathing", "Increased self-confidence"],
      recoveryTimeline: "Swelling and bruising subside in 1–2 weeks; final results in 6–12 months.",
      beforeSurgery:
        "Stop smoking and avoid blood-thinning medications; arrange for transportation after surgery.",
      aftercare:
        "Keep head elevated, avoid strenuous activity, and attend follow-up appointments.",
      risks: "Infection, bleeding, asymmetry, or scarring; rare.",
      faqs: [
        { question: "Will I have visible scars?", answer: "Scars are well-hidden inside the nose or in natural creases." },
        { question: "How long is recovery?", answer: "Most return to work in 1–2 weeks." },
        { question: "Is rhinoplasty covered by insurance?", answer: "Functional components may be covered; cosmetic portions are not." },
      ],
    },
  },
  {
    id: "blepharoplasty",
    category: "Aesthetic Services",
    title: "Blepharoplasty",
    description: "Eyelid surgery to rejuvenate the eye area.",
    icon: "BlepharoplastyIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?eyelid,surgery",
      overview:
        "Blepharoplasty removes excess skin and fat from the upper and lower eyelids, resulting in a more youthful and alert appearance.",
      idealCandidates: [
        "Drooping upper eyelids affecting vision",
        "Puffy lower eyelids",
        "Fine wrinkles around eyes",
        "Healthy individuals with realistic expectations",
      ],
      procedureOptions: ["Upper eyelid surgery", "Lower eyelid surgery", "Transconjunctival approach", "Laser blepharoplasty"],
      benefits: ["Brighter, more open eyes", "Improved vision (if obstructed)", "Long-lasting results"],
      recoveryTimeline: "Swelling and bruising peak at 2–3 days; stitches removed in 5–7 days.",
      beforeSurgery:
        "Avoid aspirin and anti-inflammatory drugs; arrange for post-operative care.",
      aftercare:
        "Use cold compresses, keep head elevated, and avoid rubbing eyes.",
      risks: "Infection, dry eyes, asymmetry, or ectropion (rare).",
      faqs: [
        { question: "Will I have scars?", answer: "Incision lines are placed in natural creases and fade over time." },
        { question: "How long before I can wear makeup?", answer: "Usually after 1–2 weeks." },
      ],
    },
  },
  {
    id: "otoplasty",
    category: "Aesthetic Services",
    title: "Otoplasty",
    description: "Surgery to correct prominent or misshapen ears.",
    icon: "OtoplastyIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?ear,surgery",
      overview:
        "Otoplasty reshapes the ears, setting them closer to the head for a natural appearance. It can be performed on both children and adults.",
      idealCandidates: [
        "Children over age 5 (when ears are fully grown)",
        "Adults with prominent ears",
        "Individuals with asymmetrical ears",
        "Those in good health",
      ],
      procedureOptions: ["Cartilage reshaping", "Cartilage removal", "Suturing techniques", "Combined approaches"],
      benefits: ["Improved ear position", "Enhanced facial balance", "Boosted self-esteem"],
      recoveryTimeline: "Bandages worn for 1 week; swelling subsides in 2 weeks; results visible gradually.",
      beforeSurgery: "Avoid blood-thinners; arrange for time off work/school.",
      aftercare: "Keep head elevated; avoid sleeping on the ears.",
      risks: "Infection, bleeding, or recurrence of prominence.",
      faqs: [
        { question: "Is otoplasty painful?", answer: "Discomfort is manageable with medication." },
        { question: "Will I have to wear a headband?", answer: "Yes, for a few weeks to protect ears." },
      ],
    },
  },
  {
    id: "botox",
    category: "Aesthetic Services",
    title: "Botox",
    description: "Non-surgical injection to reduce wrinkles and fine lines.",
    icon: "BotoxIcon",
    details: {
      heroImage: "/Cosmetic Procedure Close-Up.png",
      overview:
        "Botox injections temporarily relax facial muscles, smoothing dynamic wrinkles such as crow's feet and frown lines.",
      idealCandidates: [
        "Patients with moderate to severe facial wrinkles",
        "Those seeking a non-invasive solution",
        "People without allergies to botulinum toxin",
        "Adults aged 18–65",
      ],
      procedureOptions: ["Forehead lines", "Glabellar lines", "Crow's feet", "Brow lift"],
      benefits: ["Quick procedure", "Minimal downtime", "Natural-looking results", "Preventive aging effects"],
      recoveryTimeline: "Results appear in 3–7 days; effects last 3–4 months.",
      beforeSurgery: "Avoid alcohol and aspirin 24 hours prior.",
      aftercare: "Do not rub or massage the treated area; avoid strenuous exercise for 24 hours.",
      risks: "Bruising, headache, or temporary drooping of eyelid (rare).",
      faqs: [
        { question: "When will I see results?", answer: "Usually within 3–5 days." },
        { question: "How long does it last?", answer: "About 3–4 months on average." },
      ],
    },
  },
  {
    id: "fillers",
    category: "Aesthetic Services",
    title: "Fillers",
    description: "Injectable fillers to restore volume and contour.",
    icon: "FillersIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?fillers,injectable",
      overview:
        "Dermal fillers are gel-like substances injected beneath the skin to restore lost volume, smooth lines, and enhance facial contours.",
      idealCandidates: [
        "Patients with facial volume loss",
        "Deep wrinkles or folds",
        "Thin lips wanting augmentation",
        "Those seeking non-surgical facial rejuvenation",
      ],
      procedureOptions: ["Hyaluronic acid fillers", "Calcium hydroxylapatite", "Poly-L-lactic acid", "Autologous fat transfer"],
      benefits: ["Immediate results", "No downtime", "Customizable treatment", "Stimulates collagen production"],
      recoveryTimeline: "Minimal swelling/bruising for 1–2 days; results last 6–18 months.",
      beforeSurgery: "Avoid blood-thinners; inform about allergies.",
      aftercare: "Avoid extreme temperatures and facial massage for 2 weeks.",
      risks: "Infection, allergic reaction, lumps, or asymmetry.",
      faqs: [
        { question: "Are fillers painful?", answer: "Most contain lidocaine for comfort." },
        { question: "How long do results last?", answer: "Varies by product, typically 6–18 months." },
      ],
    },
  },
  {
    id: "thread-lift",
    category: "Aesthetic Services",
    title: "Thread Lift",
    description: "Minimally invasive lift using dissolvable threads.",
    icon: "ThreadLiftIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?threadlift",
      overview:
        "A thread lift involves inserting temporary sutures to lift and reposition sagging facial tissues, stimulating collagen production.",
      idealCandidates: [
        "Mild to moderate facial sagging",
        "Patients not ready for facelift surgery",
        "Those seeking subtle lift with minimal downtime",
        "Aged 30–60",
      ],
      procedureOptions: ["Cog threads", "Smooth threads", "Screw threads", "Combination techniques"],
      benefits: ["Immediate lift", "Stimulates natural collagen", "Recovery time is short", "Reversible"],
      recoveryTimeline: "Swelling and bruising for 3–5 days; full effect in 2–3 months.",
      beforeSurgery: "Stop aspirin and smoking; inform about skin conditions.",
      aftercare: "Avoid chewing hard foods, facial massages, and sleeping on side.",
      risks: "Infection, thread migration, puckering, or asymmetry.",
      faqs: [
        { question: "How long do threads last?", answer: "Threads dissolve in 6–18 months, but lift effect may persist." },
        { question: "Is it painful?", answer: "Local anesthesia is used; mild discomfort after." },
      ],
    },
  },
  {
    id: "skin-treatments",
    category: "Aesthetic Services",
    title: "Skin Treatments",
    description: "Advanced skin rejuvenation and care procedures.",
    icon: "SkinIcon",
    details: {
      heroImage: "/Gluta.jpg",
      overview:
        "Our skin treatments include chemical peels, laser therapy, microneedling, and custom facial rejuvenation plans to improve skin texture, tone, and clarity.",
      idealCandidates: [
        "Patients with sun damage or pigmentation",
        "Acne scars or fine lines",
        "Dull or aged skin",
        "Those seeking non-invasive skin improvement",
      ],
      procedureOptions: ["Chemical peels", "Fractional laser", "Microneedling", "PRP facelift"],
      benefits: ["Brighter skin", "Reduced pigmentation", "Smoother texture", "Stimulated collagen"],
      recoveryTimeline: "Downtime varies from 1 day to 1 week depending on intensity.",
      beforeSurgery: "Avoid sun exposure and retinol products 1 week before.",
      aftercare: "Sun protection, gentle cleansing, and moisturizing.",
      risks: "Redness, peeling, or hyperpigmentation (rare).",
      faqs: [
        { question: "How many sessions do I need?", answer: "Often 3–6 sessions for best results." },
        { question: "Is it painful?", answer: "Topical anesthesia is used for comfort." },
      ],
    },
  },
  {
    id: "facial-rejuvenation",
    category: "Aesthetic Services",
    title: "Facial Rejuvenation",
    description: "Combination of non-surgical treatments for a youthful glow.",
    icon: "FacialRejuvenationIcon",
    details: {
      heroImage: "https://source.unsplash.com/800x400/?facial,rejuvenation",
      overview:
        "Facial rejuvenation is a personalized combination of treatments including fillers, Botox, laser, and skin therapies to restore a fresh, youthful appearance without surgery.",
      idealCandidates: [
        "Patients seeking a non-surgical facial refresh",
        "Those with mild to moderate signs of aging",
        "Individuals who want minimal downtime",
        "People with realistic expectations",
      ],
      procedureOptions: ["Combination of injectables", "Laser resurfacing", "Microneedling with PRP", "Chemical peels"],
      benefits: ["Comprehensive rejuvenation", "Natural-looking results", "No general anesthesia", "Quick recovery"],
      recoveryTimeline: "Downtime 2–7 days depending on intensity; final results over 3–6 months.",
      beforeSurgery: "Avoid sun exposure and blood-thinners 1 week prior.",
      aftercare: "Sun protection, gentle skincare, and follow-up appointments.",
      risks: "Redness, swelling, or temporary discoloration; rare.",
      faqs: [
        { question: "How many sessions are needed?", answer: "Often 1–3 sessions for optimal results." },
        { question: "Is it painful?", answer: "Topical anesthesia and nerve blocks ensure comfort." },
        { question: "When can I resume normal activities?", answer: "Usually within 1 week." },
      ],
    },
  },
];
 
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
 
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
 
            {/* Right side - Service Cards (no stagger, just plain grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.map((service) => {
                const IconComponent = iconMap[service.icon] || Square3Stack3DIcon;
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
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">{service.title}</h3>
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
 
      {/* Modal / Slide-over Panel - with CSS transitions (no framer-motion) */}
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
                src={selectedService.details.heroImage}
                alt={selectedService.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-medium text-teal-200">{selectedService.category}</p>
                <h2 className="text-3xl font-bold">{selectedService.title}</h2>
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