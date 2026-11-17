import { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { openAndTrackOfficialPortal } from '../../lib/api';
import type { PortalCategory } from '../../types';
import { PortalCard } from '../PortalCard';

interface CourtServicesViewProps {
  categories: PortalCategory[];
  onPortalOpened?: () => void;
}

export function CourtServicesView({ categories, onPortalOpened }: CourtServicesViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'high-court' | 'civil-court'>('all');

  const highCourtCat = categories.find((c) => c.slug === 'high-court');
  const civilCourtCat = categories.find((c) => c.slug === 'civil-court');
  const legalRefCat = categories.find((c) => c.slug === 'legal-reference');

  return (
    <div className="space-y-8">
      {/* Header & Honest Guidance */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2342]">
              High Court &amp; Civil Court Official Services
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              उच्च न्यायालय (लखनऊ पीठ एवं इलाहाबाद) तथा दीवानी/जनपद न्यायालय लखनऊ की आधिकारिक सेवाएँ
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {[
              { id: 'all', label: 'All Courts' },
              { id: 'high-court', label: 'High Court' },
              { id: 'civil-court', label: 'Civil & District Court' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'all' | 'high-court' | 'civil-court')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0F2342] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F2342]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <Info className="w-4 h-4 text-[#0F2342] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#0F2342]">
              How Official Court Portals Work · आधिकारिक कोर्ट पोर्टल उपयोग निर्देश:
            </p>
            <p className="mt-1">
              Every button below opens the authentic court website in a new browser tab. Official court portals
              require you to manually enter your Case Number, 16-digit CNR Number, Party Name, or CAPTCHA directly
              on their website. This desk does not scrape court websites or bypass CAPTCHAs.
            </p>
          </div>
        </div>
      </section>

      {/* High Court Section */}
      {(activeTab === 'all' || activeTab === 'high-court') && highCourtCat && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F2342]">{highCourtCat.nameEn}</h2>
            <p className="text-sm text-[#9A6F1F] font-medium">{highCourtCat.nameHi}</p>
            <p className="text-sm text-slate-600 mt-1">{highCourtCat.descriptionEn}</p>
          </div>

          {/* Quick Task Guide for High Court */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#0F2342] mb-3">
              Quick Shortcut Guide — Allahabad High Court &amp; Lucknow Bench
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                {
                  task: 'Case Status (Lucknow Bench) · वाद स्थिति',
                  portal: 'hclko.allahabadhighcourt.in',
                  url: 'https://hclko.allahabadhighcourt.in',
                },
                {
                  task: 'Daily Cause Lists & Fresh Lists · दैनिक वाद सूची',
                  portal: 'hclko.allahabadhighcourt.in',
                  url: 'https://hclko.allahabadhighcourt.in',
                },
                {
                  task: 'Daily Orders & Judgments · आदेश एवं निर्णय (eLegalix)',
                  portal: 'elegalix.allahabadhighcourt.in',
                  url: 'https://elegalix.allahabadhighcourt.in/',
                },
                {
                  task: 'Allahabad Main Seat Portal · मुख्य पीठ इलाहाबाद',
                  portal: 'www.allahabadhighcourt.in',
                  url: 'https://www.allahabadhighcourt.in',
                },
                {
                  task: 'Court Calendar & Notices · कैलेंडर एवं सूचनाएँ',
                  portal: 'www.allahabadhighcourt.in',
                  url: 'https://www.allahabadhighcourt.in',
                },
                {
                  task: 'National High Court Judgments · राष्ट्रीय निर्णय खोज',
                  portal: 'judgments.ecourts.gov.in',
                  url: 'https://judgments.ecourts.gov.in',
                },
              ].map((item) => (
                <button
                  key={item.task}
                  type="button"
                  onClick={() => {
                    openAndTrackOfficialPortal(item.task, item.url, undefined, true);
                    onPortalOpened?.();
                  }}
                  className="text-left p-3 rounded-lg border border-slate-200 hover:border-[#0F2342] hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F2342] truncate">{item.task}</p>
                    <p className="font-mono text-[11px] text-slate-500 mt-0.5 truncate">{item.portal}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {highCourtCat.links.map((link) => (
              <PortalCard key={link.id} portal={link} onAfterOpen={onPortalOpened} />
            ))}
          </div>
        </section>
      )}

      {/* Civil & District Court Section */}
      {(activeTab === 'all' || activeTab === 'civil-court') && civilCourtCat && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F2342]">{civilCourtCat.nameEn}</h2>
            <p className="text-sm text-[#9A6F1F] font-medium">{civilCourtCat.nameHi}</p>
            <p className="text-sm text-slate-600 mt-1">{civilCourtCat.descriptionEn}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 space-y-2">
            <h3 className="font-bold text-[#0F2342]">
              Which District Court Portal Should You Use? · कौन सा पोर्टल चुनें?
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>For Case Status, CNR Search, Case History &amp; Orders:</strong> Use{' '}
                <span className="font-mono text-[#0F2342]">services.ecourts.gov.in</span> — select Uttar Pradesh →
                Lucknow → Court Complex (Kaiserbagh / Collectorate / Mohanlalganj), or enter the 16-digit CNR directly.
              </li>
              <li>
                <strong>For Lucknow Court Complex Notices, Judicial Directory &amp; Local Calendar:</strong> Use{' '}
                <span className="font-mono text-[#0F2342]">lucknow.dcourts.gov.in</span>.
              </li>
              <li>
                <strong>For Daily Cause Lists across Establishments:</strong> Open{' '}
                <span className="font-mono text-[#0F2342]">ecourts.gov.in</span> or{' '}
                <span className="font-mono text-[#0F2342]">services.ecourts.gov.in</span> and select “Cause List”.
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {civilCourtCat.links.map((link) => (
              <PortalCard key={link.id} portal={link} onAfterOpen={onPortalOpened} />
            ))}
          </div>
        </section>
      )}

      {/* Statutory Acts & Bar Council */}
      {activeTab === 'all' && legalRefCat && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F2342]">{legalRefCat.nameEn}</h2>
            <p className="text-sm text-[#9A6F1F] font-medium">{legalRefCat.nameHi}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {legalRefCat.links.map((link) => (
              <PortalCard key={link.id} portal={link} onAfterOpen={onPortalOpened} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
