import { cn } from "@/utils/cn";
import { AppIcon } from "@/components/shared/AppIcon";
import { Input } from "@/components/ui/input";
import {
  OTHER_USE_CASE,
  TEAM_SIZES,
  USE_CASES,
} from "@/features/onboarding/data/onboarding-fixtures";
import { OnboardingFrame } from "@/features/onboarding/components/OnboardingFrame";
import type { CompanyForm } from "@/features/onboarding/types";

const fieldLabel = "text-[13px] font-semibold tracking-tight text-ink-2";
const optBase =
  "rounded-md border bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export interface StepCompanyProps {
  company: CompanyForm;
  setCompany: (patch: Partial<CompanyForm>) => void;
  onBack: () => void;
  onNext: () => void;
  /** True while the workspace is being created — disables Continue. */
  submitting?: boolean;
}

/** Company-setup step: name, team size, and what the team wants Brainite for. */
export function StepCompany({
  company,
  setCompany,
  onBack,
  onNext,
  submitting = false,
}: StepCompanyProps) {
  const otherChecked = company.useCases.includes(OTHER_USE_CASE);

  /** Check/uncheck one use case, keeping the order they were picked in — the
   * first entry is what the backend stores as the primary one. */
  const toggleUseCase = (id: string) =>
    setCompany({
      useCases: company.useCases.includes(id)
        ? company.useCases.filter((picked) => picked !== id)
        : [...company.useCases, id],
    });

  // "Something else" checked but empty is an unanswered question, not an answer.
  const useCasesAnswered =
    company.useCases.length > 0 &&
    (!otherChecked ||
      company.useCases.length > 1 ||
      company.useCaseOther.trim().length > 0);

  return (
    <OnboardingFrame
      stepIndex={0}
      title="Tell us about your company"
      sub="We tailor your brain to how your team actually works."
      onBack={onBack}
      onNext={onNext}
      canNext={Boolean(company.company) && useCasesAnswered && !submitting}
      nextLabel={submitting ? "Creating workspace…" : "Continue"}
    >
      <div className="flex max-w-[620px] flex-col gap-[26px]">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="company-name" className={fieldLabel}>
            Company name
          </label>
          <Input
            id="company-name"
            className="h-11"
            value={company.company}
            onChange={(e) => setCompany({ company: e.target.value })}
            placeholder="Acme Inc."
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className={fieldLabel}>Team size</span>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TEAM_SIZES.map((size) => {
              const on = company.size === size;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCompany({ size })}
                  className={cn(
                    optBase,
                    "py-3.5 text-center text-sm font-semibold text-ink",
                    on
                      ? "border-primary bg-brand-soft"
                      : "border-line-2 hover:border-ink-4"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={fieldLabel}>Why do you want to use Brainite?</span>
            <span className="text-[12.5px] text-ink-3">Select all that apply</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {USE_CASES.map((uc) => {
              const on = company.useCases.includes(uc.id);
              return (
                <button
                  key={uc.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleUseCase(uc.id)}
                  className={cn(
                    optBase,
                    "flex items-start gap-[11px] p-[15px] text-left",
                    on
                      ? "border-primary bg-brand-soft"
                      : "border-line-2 hover:border-ink-4"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-[34px] flex-none place-items-center rounded-[9px] transition-colors",
                      on
                        ? "bg-primary text-primary-foreground"
                        : "bg-cream text-ink-2"
                    )}
                  >
                    <AppIcon name={uc.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold tracking-tight text-ink">
                      {uc.t}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-3">
                      {uc.d}
                    </span>
                  </span>
                  {/* The checkmark, not the fill, is what makes multi-select
                    * legible — the tinted card alone reads as a radio pick. */}
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-[18px] flex-none place-items-center rounded-[5px] border transition-colors",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-line-2 bg-paper"
                    )}
                  >
                    {on && <AppIcon name="check" size={12} />}
                  </span>
                </button>
              );
            })}
          </div>

          {otherChecked && (
            <Input
              autoFocus
              aria-label="What else do you want to use Brainite for?"
              className="h-11"
              maxLength={200}
              value={company.useCaseOther}
              onChange={(e) => setCompany({ useCaseOther: e.target.value })}
              placeholder="What do you have in mind?"
            />
          )}
        </div>
      </div>
    </OnboardingFrame>
  );
}
