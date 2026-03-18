import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Linkedin, 
  Youtube, 
  Menu, 
  X, 
  ChevronRight, 
  MapPin, 
  GraduationCap, 
  Award, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Globe,
  Users,
  Activity,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, Routes, Route } from 'react-router-dom';
import { db, auth, signIn, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ServicesPage from './ServicesPage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const isAdmin = user?.email === "kartikks1205@gmail.com";

  const navLinks = [
    { name: 'Home', href: isHomePage ? '#home' : '/' },
    { name: 'About', href: isHomePage ? '#about' : '/#about' },
    { name: 'Services', href: '/services' },
    { name: 'Story', href: isHomePage ? '#story' : '/#story' },
    { name: 'Booking', href: isHomePage ? '#booking' : '/#booking' },
    ...(isAdmin ? [{ name: 'Dashboard', href: '/admin' }] : []),
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled || !isHomePage ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-blue-600/20">
              <HeartPulse size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className={cn(
                "text-2xl font-black tracking-tighter transition-colors",
                scrolled || !isHomePage ? "text-blue-900" : "text-white"
              )}>
                BHAUTIKA
              </span>
              <span className={cn(
                "text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
                scrolled || !isHomePage ? "text-blue-600" : "text-blue-300"
              )}>
                Physiotherapy
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              link.href.startsWith('#') || (link.href.startsWith('/#') && isHomePage) ? (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-500",
                    scrolled || !isHomePage ? "text-gray-700" : "text-white/90"
                  )}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-500",
                    scrolled || !isHomePage ? "text-gray-700" : "text-white/90"
                  )}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-md",
                scrolled ? "text-gray-700" : "text-white"
              )}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                link.href.startsWith('#') || (link.href.startsWith('/#') && isHomePage) ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '1:1 Career Guidance',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', service: '1:1 Career Guidance', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Your Session</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              required
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          >
            <option>1:1 Career Guidance</option>
            <option>Workshop & Certification</option>
            <option>Early Preparation Guidance</option>
            <option>Clinical Consultation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Tell us more about your goals..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
        </div>
        <button
          disabled={status === 'loading'}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Book Now</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
        {status === 'success' && (
          <p className="text-green-600 text-center font-medium">Booking successful! We'll contact you soon.</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-center font-medium">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email === "kartikks1205@gmail.com") {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBookings(data);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'bookings');
        });
        return () => unsubscribeSnap();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.email !== "kartikks1205@gmail.com") {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
          <HeartPulse className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Admin Access</h2>
          <p className="text-slate-600 mb-8">Please sign in with your authorized admin account to view the booking database.</p>
          <button 
            onClick={signIn}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <Globe size={20} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Booking <span className="text-blue-600">Database</span></h2>
            <p className="text-slate-600 mt-2">Manage all incoming client sessions and consultations.</p>
          </div>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20">
            {bookings.length} Total Bookings
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-900 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                      No bookings found yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-900">{booking.name}</div>
                        <div className="text-sm text-slate-500">{booking.email}</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                          {booking.service}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-600">
                        {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm text-slate-600 max-w-xs line-clamp-2">{booking.message || '-'}</p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Booking"
                        >
                          <X size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://github.com/user-attachments/assets/0ec2b42c-341c-4e32-b9e8-5cd876959f1b" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm border border-blue-500/30">
              Chartered Physiotherapist
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Helping Physios Build <span className="text-blue-400">Global Careers</span> 🌍
            </h1>
            <p className="text-xl text-blue-100/80 mb-10 leading-relaxed max-w-xl">
              Empowering physiotherapists to find their best career pathway — from local success to international recognition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#booking" 
                className="px-8 py-4 bg-white text-blue-950 font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center group"
              >
                Book 1:1 Session
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <a 
                href="#services" 
                className="px-8 py-4 bg-blue-900/40 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-blue-900/60 transition-all flex items-center justify-center"
              >
                Explore Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://github.com/user-attachments/assets/c625a567-aa4c-4ea9-b553-555c8159f5e7" 
                  alt="Nirupama Bhatt - Senior Physiotherapist & Mentor" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-8 rounded-3xl shadow-xl hidden md:block">
                <p className="text-4xl font-bold mb-1">100+</p>
                <p className="text-blue-100 font-medium">Physios Mentored</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Meet Your Mentor</h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Nirupama Bhatt</h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Hi, I’m Nirupama Bhatt, an HCPC-registered Senior Musculoskeletal Physiotherapist (UK) and mentor to 100+ physiotherapists worldwide. My mission is simple: to help physios like you confidently navigate your career abroad, earn your worth, and grow with purpose.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you’re preparing for your HCPC, CORU, or APC licence, or exploring opportunities in the UK, Ireland, or Australia — I’ll guide you with a clear roadmap, hands-on mentorship, and insider strategies that actually work.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Senior MSK Physio</h4>
                    <p className="text-slate-500 text-sm">UK-based Specialist</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Global Mentor</h4>
                    <p className="text-slate-500 text-sm">International Reach</p>
                  </div>
                </div>
              </div>

              <blockquote className="border-l-4 border-blue-600 pl-6 py-2 italic text-slate-700 text-xl font-medium mb-8">
                "If I could land my first sponsored physio job in the UK while on a student visa — you can too."
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Our Services</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Tailored Guidance for Your Global Journey</h3>
            <p className="text-lg text-slate-600">
              Get clarity, confidence, and a structured plan to fast-track your global physio career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: "career-guidance",
                title: "1:1 Career Guidance",
                icon: <Users className="w-8 h-8" />,
                image: "https://github.com/user-attachments/assets/3f0cd2b5-9939-4409-a8b9-e747df3086c3",
                description: "Personalised sessions to help you map your physiotherapy journey abroad.",
                features: ["Country roadmap (UK, IE, AU)", "Licensing: HCPC, CORU, APC", "Interview prep (NHS + Private)"]
              },
              {
                id: "workshops",
                title: "Workshops & Certifications",
                icon: <Award className="w-8 h-8" />,
                image: "https://github.com/user-attachments/assets/f5179061-87d1-4865-8633-c2daa562469e",
                description: "Gain global recognition through additional training curated for international standards.",
                features: ["CPD workshops", "Certificate courses", "Clinical skills enhancement"]
              },
              {
                id: "early-prep",
                title: "Early Prep Guidance",
                icon: <GraduationCap className="w-8 h-8" />,
                image: "https://github.com/user-attachments/assets/0309ba5d-0fc1-4edc-a253-18fcfd5107e4",
                description: "Plan smarter before you move abroad. Learn steps to secure your first offer.",
                features: ["Pre-study preparation", "HCPC while studying", "Job search strategies"]
              },
              {
                id: "clinical",
                title: "Clinical Consultation",
                icon: <Stethoscope className="w-8 h-8" />,
                image: "https://github.com/user-attachments/assets/d328cfad-0bd2-4a76-b67d-e6f2fa59c849",
                description: "Expert MSK assessment and treatment plans for patients and clinicians.",
                features: ["MSK Assessment", "Treatment Planning", "Clinical Mentorship"]
              }
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  to="/services"
                  className="block bg-white rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group overflow-hidden h-full flex flex-col"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-bold flex items-center">
                        View Details <ArrowRight className="ml-2" size={18} />
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {service.icon}
                    </div>
                  </div>
                  <div className="p-8 flex-grow">
                    <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{service.title}</h4>
                    <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center text-slate-700 text-sm">
                          <CheckCircle2 className="text-blue-500 mr-2 flex-shrink-0" size={16} />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                      Learn More <ArrowRight className="ml-2" size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              to="/services" 
              className="inline-flex items-center px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              View All Services
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-24 bg-blue-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/20 skew-x-12 transform translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">My Story</h2>
              <h3 className="text-4xl font-bold mb-8 leading-tight">From Student Visa to Sponsored Job 🇬🇧</h3>
              <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                I landed my first sponsored physiotherapy job in the UK while still on a student visa — a move that saved me over £6,000 on post-study work visa fees and helped my partner and me repay our £20,000 education loan within just a year.
              </p>
              
              <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10">
                <img 
                  src="https://github.com/user-attachments/assets/0309ba5d-0fc1-4edc-a253-18fcfd5107e4" 
                  alt="Nirupama Bhatt - Graduation" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <div className="space-y-6">
                {[
                  "I applied for my HCPC licence early, even before my MSc.",
                  "I applied to NHS & private clinics daily from day one.",
                  "I followed up consistently, showcasing my extra value.",
                  "I stayed proactive and never gave up."
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-blue-50/90">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/10"
            >
              <h4 className="text-2xl font-bold mb-6">Why This Matters</h4>
              <p className="text-blue-100/80 mb-8 leading-relaxed italic">
                "That persistence changed everything. Today, I’m here to help you do the same — with a shorter, smoother, and smarter journey."
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-3xl font-bold text-blue-400 mb-1">£6k+</p>
                  <p className="text-xs text-blue-200 uppercase tracking-wider">Saved in Fees</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-3xl font-bold text-blue-400 mb-1">1 Year</p>
                  <p className="text-xs text-blue-200 uppercase tracking-wider">Loan Repayment</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Work With Me</h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-8">Ready to Start Your Journey?</h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Let’s create your personalized roadmap to success. Whether you're just starting to think about moving abroad or you're already in the process, I can help you save time and money.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Flexible Scheduling</h4>
                    <p className="text-slate-500">Book a time that works for you.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Expert Insights</h4>
                    <p className="text-slate-500">Real-world experience from the UK.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Testimonials</h4>
                <div className="space-y-6">
                  <div className="italic text-slate-600">
                    "Nirupama helped me understand the exact steps for HCPC and my UK job search. I landed an interview within weeks!"
                    <p className="mt-2 font-bold text-slate-900 not-italic">— Physiotherapist, India</p>
                  </div>
                </div>
              </div>
            </div>

            <BookingForm />
          </div>
        </div>
      </section>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-2xl font-bold mb-6">BHAUTIKA</h4>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Empowering physiotherapists to build global careers through mentorship, guidance, and clinical excellence.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/__bhautika__" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/nirupama-bhatt-01aa7b224" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com/@__bhautika__" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h5>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">Book Session</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 uppercase tracking-wider text-sm">Contact</h5>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center">
                <MapPin size={16} className="mr-2 text-blue-500" />
                United Kingdom
              </li>
              <li className="flex items-center">
                <Globe size={16} className="mr-2 text-blue-500" />
                @bhautika
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} BHAUTIKA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
