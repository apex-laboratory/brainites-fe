export type MemberRole = "Admin" | "Editor" | "Viewer";

export type Member = {
  name: string;
  /** Accent color from the prototype (avatars now use react-nice-avatar). */
  color: string;
  role: MemberRole;
  email: string;
  /** Marks the current user row. */
  you?: boolean;
};
