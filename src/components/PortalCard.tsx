import { ExternalLink, ShieldAlert } from 'lucide-react';
import { openAndTrackOfficialPortal } from '../lib/api';
import type { PortalLink } from '../types';

interface PortalCardProps {
  portal: PortalLink;
  trackRemote?: boolean;
  onAfterOpen?: () => void;
}

export function PortalCard({ portal, trackRemote = true, onAfterOpen }: PortalCardProps) {
  const handleOpen = () => {
    openAndTrackOfficialPortal(portal.titleEn, portal.url, portal.id, trackRemote);
    if (onAfterOpen) onAfterOpen();
  };

  return (
    <article className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 hover:border-[#0F2342]/40 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 mb-2">
          <span className="font-semibold text-[#9A6F1F] tracking-tight">
            External Official Website · बाहरी आधिकारिक वेबसाइट
          </span>
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[180px]">
            {portal.url.replace(/^https?:\/\//, '')}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#0F2342] leading-snug">{portal.titleEn}</h3>
        <p className="text-sm font-medium text-slate-700 mt-0.5">{portal.titleHi}</p>

        <p className="text-xs text-slate-500 mt-2">
          Official Agency: <span className="text-slate-700 font-medium">{portal.officialAgency}</span>
        </p>

        <p className="text-sm text-slate-700 mt-3 leading-relaxed">{portal.descriptionEn}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{portal.descriptionHi}</p>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-800">
            Information You Need to Enter / आवश्यक जानकारी:
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{portal.requiredInputsEn}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{portal.requiredInputsHi}</p>
        </div>

        {portal.safetyNoteEn && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium leading-snug">{portal.safetyNoteEn}</p>
              {portal.safetyNoteHi && (
                <p className="text-amber-800 mt-0.5 leading-snug">{portal.safetyNoteHi}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleOpen}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B48327] cursor-pointer"
        >
          <span>Open Official Website · वेबसाइट खोलें</span>
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
