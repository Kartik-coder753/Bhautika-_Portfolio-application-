import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Users, 
  Award, 
  GraduationCap,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 'career-guidance',
    title: "1:1 Career Guidance",
    icon: <Users className="w-12 h-12" />,
    image: "https://github.com/user-attachments/assets/3f0cd2b5-9939-4409-a8b9-e747df3086c3",
    description: "Personalised sessions to help you map your physiotherapy journey abroad. We provide a clear roadmap tailored to your specific goals and current situation.",
    longDescription: "Our 1:1 sessions are designed for physiotherapists who want to take their careers to the next level internationally. We cover everything from choosing the right country to navigating the complex licensing processes. Whether you're looking at the UK, Ireland, Australia, or New Zealand, we have the expertise to guide you.",
    features: [
      "Country-specific career roadmap (UK, Ireland, Australia, New Zealand, etc.)",
      "Early preparation strategy (before & during studies)",
      "Licensing guidance: HCPC, CORU, APC, and more",
      "Application & interview preparation (NHS + private sector)",
      "Visa pathway and sponsorship advice"
    ],
    quote: "Get clarity, confidence, and a structured plan to fast-track your global physio career."
  },
  {
    id: 'workshops',
    title: "Workshops & Certifications",
    icon: <Award className="w-12 h-12" />,
    image: "https://github.com/user-attachments/assets/f5179061-87d1-4865-8633-c2daa562469e",
    description: "Gain global recognition through additional training and certifications curated for international standards. Stay ahead of the curve with evidence-based practice.",
    features: [
      "Certificate courses for career advancement",
      "Skills enhancement for clinical and non-clinical growth",
      "Evidence-based practice updates",
      "Global networking opportunities"
    ],
    quote: "Empower yourself with the skills that international employers are looking for."
  },
  {
    id: 'early-prep',
    title: "Early Preparation Guidance",
    icon: <GraduationCap className="w-12 h-12" />,
    image: "https://github.com/user-attachments/assets/0309ba5d-0fc1-4edc-a253-18fcfd5107e4",
    description: "Plan smarter before you move abroad. Learn what to prepare before and during your studies to secure your first sponsored job offer.",
    longDescription: "The most successful international transitions start early. We help students and early-career physios understand the landscape before they even set foot abroad. This proactive approach saves thousands in fees and months of confusion.",
    features: [
      "What to prepare before studying overseas",
      "How to apply for your HCPC while studying",
      "Steps to secure your first sponsored job offer",
      "How to save thousands on visa extensions and loans",
      "Strategic networking for students"
    ],
    quote: "A shorter, smoother, and smarter journey starts with early preparation."
  },
  {
    id: 'clinical',
    title: " From Application to Arrival—We’ve Got You Covered",
    icon: <Stethoscope className="w-12 h-12" />,
    image: "https://github.com/user-attachments/assets/d328cfad-0bd2-4a76-b67d-e6f2fa59c849",
    description: "We don’t just look at rankings; we analyze your career goals, budget, and profile to find the institution where you will thrive.",
    longDescription: "We believe that studying abroad should be an exciting step, not a stressful process. Our integrated services are designed to manage the details so you can focus on your future.",
    features: [
      "Strategic Course & University Selection",
      "Simplified Student Loans & Financing",
      "Global Visa Application Support",
      "Post-Arrival Guidance",
    ],
    quote: "Quality clinical care is the foundation of a successful physiotherapy career."
  }
];

const ServicesPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 font-semibold mb-8 hover:text-blue-700 transition-colors group"
        >
          <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Home
        </Link>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Our <span className="text-blue-600">Specialized</span> Services
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive guidance and mentorship designed to empower physiotherapists for global success.
          </p>
        </header>

        <div className="space-y-24">
          {services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className={idx % 2 !== 0 ? 'lg:order-2' : ''}>
                <div className="relative group">
                  <div className="w-full h-[28rem] rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                    {service.icon}
                  </div>
                </div>
              </div>

              <div className={idx % 2 !== 0 ? 'lg:order-1' : ''}>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{service.title}</h2>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {service.longDescription}
                </p>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">What's Included:</h3>
                  <ul className="space-y-4">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start text-slate-700">
                        <CheckCircle2 className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <blockquote className="border-l-4 border-blue-600 pl-6 py-2 italic text-slate-700 text-lg font-medium mb-8">
                  "{service.quote}"
                </blockquote>

                <Link 
                  to="/#booking" 
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all group"
                >
                  Book This Service
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
