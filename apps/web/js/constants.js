/**
 * Land Survey CAD - Constants & Land Measurement Units
 * Master Bangladesh survey math constants (Feet & Inches Standard - Link Removed)
 */

(function(global) {
  'use strict';

  const Constants = {
    // Area Constants (Square Feet basis)
    SQFT_PER_SHOTOK: 435.60,
    SQINCH_PER_SHOTOK: 435.60 * 144, // 62,726.4 sq inches
    SQFT_PER_KATHA: 720.00,
    SQFT_PER_BIGHA: 14400.00,
    SQFT_PER_ACRE: 43560.00,
    SQFT_PER_SQMETER: 10.7639104,
    SQFT_PER_SQYARD: 9.00,
    SQINCH_PER_SQFT: 144.0,

    // Linear Units (Pure Feet, Inches, Meters - Link removed)
    INCHES_PER_FOOT: 12.0,
    FEET_PER_MILE: 5280.0,
    INCHES_PER_MILE: 63360.0, // 5280 * 12
    FEET_PER_METER: 3.28084,
    INCHES_PER_METER: 39.3700787,

    // Legacy fallback ratio for coordinate unit conversion (1 CAD unit = 0.66 ft = 7.92 in)
    FEET_PER_CAD_UNIT: 0.66,
    INCHES_PER_CAD_UNIT: 7.92,

    // Official Cadastral Scale Presets (1 Mile = 5,280 Feet = 63,360 Inches)
    // ১৬ ইঞ্চি: ৫২৮০ / ১৬ * ১২ = ৩৯৬০ ইঞ্চি (৩৩০ ফুট)
    // ৩২ ইঞ্চি: ৫২৮০ / ৩২ * ১২ = ১৯৮০ ইঞ্চি (১৬৫ ফুট)
    // ৬৪ ইঞ্চি: ৫২৮০ / ৬৪ * ১২ = ৯৯০ ইঞ্চি (৮২.৫ ফুট / ৮২' ৬")
    // ৮০ ইঞ্চি: ৫২৮০ / ৮০ * ১২ = ৭৯২ ইঞ্চি (৬৬ ফুট)
    SCALE_PRESETS: {
      '16_inch': {
        name: '১৬" = ১ মাইল',
        inchesGroundPerMapInch: 3960,
        feetGroundPerMapInch: 330,
        formula: '৫২৮০ / ১৬ * ১২ = ৩৯৬০ ইঞ্চি (৩৩০ ফুট)',
        ratio: 1.0
      },
      '32_inch': {
        name: '৩২" = ১ মাইল',
        inchesGroundPerMapInch: 1980,
        feetGroundPerMapInch: 165,
        formula: '৫২৮০ / ৩২ * ১২ = ১৯৮০ ইঞ্চি (১৬৫ ফুট)',
        ratio: 0.5
      },
      '64_inch': {
        name: '৬৪" = ১ মাইল',
        inchesGroundPerMapInch: 990,
        feetGroundPerMapInch: 82.5,
        formula: '৫২৮০ / ৬৪ * ১২ = ৯৯০ ইঞ্চি (৮২.৫ ফুট)',
        ratio: 0.25
      },
      '80_inch': {
        name: '৮০" = ১ মাইল',
        inchesGroundPerMapInch: 792,
        feetGroundPerMapInch: 66,
        formula: '৫২৮০ / ৮০ * ১২ = ৭৯২ ইঞ্চি (৬৬ ফুট)',
        ratio: 0.20
      }
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
     * Convert Total Feet into Feet & Inches breakdown
     * Completely free of 'Link' references
     */
    convertFeetToFeetInches: function(totalFeet, bangla) {
      if (bangla === undefined) bangla = true;
      if (isNaN(totalFeet) || totalFeet < 0) totalFeet = 0;
      let wholeFeet = Math.floor(totalFeet);
      let inches = Math.round((totalFeet - wholeFeet) * 12);
      if (inches >= 12) {
        wholeFeet += 1;
        inches = 0;
      }
      const totalInches = Math.round(totalFeet * 12 * 10) / 10;

      const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toB = str => String(str).replace(/[0-9]/g, w => bDigits[+w]);

      const bFeet = toB(wholeFeet);
      const bInches = toB(inches);
      const bTotalInches = toB(totalInches.toFixed(1));

      return {
        totalFeet: totalFeet,
        totalInches: totalInches,
        feet: wholeFeet,
        inches: inches,
        formattedBengali: `${bFeet} ফুট ${bInches} ইঞ্চি`,
        formattedShortBengali: `${bFeet}' - ${bInches}"`,
        formattedInchesBengali: `${bTotalInches}" ইঞ্চি`,
        formattedEnglish: `${wholeFeet}' - ${inches}"`,
        formattedFullEnglish: `${wholeFeet} ft ${inches} in`,
        badgeText: bangla ? `${bFeet}' - ${bInches}"` : `${wholeFeet}' - ${inches}"`
      };
    },

    /**
     * Convert Total Inches into Feet & Inches breakdown
     */
    convertInchesToFeetInches: function(totalInches, bangla) {
      const totalFeet = (totalInches || 0) / 12.0;
      return this.convertFeetToFeetInches(totalFeet, bangla);
    },

    /**
     * Legacy shim for any older internal caller (mapped to feet/inch without link text)
     */
    convertLinksToFeetInches: function(val, bangla) {
      const totalFeet = (val || 0) * this.FEET_PER_CAD_UNIT;
      return this.convertFeetToFeetInches(totalFeet, bangla);
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Constants = Constants;

})(typeof window !== 'undefined' ? window : this);
