/**
 * Land Survey CAD - Khatian Hisya Calculator Engine
 * 16 Ana / Decimal Share Distribution Table Renderer
 */

(function(global) {
  'use strict';

  const Khatian = {
    calculateDistribution: function(totalShotok, owners, sqftPerShotok) {
      sqftPerShotok = sqftPerShotok || 435.60;
      let totalAllocated = 0;

      const resultOwners = (owners || []).map(o => {
        const allocated = Number((totalShotok * o.share).toFixed(3));
        const sqft = Number((allocated * sqftPerShotok).toFixed(1));
        totalAllocated += allocated;

        return {
          id: o.id,
          name: o.name,
          share: o.share,
          sharePercent: (o.share * 100).toFixed(1) + '%',
          allocatedShotok: allocated,
          allocatedSqft: sqft
        };
      });

      return {
        totalShotok: totalShotok,
        owners: resultOwners,
        totalAllocatedShotok: Number(totalAllocated.toFixed(3)),
        remainingShotok: Number((totalShotok - totalAllocated).toFixed(3))
      };
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Khatian = Khatian;

})(typeof window !== 'undefined' ? window : this);
