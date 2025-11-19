import { getAdditionalRankOption, getInternalUnitOption, type AdditionalRank, type InternalUnit } from "@/lib/hr";
import { isHighCommand, type Role } from "@/lib/roles";

export type UnitSectionConfig = {
  unit: InternalUnit;
  href: string;
  label: string;
  shortLabel: string;
  navColor: string;
  rankHierarchy: AdditionalRank[];
  membershipRank: AdditionalRank | null;
  icon?: string | null;
};

const BASE_UNIT_CONFIG: Record<
  InternalUnit,
  { navColor: string; rankHierarchy: AdditionalRank[]; membershipRank: AdditionalRank | null }
> = {
  irs: {
    navColor: "#b77d4b",
    rankHierarchy: ["irs-koordynator", "irs-inspektor"],
    membershipRank: null,
  },
  sadownictwo: {
    navColor: "#8d6946",
    rankHierarchy: ["sadownictwo-przewodniczacy", "sadownictwo-sedzia"],
    membershipRank: null,
  },
  prokuratura: {
    navColor: "#9b6a3c",
    rankHierarchy: ["prokuratura-naczelnik", "prokuratura-prokurator"],
    membershipRank: null,
  },
  palestra: {
    navColor: "#c48c5c",
    rankHierarchy: ["palestra-dziekan", "palestra-rzecznik"],
    membershipRank: null,
  },
};

export const UNIT_SECTIONS: UnitSectionConfig[] = (Object.keys(BASE_UNIT_CONFIG) as InternalUnit[]).map((unit) => {
  const option = getInternalUnitOption(unit);
  const config = BASE_UNIT_CONFIG[unit];
  return {
    unit,
    href: `/units/${unit}`,
    label: option?.label || option?.abbreviation || unit.toUpperCase(),
    shortLabel: option?.shortLabel || option?.abbreviation || unit.toUpperCase(),
    navColor: config.navColor,
    rankHierarchy: config.rankHierarchy.slice(),
    membershipRank: config.membershipRank,
    icon: null,
  };
});

const UNIT_CONFIG_MAP = new Map<InternalUnit, UnitSectionConfig>(UNIT_SECTIONS.map((section) => [section.unit, section]));

export function getUnitSection(unit: InternalUnit): UnitSectionConfig | null {
  return UNIT_CONFIG_MAP.get(unit) || null;
}

export function unitHasAccess(
  unit: InternalUnit,
  ranks: AdditionalRank[] | null | undefined,
  role?: Role | null | undefined,
  memberships?: InternalUnit[] | null | undefined
): boolean {
  if (isHighCommand(role)) {
    return true;
  }
  const membershipList = Array.isArray(memberships) ? memberships : [];
  if (membershipList.includes(unit)) {
    return true;
  }
  const config = UNIT_CONFIG_MAP.get(unit);
  if (!config) {
    return false;
  }
  const rankSet = new Set(ranks);
  if (config.membershipRank && rankSet.has(config.membershipRank)) {
    return true;
  }
  if (!rankSet.size) {
    return false;
  }
  return config.rankHierarchy.some((rank) => rankSet.has(rank));
}

export type UnitPermission = {
  unit: InternalUnit;
  highestRank: AdditionalRank;
  manageableRanks: AdditionalRank[];
};

export function resolveUnitPermission(
  unit: InternalUnit,
  ranks: AdditionalRank[] | null | undefined
): UnitPermission | null {
  if (!Array.isArray(ranks) || ranks.length === 0) {
    return null;
  }
  const config = UNIT_CONFIG_MAP.get(unit);
  if (!config) {
    return null;
  }
  const rankSet = new Set(ranks);
  for (let index = 0; index < config.rankHierarchy.length; index += 1) {
    const rank = config.rankHierarchy[index];
    if (rankSet.has(rank)) {
      const manageableRanks = config.rankHierarchy.slice(index + 1);
      if (config.membershipRank && !manageableRanks.includes(config.membershipRank)) {
        manageableRanks.push(config.membershipRank);
      }
      return {
        unit,
        highestRank: rank,
        manageableRanks,
      };
    }
  }
  return null;
}

export function formatManageableRankList(ranks: AdditionalRank[]): string {
  if (!ranks.length) {
    return "";
  }
  const labels = ranks
    .map((rank) => getAdditionalRankOption(rank)?.label)
    .filter((label): label is string => !!label);
  if (!labels.length) {
    return "";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  return `${labels.slice(0, -1).join(", ")} i ${labels[labels.length - 1]}`;
}
