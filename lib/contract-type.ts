import type { Contract } from "@/types/project";

/**
 * Older contracts may not have a type. Use their canonical description prefix
 * as a fallback, while letting explicit consultant wording correct bad legacy
 * type values.
 */
export function isCoachContract(contract: Pick<Contract, "type" | "description">): boolean {
  const type = (contract.type || "").trim().toLowerCase();
  const description = (contract.description || "").trim().toLowerCase();

  if (/^(consultant|team member|team)\s+contract\b/.test(description)) {
    return false;
  }
  if (type) return type === "coach";
  return /^coach\s+contract\b/.test(description);
}
