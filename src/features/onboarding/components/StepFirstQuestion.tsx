import { useState } from "react";

import { AppLogo } from "@/components/shared/AppLogo";
import { AppIcon } from "@/components/shared/AppIcon";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { BRAND } from "@/constants/brand";
import {
  FIRST_ANSWER,
  FIRST_EXAMPLES,
} from "@/features/onboarding/data/onboarding-fixtures";

/** Final answer card shown once a question is asked (static refund answer). */
function AnswerCard({ onDone }: { onDone: () => void }) {
  return (
    <Card className="mt-4 rounded-2xl p-[26px] motion-safe:animate-fade-up">
      <p className="text-[17px] leading-[1.62] text-ink">
        Premium customers have a <b>45-day refund window</b> — 15 days beyond
        standard. After 45 days, refunds require manager approval in{" "}
        <b>#cs-escalations</b>. Damaged-item claims under $200 auto-issue a
        replacement without escalation.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <SectionLabel>Sources</SectionLabel>
        {FIRST_ANSWER.sources.map((s) => (
          <Badge key={s.label} variant="outline" className="gap-1.5">
            <SourceIcon id={s.id} size={14} branded /> {s.label}
          </Badge>
        ))}
        <Badge variant="accent" className="ml-auto">
          {FIRST_ANSWER.confidence}% confidence
        </Badge>
      </div>
      <div className="mt-[22px] flex items-center border-t border-line pt-5">
        <div className="text-sm text-ink-3">
          That&apos;s your brain talking. There&apos;s a whole dashboard behind
          it.
        </div>
        <Button className="ml-auto" onClick={onDone}>
          Enter {BRAND.name}
          <AppIcon name="arrow" />
        </Button>
      </div>
    </Card>
  );
}

export interface StepFirstQuestionProps {
  companyName: string;
  onDone: () => void;
}

/** First-question step: ready screen, ask input, suggestions, answer card. */
export function StepFirstQuestion({
  companyName,
  onDone,
}: StepFirstQuestionProps) {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setAsked(text);
  };

  return (
    <div className="relative grid min-h-full place-items-center bg-ivory">
      <div className="absolute left-11 top-[30px]">
        <AppLogo size="md" />
      </div>
      <SectionLabel className="absolute right-11 top-8">06 / 06</SectionLabel>

      <div className="w-[820px] max-w-[92%] px-5 py-16">
        {!asked ? (
          <div className="text-center motion-safe:animate-fade-up">
            <SectionLabel className="inline-block">
              Your brain is ready
            </SectionLabel>
            <h1 className="mt-[22px] text-[40px] font-bold tracking-tight text-ink md:text-[56px]">
              Ask it <span className="text-brand-ink">something</span>.
            </h1>
            <p className="mt-4 text-[17px] text-ink-3 md:text-[18px]">
              {companyName || "Your company"}&apos;s knowledge is now one
              question away.
            </p>
          </div>
        ) : (
          <div className="mb-6 motion-safe:animate-fade-up">
            <SectionLabel>You asked</SectionLabel>
            <div className="mt-2 text-[22px] font-semibold tracking-tight text-ink md:text-[26px]">
              {asked}
            </div>
          </div>
        )}

        {/* ask input */}
        <Card
          className={cn(
            "flex items-center gap-2 rounded-2xl p-2 shadow-soft-2",
            !asked && "mt-9"
          )}
        >
          <AppIcon
            name="brain"
            size={22}
            className="ml-3 flex-none text-primary"
          />
          <Input
            className="h-14 border-none bg-transparent text-[17px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(query)}
            placeholder="Ask your company brain…"
            aria-label="Ask your company brain"
          />
          <Button className="h-11 px-[18px]" onClick={() => ask(query)}>
            Ask <AppIcon name="arrow" />
          </Button>
        </Card>

        {!asked ? (
          <div className="mt-4 flex flex-col motion-safe:animate-fade-up">
            {FIRST_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => ask(example)}
                className="group flex items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppIcon
                  name="sparkles"
                  size={15}
                  className="flex-none text-primary"
                />
                <span className="text-[15px] text-ink-2 group-hover:text-ink">
                  {example}
                </span>
                <AppIcon
                  name="arrow"
                  size={16}
                  className="ml-auto text-ink-4 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ))}
          </div>
        ) : (
          <AnswerCard onDone={onDone} />
        )}
      </div>
    </div>
  );
}
