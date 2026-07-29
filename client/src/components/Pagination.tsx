import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../lib/useLanguage';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  const { isRtl } = useLanguage();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40"
      >
        <PrevIcon size={16} />
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
          <button
            onClick={() => onChange(p)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
              p === page ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40"
      >
        <NextIcon size={16} />
      </button>
    </div>
  );
}
