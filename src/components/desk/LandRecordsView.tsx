import { Building2, Info, MapPin } from 'lucide-react';
import type { PortalCategory } from '../../types';
import { PortalCard } from '../PortalCard';

interface LandRecordsViewProps {
  categories: PortalCategory[];
  onPortalOpened?: () => void;
}

export function LandRecordsView({ categories, onPortalOpened }: LandRecordsViewProps) {
  const landCat = categories.find((c) => c.slug === 'land-records');

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#0F2342]">
          UP Bhulekh &amp; Land Record Services · उत्तर प्रदेश भूलेख एवं राजस्व सेवाएँ
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
          Access official Board of Revenue and Land Record portals of Uttar Pradesh for Khatauni (Record of Rights),
          Gata/Khasra verification, village cadastral maps (BhuNaksha), property registration (IGRS UP), and
          Nayab Tehsildar / Tehsildar revenue court tracking.
        </p>

        {/* Step-by-step Khatauni Guide */}
        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h2 className="text-sm font-bold text-[#0F2342] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
              <span>How to Search Khatauni / Gata on UP Bhulekh</span>
            </h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1 text-xs text-slate-700 leading-relaxed">
              <li>Open official portal: <span className="font-mono">upbhulekh.gov.in</span></li>
              <li>Click “खतौनी (अधिकार अभिलेख) की नकल देखें” or “रियल टाइम खतौनी की नकल देखें”.</li>
              <li>Select <strong>District (जनपद)</strong> → <strong>Tehsil (तहसील)</strong> → <strong>Village (ग्राम)</strong>.</li>
              <li>Search by Khasra/Gata Number, Khata Number, or Account Holder Name &amp; enter CAPTCHA.</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>Important Privacy &amp; Legal Verification Note</span>
            </h2>
            <p className="text-xs text-amber-900 mt-2 leading-relaxed">
              This desk does not store sensitive landholder Aadhaar or banking details. Online Bhulekh copies are
              for reference only — for filing before Civil Court, High Court, or Revenue authorities, always obtain
              a digitally signed certified Khatauni from Tehsil or an authorised Jan Seva Kendra (CSC).
            </p>
          </div>
        </div>
      </section>

      {/* Official Portals Grid */}
      {landCat && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2342]">
            Official UP Land &amp; Revenue Portals · आधिकारिक भूलेख एवं राजस्व पोर्टल
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {landCat.links.map((link) => (
              <PortalCard key={link.id} portal={link} onAfterOpen={onPortalOpened} />
            ))}
          </div>
        </section>
      )}

      {/* Dedicated Nayab Tehsildar & Tehsil-Related Services Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="w-6 h-6 text-[#0F2342] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-[#0F2342]">
              Nayab Tehsildar &amp; Tehsil-Related Services · नायब तहसीलदार एवं तहसील सेवाएँ
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Clear procedural guidance on what is available online via official UP portals vs. what requires physical Tehsil appearance.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#0F2342]">
              1. Mutation (Daakhil-Kharij · दाखिल-खारिज u/s 34)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>Online Tracking:</strong> Use <span className="font-mono">vaad.up.nic.in</span> (RCCMS) and select
              Court of Nayab Tehsildar / Tehsildar to view hearing dates, proclamation status, Lekhpal report, and orders.
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              <strong>Note:</strong> Uncontested deeds registered via IGRS often auto-trigger mutation; contested objections
              must be filed physically before the concerned Nayab Tehsildar / Tehsildar court.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#0F2342]">
              2. Land Demarcation (Paimaish · धारा 24 पैमाइश)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>Official Process:</strong> Applications under Section 24 of the UP Revenue Code, 2006 are filed
              before the Sub-Divisional Magistrate (SDM) with certified Khatauni, BhuNaksha map, and prescribed treasury challan.
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Once registered in RCCMS, hearing dates and Revenue Inspector / Lekhpal reports can be tracked on{' '}
              <span className="font-mono">vaad.up.nic.in</span>.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#0F2342]">
              3. Certified Copies &amp; Varasat (विरासत / नकल)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>Varasat (Succession):</strong> Applications for undisputed succession (PA-11) are processed via
              Revenue Department / Lekhpal &amp; Revenue Inspector verification and e-District/CSC.
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              <strong>Court File Certified Copy:</strong> Must be applied through the Tehsil Record Room / Copying Section
              (नकल सवाल) when online order copies are not digitally signed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
