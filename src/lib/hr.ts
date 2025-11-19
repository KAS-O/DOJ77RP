export type Department = "doj";

export type InternalUnit = "irs" | "sadownictwo" | "prokuratura" | "palestra";

export type AdditionalRank = string;

export type StyledOption<T extends string> = {
  value: T;
  label: string;
  shortLabel?: string;
  description?: string;
  background: string;
  color: string;
  borderColor: string;
};

export type DepartmentOption = StyledOption<Department> & {
  abbreviation: string;
};

export type InternalUnitOption = StyledOption<InternalUnit> & {
  abbreviation: string;
};

export type AdditionalRankOption = StyledOption<AdditionalRank> & {
  unit: InternalUnit;
};

const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  {
    value: "doj",
    label: "Department of Justice",
    abbreviation: "DOJ",
    shortLabel: "DOJ",
    background: "linear-gradient(135deg, #3c291b, #1a110b)",
    color: "#f3e0c7",
    borderColor: "rgba(210, 168, 120, 0.6)",
  },
];

const UNIT_STYLES: Record<InternalUnit, { background: string; color: string; borderColor: string }> = {
  irs: {
    background: "linear-gradient(135deg, #5b3a22, #1e120b)",
    color: "#f4e2ca",
    borderColor: "rgba(198, 153, 102, 0.65)",
  },
  sadownictwo: {
    background: "linear-gradient(135deg, #2f2115, #0f0805)",
    color: "#f1dcc0",
    borderColor: "rgba(172, 129, 82, 0.6)",
  },
  prokuratura: {
    background: "linear-gradient(135deg, #3f2617, #120a06)",
    color: "#f3dfc3",
    borderColor: "rgba(191, 143, 94, 0.6)",
  },
  palestra: {
    background: "linear-gradient(135deg, #6f4a2c, #24130a)",
    color: "#f7e7cf",
    borderColor: "rgba(214, 170, 120, 0.6)",
  },
};

const INTERNAL_UNIT_OPTIONS: InternalUnitOption[] = [
  {
    value: "irs",
    label: "Internal Revenue Service",
    abbreviation: "IRS",
    shortLabel: "IRS",
    ...UNIT_STYLES.irs,
  },
  {
    value: "sadownictwo",
    label: "Sądownictwo",
    abbreviation: "Sąd",
    shortLabel: "Sąd",
    ...UNIT_STYLES.sadownictwo,
  },
  {
    value: "prokuratura",
    label: "Prokuratura",
    abbreviation: "Prok.",
    shortLabel: "Prok.",
    ...UNIT_STYLES.prokuratura,
  },
  {
    value: "palestra",
    label: "Palestra Adwokacka",
    abbreviation: "Palestra",
    shortLabel: "Palestra",
    ...UNIT_STYLES.palestra,
  },
];

const ADDITIONAL_RANK_OPTIONS: AdditionalRankOption[] = [];

export const DEPARTMENTS = DEPARTMENT_OPTIONS;
export const INTERNAL_UNITS = INTERNAL_UNIT_OPTIONS;
export const ADDITIONAL_RANKS = ADDITIONAL_RANK_OPTIONS;

const DEPARTMENT_MAP = new Map(DEPARTMENT_OPTIONS.map((option) => [option.value, option]));
const INTERNAL_UNIT_MAP = new Map(INTERNAL_UNIT_OPTIONS.map((option) => [option.value, option]));
const ADDITIONAL_RANK_MAP = new Map(ADDITIONAL_RANK_OPTIONS.map((option) => [option.value, option]));

export function normalizeDepartment(value: unknown): Department | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return (DEPARTMENT_OPTIONS.find((option) => option.value === normalized) || null)?.value ?? null;
}

export function getDepartmentOption(value: Department | string | null | undefined): DepartmentOption | null {
  if (!value) return null;
  const key = typeof value === "string" ? (value.trim().toLowerCase() as Department) : value;
  return DEPARTMENT_MAP.get(key) || null;
}

export function normalizeInternalUnits(value: unknown): InternalUnit[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) {
      const option = INTERNAL_UNIT_MAP.get(value.trim().toLowerCase() as InternalUnit);
      return option ? [option.value] : [];
    }
    return [];
  }
  const seen = new Set<InternalUnit>();
  value.forEach((item) => {
    if (typeof item !== "string") return;
    const key = item.trim().toLowerCase() as InternalUnit;
    if (INTERNAL_UNIT_MAP.has(key)) {
      seen.add(key);
    }
  });
  return Array.from(seen);
}

export function getInternalUnitOption(value: InternalUnit | string | null | undefined): InternalUnitOption | null {
  if (!value) return null;
  const key = typeof value === "string" ? (value.trim().toLowerCase() as InternalUnit) : value;
  return INTERNAL_UNIT_MAP.get(key) || null;
}

export function normalizeAdditionalRanks(value: unknown): AdditionalRank[] {
  const seen = new Set<AdditionalRank>();

  const addValue = (input: unknown) => {
    if (typeof input !== "string") return;
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    const option = ADDITIONAL_RANK_OPTIONS.find((rank) => rank.value === normalized);
    if (option) {
      seen.add(option.value);
    }
  };

  if (Array.isArray(value)) {
    value.forEach(addValue);
  } else {
    addValue(value);
  }

  return Array.from(seen);
}

export function getAdditionalRankOption(
  value: AdditionalRank | string | null | undefined
): AdditionalRankOption | null {
  if (!value) return null;
  const key = typeof value === "string" ? (value.trim().toLowerCase() as AdditionalRank) : value;
  return ADDITIONAL_RANK_MAP.get(key) || null;
}

export const ADDITIONAL_RANK_GROUPS = INTERNAL_UNIT_OPTIONS.map((unit) => ({
  unit: unit.value,
  unitLabel: unit.abbreviation,
  unitDescription: unit.label,
  ranks: ADDITIONAL_RANK_OPTIONS.filter((rank) => rank.unit === unit.value),
})).filter((group) => group.ranks.length > 0);

export function formatPersonLabel(fullName?: string | null, login?: string | null): string {
  const name = (fullName || "").trim();
  const user = (login || "").trim();
  if (name && user && name.toLowerCase() !== user.toLowerCase()) {
    return `${name} (${user})`;
  }
  return name || user || "Nieznany funkcjonariusz";
}
