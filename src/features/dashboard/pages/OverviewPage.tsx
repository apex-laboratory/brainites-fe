import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AppIcon,
  MetricCard,
  NiceAvatar,
  SectionLabel,
  SourceIcon,
  Sparkline,
  StatusIndicator,
} from "@/components/shared";
import { SOURCE_LIST } from "@/constants/sources";

/**
 * Phase 1 foundation showcase. This temporary view verifies the exit
 * criteria: shadcn components render with Brainite tokens, every icon comes
 * from react-icons, avatars use react-nice-avatar. Replaced by the real
 * Overview screen in Phase 5.
 */
export function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <header>
        <SectionLabel>Foundation</SectionLabel>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          Good afternoon, Dana
        </h1>
        <p className="mt-1 text-sm text-ink-3">
          Phase 1 scaffolding is live. Tokens, shadcn primitives, shared
          components and fixtures are wired up.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Decisions" value="378" icon="decision" hint="+12 this week" />
        <MetricCard label="Skills" value="6" icon="skills" hint="2 in review" />
        <MetricCard
          label="Calls"
          value="10.6k"
          icon="bolt"
          trailing={<Sparkline data={[120, 160, 180, 210, 240, 260, 290]} width={72} height={28} />}
        />
        <MetricCard label="Sources" value="5" icon="sources" hint="all healthy" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AppIcon name="sparkles" size={16} className="text-primary" />
            Primitive check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="solid">Solid</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="accent">Active</Badge>
            <Badge variant="green">Approved</Badge>
            <Badge variant="amber">Needs review</Badge>
            <Badge variant="outline">Draft</Badge>
          </div>

          <div className="max-w-sm space-y-2">
            <SectionLabel>Usage</SectionLabel>
            <Progress value={64} />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              {SOURCE_LIST.map((s) => (
                <SourceIcon key={s.id} id={s.id} branded size={20} />
              ))}
            </div>
            <StatusIndicator tone="live" label="Reading 5 sources · live" pulse />
          </div>

          <div className="flex items-center gap-3">
            {["Dana Reyes", "Marcus Lee", "Priya Shah", "Sam Okafor"].map(
              (name) => (
                <NiceAvatar key={name} name={name} size={36} />
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
