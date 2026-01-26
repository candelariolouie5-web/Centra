import React from "react";
import Footer from "../../components/Footer";
 
export default function FAQSection() {
  const faqs = [
    {
      question: "What services does Centra Clinic PH offer?",
      answer:
        "Centra Clinic PH provides comprehensive outpatient services including general consultation, diagnostics, preventive care, and electronic medical record (EMR) management."
    },
    {
      question: "How do I book an appointment?",
      answer:
        "You can book an appointment online through our booking system by selecting your preferred date, time, and doctor."
    },
    {
      question: "Can I book the same date and time as another patient?",
      answer:
        "No. Once a date and time slot is booked, it will automatically become unavailable to avoid double bookings."
    },
    {
      question: "Do you accept walk-in patients?",
      answer:
        "Yes, we accept walk-in patients depending on availability. However, booking online is highly recommended."
    },
    {
      question: "Is my medical information secure?",
      answer:
        "Yes. Centra Clinic PH uses a secure EMR system to ensure confidentiality and protection of patient data."
    },
    {
      question: "What are the clinic’s operating hours?",
      answer:
        "The clinic is open from Monday to Saturday, 8:00 AM to 6:00 PM."
    }
  ];
 
  return (
    <>
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
 
        {/* FAQ List */}
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="grid md:grid-cols-2 gap-6 border-b border-gray-200 pb-8"
            >
              {/* Question */}
              <h3 className="text-gray-900 font-semibold text-lg">
                {faq.question}
              </h3>
 
              {/* Answer */}
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  <Footer />
  </>
  );
}