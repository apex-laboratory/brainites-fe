import { useState } from "react";
import { useLocation } from "react-router-dom";

import { PageHeader } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SettingsApiKeys } from "../components/SettingsApiKeys";
import { SettingsGeneral } from "../components/SettingsGeneral";
import { SettingsMembers } from "../components/SettingsMembers";
import { SettingsUsage } from "../components/SettingsUsage";

type SettingsTab = "general" | "members" | "api-keys" | "usage";

const TABS: { value: SettingsTab; label: string }[] = [
  { value: "general", label: "General" },
  { value: "members", label: "Members" },
  { value: "api-keys", label: "API keys" },
  { value: "usage", label: "Usage" },
];

const isSettingsTab = (value: unknown): value is SettingsTab =>
  TABS.some((item) => item.value === value);

/** Workspace settings screen (prototype `SettingsPage`). */
export function SettingsPage() {
  const { state } = useLocation();
  const requestedTab = (state as { tab?: unknown } | null)?.tab;
  const [tab, setTab] = useState<SettingsTab>(
    isSettingsTab(requestedTab) ? requestedTab : "general"
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as SettingsTab)}
      className="h-full overflow-y-auto"
    >
      <PageHeader
        label="Workspace"
        title="Settings"
        right={
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        }
      />

      <div className="mx-auto max-w-[820px] px-6 pb-14 pt-6 md:px-10">
        <TabsContent value="general" className="mt-0">
          <SettingsGeneral />
        </TabsContent>
        <TabsContent value="members" className="mt-0">
          <SettingsMembers />
        </TabsContent>
        <TabsContent value="api-keys" className="mt-0">
          <SettingsApiKeys />
        </TabsContent>
        <TabsContent value="usage" className="mt-0">
          <SettingsUsage />
        </TabsContent>
      </div>
    </Tabs>
  );
}
