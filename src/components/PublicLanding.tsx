
import { ArrowRight, BookOpen, Calendar, ExternalLink, FolderLock, Landmark, Scale, ShieldCheck, Users } from 'lucide-react';
import emblem from '../assets/images/advocate_desk_emblem_1794899867768.jpg';
import courtyard from '../assets/images/chambers_courtyard_arch_1794899890524.jpg';

interface PublicLandingProps {
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
}

const VERIFIED_PORTAL_PREVIEW = [
  {
    name: 'Allahabad High Court & Lucknow Bench',
    nameHi: 'इलाहाबाद उच्च न्यायालय एवं लखनऊ पीठ',
    url: 'https://www.allahabadhighcourt.in',
  },
  {
    name: 'eCourts Services & District Court Lucknow',
    nameHi: 'ई-कोर्ट्स एवं जनपद न्यायालय लखनऊ',
    url: 'https://services.ecourts.gov.in',
  },
  {
    name: 'UP Bhulekh & Vaad (RCCMS) Revenue Courts',
    nameHi: 'यूपी भूलेख एवं राजस्व न्यायालय (वाद)',
    url: 'https://upbhulekh.gov.in',
  },
  {
    name: 'e-District UP & e-Sathi Certificates',
    nameHi: 'ई-डिस्ट्रिक्ट एवं ई-साथी प्रमाणपत्र सेवाएँ',
    url: 'https://edistrict.up.gov.in',
  },
];

