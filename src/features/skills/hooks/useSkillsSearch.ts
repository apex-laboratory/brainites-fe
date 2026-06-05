import { useMemo, useState } from "react";

import { SKILLS } from "../data/skills";
import type { Skill } from "../types";

/** Owns the skills registry search query and the filtered rows. */
export function useSkillsSearch() {
  const [query, setQuery] = useState("");

  const filtered = useMemo<Skill[]>(() => {
    const q = query.trim().toLowerCase();
    return q ? SKILLS.filter((skill) => skill.name.toLowerCase().includes(q)) : SKILLS;
  }, [query]);

  return { query, setQuery, filtered };
}
