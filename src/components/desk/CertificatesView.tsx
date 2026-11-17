import { ExternalLink, ShieldAlert } from 'lucide-react';
import { openAndTrackOfficialPortal } from '../../lib/api';
import type { PortalCategory } from '../../types';
import { PortalCard } from '../PortalCard';

interface CertificatesViewProps {
  categories: PortalCategory[];
  onPortalOpened?: () => void;
}

const CERTIFICATE_SERVICES = [
  {
    titleEn: 'Domicile Certificate (निवास प्रमाण पत्र)',
    titleHi: 'उत्तर प्रदेश स्थायी/सामान्य निवास प्रमाण पत्र आवेदन एवं मार्गदर्शन',
    descEn: 'Required to prove residence in Uttar Pradesh for legal, educational, or government matters.',
    descHi: 'उत्तर प्रदेश में निवास प्रमाणित करने हेतु आवेदन। ई-साथी या जनसेवा केंद्र (CSC) के माध्यम से आवेदन करें।',
    checklist: 'Applicant passport photo, self-declaration (स्वप्रमाणित घोषणा पत्र), Ration Card / Electricity Bill / Aadhaar copy, and mobile number for OTP.',
    url: 'https://esathi.up.gov.in',
    buttonLabel: 'Apply via Official e-Sathi UP Portal',
  },
  {
    titleEn: 'Caste Certificate (जाति प्रमाण पत्र)',
    titleHi: 'अनुसूचित जाति, अनुसूचित जनजाति एवं पिछड़ा वर्ग जाति प्रमाण पत्र',
    descEn: 'Official state-issued caste certificate processed by Tehsildar / Lekhpal verification.',
    descHi: 'तहसीलदार एवं लेखपाल सत्यापन के उपरांत जारी होने वाला आधिकारिक जाति प्रमाण पत्र।',
    checklist: 'Applicant photo, self-declaration form, Parivar Register / Khatauni or Ward Councillor/Pradhan verification where applicable.',
    url: 'https://esathi.up.gov.in',
    buttonLabel: 'Apply via Official e-Sathi UP Portal',
  },
  {
    titleEn: 'Income Certificate (आय प्रमाण पत्र)',
    titleHi: 'वार्षिक पारिवारिक आय प्रमाण पत्र आवेदन',
    descEn: 'Official income assessment certificate used for court fee exemptions, legal aid, and welfare schemes.',
    descHi: 'न्यायालय शुल्क छूट, विधिक सहायता एवं सरकारी योजनाओं हेतु वार्षिक आय प्रमाण पत्र।',
    checklist: 'Applicant photo, self-declaration form, salary slip / Khatauni / income details, and local address proof.',
    url: 'https://esathi.up.gov.in',
    buttonLabel: 'Apply via Official e-Sathi UP Portal',
  },
  {
    titleEn: 'Application Status & Certificate Verification (स्थिति एवं सत्यापन)',
    titleHi: 'आवेदन की स्थिति जांचें तथा जारी प्रमाणपत्र का ऑनलाइन सत्यापन करें',
    descEn: 'Track pending certificate applications or verify authenticity of any issued UP e-District certificate.',
    descHi: 'आवेदन संख्या डालकर प्रमाणपत्र की वर्तमान स्थिति देखें या प्रमाणपत्र आईडी से प्रमाणपत्र सत्यापित करें।',
    checklist: 'Application Number (आवेदन संख्या) and Certificate ID (प्रमाणपत्र क्रमांक) printed on the issued certificate.',
    url: 'https://edistrict.up.gov.in',
    buttonLabel: 'Check Status / Verify on e-District UP',
  },
];

export function CertificatesView({ categories, onPortalOpened }: CertificatesViewProps) {
  const edistrictCat = categories.find((c) => c.slug === 'e-district');

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#0F2342]">
          e-District UP &amp; Government Certificates · ई-डिस्ट्रिक्ट एवं प्रमाणपत्र सेवाएँ
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
          Direct official portals for UP Domicile, Caste, and Income certificates, application tracking, and
          certificate verification.
        </p>

        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
          <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-relaxed">
            <p className="font-bold">
              Important Legal &amp; Security Notice · महत्वपूर्ण सुरक्षा एवं विधिक सूचना:
            </p>
            <p className="mt-1">
              Advocate Digital Desk <strong>never issues government certificates</strong> and never collects
              e-District/CSC passwords or OTPs. Clicking any button below redirects you directly to the official
              Government of Uttar Pradesh website (<span className="font-mono">edistrict.up.gov.in</span> or{' '}
              <span className="font-mono">esathi.up.gov.in</span>). Never share your password or OTP with anyone.
            </p>
          </div>
        </div>
      </section>

      {/* Specific Certificate Cards */}
      <section className="grid md:grid-cols-2 gap-5">
        {CERTIFICATE_SERVICES.map((svc) => (
          <article
            key={svc.titleEn}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#9A6F1F] font-semibold mb-2">
                <span>External Official Website · बाहरी आधिकारिक वेबसाइट</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {svc.url.replace(/^https?:\/\//, '')}
                </span>
              </div>

              <h2 className="text-base font-bold text-[#0F2342]">{svc.titleEn}</h2>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{svc.titleHi}</p>

              <p className="text-sm text-slate-700 mt-3 leading-relaxed">{svc.descEn}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{svc.descHi}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  Information &amp; Documents Needed / आवश्यक दस्तावेज़:
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{svc.checklist}</p>
              </div>

              <p className="mt-3 text-[11px] text-amber-800 font-medium">
                Warning: Never share your e-Sathi / CSC password or mobile OTP with third parties.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  openAndTrackOfficialPortal(svc.titleEn, svc.url, undefined, true);
                  onPortalOpened?.();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{svc.buttonLabel}</span>
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Main Directory Cards */}
      {edistrictCat && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F2342]">Official e-District UP Portals</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {edistrictCat.links.map((link) => (
              <PortalCard key={link.id} portal={link} onAfterOpen={onPortalOpened} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
