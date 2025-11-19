export const ROLE_VALUES = [
  "sedzia-najwyzszy",
  "sedzia",
  "asystent-sedziego",
  "prokurator-generalny",
  "prokurator",
  "asesor-prokuratora",
  "irs",
  "adwokat",
  "admin",
] as const;

export type Role = (typeof ROLE_VALUES)[number];

export const DEFAULT_ROLE: Role = "adwokat";

const ROLE_LABEL_MAP: Record<Role, string> = {
  "sedzia-najwyzszy": "Sędzia najwyższy",
  "sedzia": "Sędzia",
  "asystent-sedziego": "Asystent sędziego",
  "prokurator-generalny": "Prokurator generalny",
  "prokurator": "Prokurator",
  "asesor-prokuratora": "Asesor prokuratora",
  irs: "IRS",
  adwokat: "Adwokat",
  admin: "Administrator",
};

export const ROLE_LABELS = ROLE_LABEL_MAP;

export const ROLE_OPTIONS: { value: Role; label: string }[] = ROLE_VALUES.filter(
  (role) => role !== "admin"
).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

const ROLE_GROUP_LABEL_MAP: Record<Role, string> = {
  "sedzia-najwyzszy": "Sądownictwo",
  sedzia: "Sądownictwo",
  "asystent-sedziego": "Sądownictwo",
  "prokurator-generalny": "Prokuratura",
  prokurator: "Prokuratura",
  "asesor-prokuratora": "Prokuratura",
  irs: "Internal Revenue Service",
  adwokat: "Palestra Adwokacka",
  admin: "Administracja",
};

export function getRoleGroupLabel(role: Role | null | undefined): string | null {
  if (!role) return null;
  return ROLE_GROUP_LABEL_MAP[role] || null;
}

const ROLE_ALIASES: Record<string, Role> = {
  "sedzia najwyzszy": "sedzia-najwyzszy",
  "sedzia-najwyzszy": "sedzia-najwyzszy",
  "sedzia": "sedzia",
  "asystent sedziego": "asystent-sedziego",
  "asystent-sedziego": "asystent-sedziego",
  "prokurator generalny": "prokurator-generalny",
  "prokurator-generalny": "prokurator-generalny",
  "prokurator": "prokurator",
  "asesor prokuratora": "asesor-prokuratora",
  "asesor-prokuratora": "asesor-prokuratora",
  irs: "irs",
  "agent irs": "irs",
  adwokat: "adwokat",
  "adw": "adwokat",
  administrator: "admin",
  admin: "admin",
};

export const BOARD_ROLES: Role[] = [];

const BOARD_ROLE_SET = new Set<Role>(BOARD_ROLES);

export function hasBoardAccess(role: Role | null | undefined): role is Role {
  return !!role && BOARD_ROLE_SET.has(role);
}

export function hasOfficerAccess(role: Role | null | undefined): role is Role {
  return !!role;
}

export function canAssignAdminPrivileges(role: Role | null | undefined): role is Role {
  return role === "admin";
}

export const HIGH_COMMAND_ROLES: Role[] = [];

const HIGH_COMMAND_ROLE_SET = new Set<Role>(HIGH_COMMAND_ROLES);

export function isHighCommand(role: Role | null | undefined): role is Role {
  return !!role && HIGH_COMMAND_ROLE_SET.has(role);
}

const FALLBACK_ROLE: Role = DEFAULT_ROLE;

export function normalizeRole(value: unknown): Role {
  if (typeof value !== "string") {
    return FALLBACK_ROLE;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return FALLBACK_ROLE;
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
  const alias = ROLE_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  const slug = normalized
    .replace(/\s*\+\s*/g, "+")
    .replace(/\s+/g, "-")
    .replace(/\+/g, "-plus-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if ((ROLE_VALUES as readonly string[]).includes(slug as Role)) {
    return slug as Role;
  }

  return FALLBACK_ROLE;
}
