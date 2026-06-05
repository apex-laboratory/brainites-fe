import { AppLogo } from "@/components/shared/AppLogo";
import { AppIcon } from "@/components/shared/AppIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { WELCOME_CARDS } from "@/features/onboarding/data/onboarding-fixtures";

/** Onboarding welcome: centered intro with three setup-preview cards. */
export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative grid min-h-full place-items-center bg-ivory">
      <div className="absolute left-11 top-[30px]">
        <AppLogo size="md" />
      </div>

      <div className="w-[880px] max-w-[92%] px-6 py-16 text-center md:px-10">
        <SectionLabel className="motion-safe:animate-fade-up">
          Welcome to {BRAND.name}
        </SectionLabel>
        <h1 className="mt-[18px] text-[40px] font-bold leading-[1.0] tracking-tight text-ink motion-safe:animate-fade-up md:text-[60px]">
          Let&apos;s build{" "}
          <span className="text-brand-ink">{BRAND.workspace}&apos;s</span> brain
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.5] text-ink-3 motion-safe:animate-fade-up md:text-[19px]">
          In three quick steps, we&apos;ll turn the knowledge buried in your
          tools into a brain your team and agents can ask.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-3.5 text-left motion-safe:animate-fade-up sm:grid-cols-3">
          {WELCOME_CARDS.map((card, i) => (
            <Card key={card.t} className="p-[22px]">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 flex-none place-items-center rounded-[9px] bg-brand-soft text-brand-ink">
                  <AppIcon name={card.icon} size={18} />
                </span>
                <span className="tnum text-[12.5px] font-bold text-ink-4">
                  0{i + 1}
                </span>
              </div>
              <div className="mt-3.5 text-[15.5px] font-bold tracking-tight text-ink">
                {card.t}
              </div>
              <div className="mt-[5px] text-[13.5px] leading-[1.5] text-ink-3">
                {card.d}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center motion-safe:animate-fade-up">
          <Button size="lg" onClick={onNext}>
            Get started
            <AppIcon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