export function PublicLanding({ onNavigate, isAuthenticated }: PublicLandingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="text-lg font-bold tracking-tight text-[#0F2342] whitespace-nowrap shrink-0"
          >
            Advocate Digital Desk
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Primary">
            <a href="#services" className="hover:text-[#0F2342] transition-colors whitespace-nowrap shrink-0">
              Services
            </a>
            <a href="#official-portals" className="hover:text-[#0F2342] transition-colors whitespace-nowrap shrink-0">
              Official Portals
            </a>
            <a href="#privacy" className="hover:text-[#0F2342] transition-colors whitespace-nowrap shrink-0">
              Security
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="hover:text-[#0F2342] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(isAuthenticated ? '/desk' : '/login')}
              className="px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-[#0F2342] hover:bg-[#162D54] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAuthenticated ? 'Open My Desk' : 'Open Chambers Desk'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={emblem}
                  alt="Advocate Digital Desk emblem"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="text-xs font-medium text-slate-600">
                  <span>Lucknow &amp; Uttar Pradesh Legal Practice</span>
                  <span aria-hidden="true" className="mx-2">·</span>
                  <span>English &amp; हिन्दी</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F2342] leading-[1.15]">
                All Essential Legal Services in One Place.
              </h1>
              <p className="text-lg font-medium text-[#9A6F1F] mt-3">
                अधिवक्ता डिजिटल डेस्क — उत्तर प्रदेश · सभी आवश्यक न्यायिक एवं राजस्व सेवाएँ एक ही स्थान पर।
              </p>
              <p className="text-base text-slate-600 mt-4 leading-relaxed max-w-2xl">
                Built specifically for experienced advocates practising at the Allahabad High Court (Lucknow Bench),
                District &amp; Civil Courts in Lucknow, and UP Revenue Courts. Open verified official government websites
                with one click, and keep your private case diary, client records, hearings, and documents safely organised.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(isAuthenticated ? '/desk' : '/login')}
                  className="min-h-[48px] px-6 py-3 bg-[#0F2342] hover:bg-[#162D54] text-white text-base font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In / लॉगिन करें'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="min-h-[48px] px-6 py-3 bg-white hover:bg-slate-50 text-[#0F2342] border border-slate-300 text-base font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Create Chambers Account · नया खाता बनाएँ
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500 leading-relaxed max-w-xl">
                Important Notice: Advocate Digital Desk – Uttar Pradesh is an independent private productivity platform.
                It is not affiliated with any court or government department and never stores government portal passwords or OTPs.
              </p>
            </div>

            <div className="lg:col-span-5 flex">
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[260px]">
                <img
                  src={courtyard}
                  alt="Classical sandstone colonnade courtyard representing Uttar Pradesh legal chambers"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F2342]/90 via-[#0F2342]/50 to-transparent p-5 text-white">
                  <p className="text-sm font-semibold">High Court · Civil Court · Tehsil &amp; Revenue Desk</p>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Structured in Indian Standard Time (IST · Asia/Kolkata)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2342]">
              Designed for Everyday Chambers Practice
            </h2>
            <p className="text-slate-600 mt-2">
              Simple bilingual labels, large readable buttons, and direct official links without technical confusion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Scale,
                title: 'High Court & Civil Court Links',
                titleHi: 'उच्च न्यायालय व जनपद न्यायालय सेवाएँ',
                desc: 'Direct one-click shortcuts to Allahabad High Court, Lucknow Bench, eLegalix, District Court Lucknow, and eCourts.',
              },
              {
                icon: Landmark,
                title: 'UP Bhulekh & Tehsil Revenue',
                titleHi: 'यूपी भूलेख, खतौनी एवं नायब तहसीलदार वाद',
                desc: 'Official portals for Khatauni, BhuNaksha, RCCMS Vaad mutation cases, IGRS UP, and clear Nayab Tehsildar guidance.',
              },
              {
                icon: BookOpen,
                title: 'e-District UP Certificates',
                titleHi: 'निवास, जाति एवं आय प्रमाणपत्र सेवाएँ',
                desc: 'Direct links to e-District & e-Sathi with clear document checklists and strict OTP safety reminders.',
              },
              {
                icon: Calendar,
                title: 'Case Diary & IST Hearing Calendar',
                titleHi: 'वाद प्रबंधन व सुनवाई कैलेंडर',
                desc: 'Track High Court, Civil Court, and Revenue matters with hearing history, private notes, and IST reminders.',
              },
              {
                icon: Users,
                title: 'Client Directory & Case Linking',
                titleHi: 'मुवक्किल विवरण व वाद संबंध',
                desc: 'Maintain organised client contact records linked across multiple cases and confidential documents.',
              },
              {
                icon: FolderLock,
                title: 'Private Document Vault',
                titleHi: 'सुरक्षित दस्तावेज़ संग्रह',
                desc: 'Store petitions, orders, Khataunis, and Vakalatnamas privately — accessible only after authenticated sign-in.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-6">
                  <Icon className="w-6 h-6 text-[#0F2342]" aria-hidden="true" />
                  <h3 className="text-base font-bold text-[#0F2342] mt-4">{item.title}</h3>
                  <p className="text-xs font-medium text-[#9A6F1F] mt-0.5">{item.titleHi}</p>
                  <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="official-portals" className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0F2342]">Verified Official Portals Included</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Every government and court shortcut opens the genuine official website in a new browser tab.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#9A6F1F]">External Official Websites</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VERIFIED_PORTAL_PREVIEW.map((portal) => (
                <a
                  key={portal.url}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-slate-200 rounded-xl p-4 hover:border-[#0F2342] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>External Official Website</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F2342]" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-[#0F2342] mt-2">{portal.name}</p>
                    <p className="text-xs text-slate-600 mt-1">{portal.nameHi}</p>
                  </div>
                  <p className="font-mono text-xs text-[#9A6F1F] mt-3 truncate">{portal.url}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-[#0F2342] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-2xl">
              <ShieldCheck className="w-8 h-8 text-[#D4AF37] shrink-0 mt-1" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-bold">Confidential Chambers Privacy &amp; Security</h2>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                  All case records, client details, private notes, and uploaded files remain strictly behind authenticated
                  chambers login and are blocked from search engine indexing. We never store your court or e-District
                  passwords, OTPs, or scrape official portals.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(isAuthenticated ? '/desk' : '/login')}
              className="min-h-[44px] px-5 py-2.5 bg-[#C59B3B] hover:bg-[#b48a2d] text-[#0F2342] font-bold text-sm rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Sign In Now'}
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>Advocate Digital Desk – Uttar Pradesh · Private Legal Chambers Productivity Platform</p>
          <p>Not an official Government of India, UP Government, or High Court website.</p>
        </div>
      </footer>
    </div>
  );
}
