import { TICKER_ITEMS } from "@/lib/constants/storefront";

export function AnnouncementTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden bg-accent py-3">
      <div className="animate-ticker flex w-max gap-0">
        {items.map((text, index) => (
          <span key={`${text}-${index}`} className="flex shrink-0 items-center">
            <span className="px-8 text-[10px] font-medium uppercase tracking-[0.25em] text-white/90 sm:text-[11px]">
              {text}
            </span>
            <span className="text-white/40" aria-hidden>
              ◈
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
