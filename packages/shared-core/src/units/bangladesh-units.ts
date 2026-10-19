/**
 * Bangladesh Land Area & Length Unit Constants & Conversion Engine
 *
 * Official Constants:
 * 1 শতক (Decimal / Shotok) = 435.60 Square Feet = 1000.00 Square Links = 40.4686 Square Meters
 * 1 কাঠা (Katha) = 720.00 Square Feet = 1.652893 শতক
 * 1 বিঘা (Bigha) = 20 কাঠা = 14,400 Square Feet = 33.05785 শতক
 * 1 একর (Acre) = 100 শতক = 43,560 Square Feet
 * 1 হেক্টর (Hectare) = 10,000 Square Meters = 247.10538 শতক = 2.47105 একর
 *
 * Linear Units:
 * 1 Gunter Chain = 66 Feet = 100 Links
 * 1 Link = 0.66 Feet = 7.92 Inches = 0.201168 Meters
 */

export interface LandAreaResult {
  sqft: number;
  sqMeter: number;
  sqLinks: number;
  sqYards: number;
  shotok: number; // Decimal (শতক)
  katha: number;  // কাঠা
  bigha: number;  // বিঘা
  acre: number;   // একর
  hectare: number;// হেক্টর
  formattedBangla: string;
}

export const SQFT_PER_SHOTOK = 435.60;
export const SQFT_PER_KATHA = 720.00;
export const SQFT_PER_BIGHA = 14400.00;
export const SQFT_PER_ACRE = 43560.00;
export const SQFT_PER_SQMETER = 10.7639104;
export const SQFT_PER_SQLINK = 0.4356;
export const SQFT_PER_SQYARD = 9.00;

export const FEET_PER_LINK = 0.66;
export const METERS_PER_LINK = 0.201168;
export const FEET_PER_METER = 3.28084;
export const FEET_PER_CHAIN = 66.0;
export const LINKS_PER_CHAIN = 100.0;

/**
 * Convert any given square feet area into full Bangladesh land measurement units.
 */
export function convertSqftToLandUnits(sqft: number): LandAreaResult {
  const safeSqft = Math.max(0, sqft);

  const shotok = safeSqft / SQFT_PER_SHOTOK;
  const katha = safeSqft / SQFT_PER_KATHA;
  const bigha = safeSqft / SQFT_PER_BIGHA;
  const acre = safeSqft / SQFT_PER_ACRE;
  const sqMeter = safeSqft / SQFT_PER_SQMETER;
  const sqLinks = safeSqft / SQFT_PER_SQLINK;
  const sqYards = safeSqft / SQFT_PER_SQYARD;
  const hectare = sqMeter / 10000.0;

  // Breakdown for official Bangla formatting: e.g. "১ একর ২ বিঘা ৪ কাঠা ৩.৫ শতক"
  const formattedBangla = formatLandAreaBangla(shotok);

  return {
    sqft: Number(safeSqft.toFixed(3)),
    sqMeter: Number(sqMeter.toFixed(3)),
    sqLinks: Number(sqLinks.toFixed(2)),
    sqYards: Number(sqYards.toFixed(3)),
    shotok: Number(shotok.toFixed(4)),
    katha: Number(katha.toFixed(4)),
    bigha: Number(bigha.toFixed(4)),
    acre: Number(acre.toFixed(4)),
    hectare: Number(hectare.toFixed(5)),
    formattedBangla
  };
}

/**
 * Convert Square Links to Square Feet
 */
export function convertSqLinksToSqft(sqLinks: number): number {
  return sqLinks * SQFT_PER_SQLINK;
}

/**
 * Convert Shotok (Decimal) to Square Feet
 */
export function convertShotokToSqft(shotok: number): number {
  return shotok * SQFT_PER_SHOTOK;
}

/**
 * Convert Katha to Square Feet
 */
export function convertKathaToSqft(katha: number): number {
  return katha * SQFT_PER_KATHA;
}

/**
 * Format land area into conversational Bangla breakdown
 */
export function formatLandAreaBangla(totalShotok: number): string {
  if (totalShotok <= 0) return '০ শতক';

  let remaining = totalShotok;
  const acres = Math.floor(remaining / 100);
  remaining %= 100;

  const bigha = Math.floor(remaining / 33.05785);
  remaining %= 33.05785;

  const katha = Math.floor(remaining / 1.652893);
  const shotok = Number((remaining % 1.652893).toFixed(3));

  const parts: string[] = [];
  if (acres > 0) parts.push(`${acres} একর`);
  if (bigha > 0) parts.push(`${bigha} বিঘা`);
  if (katha > 0) parts.push(`${katha} কাঠা`);
  if (shotok > 0 || parts.length === 0) parts.push(`${shotok} শতক`);

  return parts.join(' ');
}

export interface FeetInchesResult {
  totalFeet: number;
  feet: number;
  inches: number;
  formattedBengali: string;
  formattedShortBengali: string;
  formattedEnglish: string;
  formattedFullEnglish: string;
  badgeText: string;
}

/**
 * Convert Total Feet into Feet & Inches breakdown
 */
export function convertFeetToFeetInches(totalFeet: number, bangla: boolean = true): FeetInchesResult {
  const safeFeet = Math.max(0, isNaN(totalFeet) ? 0 : totalFeet);
  let wholeFeet = Math.floor(safeFeet);
  let inches = Math.round((safeFeet - wholeFeet) * 12);
  if (inches >= 12) {
    wholeFeet += 1;
    inches = 0;
  }

  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toB = (val: number | string) => String(val).replace(/[0-9]/g, d => bn[Number(d)]);

  const bFeet = toB(wholeFeet);
  const bInches = toB(inches);

  return {
    totalFeet: safeFeet,
    feet: wholeFeet,
    inches,
    formattedBengali: `${bFeet} ফুট ${bInches} ইঞ্চি`,
    formattedShortBengali: `${bFeet}' - ${bInches}"`,
    formattedEnglish: `${wholeFeet}' - ${inches}"`,
    formattedFullEnglish: `${wholeFeet} ft ${inches} in`,
    badgeText: bangla ? `${bFeet}' - ${bInches}"` : `${wholeFeet}' - ${inches}"`
  };
}

/**
 * Convert Links into Feet & Inches breakdown
 */
export function convertLinksToFeetInches(links: number, bangla: boolean = true): FeetInchesResult {
  return convertFeetToFeetInches((links || 0) * FEET_PER_LINK, bangla);
}
