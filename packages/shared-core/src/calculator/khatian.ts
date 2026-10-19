/**
 * Khatian Owner Share Calculator Engine (১৬ আনা ও দশমিক হিস্যা বন্টন)
 */

export interface KhatianOwner {
  id: number | string;
  name: string;
  share: number; // Decimal share (e.g. 0.400 = 40%)
}

export interface KhatianDistributionResult {
  totalShotok: number;
  owners: Array<{
    id: number | string;
    name: string;
    shareDecimal: number;
    sharePercent: string;
    allocatedShotok: number;
    allocatedSqft: number;
  }>;
  totalAllocatedShotok: number;
  remainingShotok: number;
}

export function calculateKhatianDistribution(
  totalShotok: number,
  owners: KhatianOwner[],
  sqftPerShotok: number = 435.60
): KhatianDistributionResult {
  let totalAllocated = 0;

  const resultOwners = owners.map(o => {
    const allocated = Number((totalShotok * o.share).toFixed(3));
    const sqft = Number((allocated * sqftPerShotok).toFixed(1));
    totalAllocated += allocated;

    return {
      id: o.id,
      name: o.name,
      shareDecimal: o.share,
      sharePercent: (o.share * 100).toFixed(1) + '%',
      allocatedShotok: allocated,
      allocatedSqft: sqft
    };
  });

  const remaining = Number((totalShotok - totalAllocated).toFixed(3));

  return {
    totalShotok,
    owners: resultOwners,
    totalAllocatedShotok: Number(totalAllocated.toFixed(3)),
    remainingShotok: remaining
  };
}
