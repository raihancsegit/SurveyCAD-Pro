/**
 * Land Survey CAD - Constants & Land Measurement Units
 * Master Bangladesh survey math constants
 */

(function(global) {
  'use strict';

  const Constants = {
    // Area Constants (Square Feet basis)
    SQFT_PER_SHOTOK: 435.60,
    SQFT_PER_KATHA: 720.00,
    SQFT_PER_BIGHA: 14400.00,
    SQFT_PER_ACRE: 43560.00,
    SQFT_PER_SQMETER: 10.7639104,
    SQFT_PER_SQLINK: 0.4356,
    SQFT_PER_SQYARD: 9.00,

    // Linear Units
    FEET_PER_LINK: 0.66,
    METERS_PER_LINK: 0.201168,
    FEET_PER_METER: 3.28084,
    FEET_PER_CHAIN: 66.0,
    LINKS_PER_CHAIN: 100.0,

    // Official Cadastral Scale Presets (1 Mile = 80 Gunter Chains = 8,000 Links)
    SCALE_PRESETS: {
      '16_inch': { name: '১৬" = ১ মাইল', linksPerInch: 500, ratio: 1.0 },
      '32_inch': { name: '৩২" = ১ মাইল', linksPerInch: 250, ratio: 0.5 },
      '64_inch': { name: '৬৪" = ১ মাইল', linksPerInch: 125, ratio: 0.25 },
      '80_inch': { name: '৮০" = ১ মাইল', linksPerInch: 100, ratio: 0.20 }
    },

    // Land Class Base Rates (BDT per Shotok)
    LAND_CLASS_RATES: {
      'nal': 350000,
      'viti': 550000,
      'bari': 850000,
      'pukur': 400000,
      'bagan': 450000,
      'doba': 200000
    },

    /**
     * Convert Links directly into Feet & Inches breakdown
     * 1 link = 0.66 feet = 7.92 inches
     */
    convertLinksToFeetInches: function(links, bangla) {
      if (bangla === undefined) bangla = true;
      const totalFeet = (links || 0) * this.FEET_PER_LINK;
      return this.convertFeetToFeetInches(totalFeet, bangla, links);
    },

    /**
     * Convert Total Feet into Feet & Inches breakdown
     */
    convertFeetToFeetInches: function(totalFeet, bangla, originalLinks) {
      if (bangla === undefined) bangla = true;
      if (isNaN(totalFeet) || totalFeet < 0) totalFeet = 0;
      let wholeFeet = Math.floor(totalFeet);
      let inches = Math.round((totalFeet - wholeFeet) * 12);
      if (inches >= 12) {
        wholeFeet += 1;
        inches = 0;
      }

      const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toB = str => String(str).replace(/[0-9]/g, w => bDigits[+w]);

      const bFeet = toB(wholeFeet);
      const bInches = toB(inches);
      const lkStr = originalLinks !== undefined ? (toB(originalLinks.toFixed(1)) + ' লিংক') : '';

      return {
        totalFeet: totalFeet,
        feet: wholeFeet,
        inches: inches,
        formattedBengali: `${bFeet} ফুট ${bInches} ইঞ্চি`,
        formattedShortBengali: `${bFeet}' - ${bInches}"`,
        formattedEnglish: `${wholeFeet}' - ${inches}"`,
        formattedFullEnglish: `${wholeFeet} ft ${inches} in`,
        badgeText: bangla ? `${bFeet}' - ${bInches}"` : `${wholeFeet}' - ${inches}"`
      };
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Constants = Constants;

})(typeof window !== 'undefined' ? window : this);
