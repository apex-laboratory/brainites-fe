import { useState } from "react";
import type { IconType } from "react-icons";
import {
  SiAnthropic,
  SiClaude,
  SiLangchain,
  SiModelcontextprotocol,
  SiOpenai,
} from "react-icons/si";

import { AppIcon } from "@/components/shared/AppIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_GUIDES } from "@/features/onboarding/data/integration";
import { CopyBlock } from "@/features/onboarding/components/CopyField";

/** Brand mark + official brand color per agent guide. Resolved here so the
 * data stays component-free, mirroring how `AppIcon` / `SourceIcon` centralize
 * `react-icons` imports. Colors keep the marks recognizable in every tab
 * state. */
const GUIDE_ICONS: Record<string, { Icon: IconType; color: string }> = {
  "claude-code": { Icon: SiClaude, color: "#D97757" },
  "claude-api": { Icon: SiAnthropic, color: "#D97757" },
  "openai-codex": { Icon: SiOpenai, color: "#10A37F" },
  langchain: { Icon: SiLangchain, color: "#1C9C7C" },
  other: { Icon: SiModelcontextprotocol, color: "#E8481B" },
};

export interface AgentSetupProps {
  /** Copies a value and shows a toast. Supplied by the parent step. */
  onCopy: (value: string, label?: string) => void;
}

/**
 * "Add to your agent" panel: a tab per framework (Claude Code, Claude API,
 * OpenAI / Codex, LangChain, other MCP clients), each with copy-paste configs
 * pre-filled with the tenant's endpoint + key and a note on where the system
 * prompt goes.
 */
export function AgentSetup({ onCopy }: AgentSetupProps) {
  const [active, setActive] = useState(AGENT_GUIDES[0].id);

  return (
    <Tabs value={active} onValueChange={setActive}>
      <TabsList className="h-auto flex-wrap justify-start">
        {AGENT_GUIDES.map((guide) => {
          const brand = GUIDE_ICONS[guide.id];
          return (
            <TabsTrigger key={guide.id} value={guide.id} className="gap-1.5">
              {brand && (
                <brand.Icon
                  size={14}
                  color={brand.color}
                  aria-hidden
                />
              )}
              {guide.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {AGENT_GUIDES.map((guide) => (
        <TabsContent key={guide.id} value={guide.id} className="flex flex-col gap-3.5">
          <p className="text-[13.5px] leading-relaxed text-ink-3">{guide.blurb}</p>

          {guide.blocks.map((block) => (
            <CopyBlock
              key={block.title}
              title={block.title}
              value={block.code}
              onCopy={() => onCopy(block.code, `${guide.label} snippet copied`)}
              rows={Math.min(block.code.split("\n").length, 16)}
            />
          ))}

          <div className="flex items-start gap-2.5 rounded-[11px] border border-line-2 bg-cream px-4 py-3">
            <AppIcon
              name="sparkles"
              size={16}
              className="mt-0.5 flex-none text-brand-ink"
            />
            <p className="text-[13px] leading-relaxed text-ink-2">
              {guide.promptNote}
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
