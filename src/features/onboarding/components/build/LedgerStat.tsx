import { useCountUp } from "@/hooks/useCountUp";

export interface LedgerStatProps {
  label: string;
  target: number;
  /** Begin the count-up. When false, snaps straight to the target. */
  run: boolean;
}

/** A single ledger metric that counts up as its phase begins. */
export function LedgerStat({ label, target, run }: LedgerStatProps) {
  const value = useCountUp(target, run, 2400);
  return (
    <div className="min-w-[72px] text-center md:min-w-[92px]">
      <div
        className="text-[32px] font-semibold leading-none tabular-nums text-white md:text-[48px]"
        style={{ textShadow: "0 2px 24px rgba(120,28,2,0.45)" }}
      >
        {value.toLocaleString()}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/70 md:text-[11px]">
        {label}
      </div>
    </div>
  );
}
