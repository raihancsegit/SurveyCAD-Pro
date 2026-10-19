/**
 * Bangladesh Cadastral Mouza Map Scale Presets
 */

export interface MouzaScalePreset {
  id: string;
  name: string;
  nameBangla: string;
  inchToMile: number;
  ratio: number;
  feetPerInch: number;
  linksPerInch: number;
  description: string;
}

export const BANGLADESH_SCALE_PRESETS: Record<string, MouzaScalePreset> = {
  '16_inch': {
    id: '16_inch',
    name: '16 Inch = 1 Mile',
    nameBangla: '১৬ ইঞ্চি = ১ মাইল (সাধারণ মৌজা নকশা)',
    inchToMile: 16,
    ratio: 3960,
    feetPerInch: 330.0,
    linksPerInch: 500.0,
    description: 'Standard Bangladesh CS & RS Rural Cadastral Sheet'
  },
  '32_inch': {
    id: '32_inch',
    name: '32 Inch = 1 Mile',
    nameBangla: '৩২ ইঞ্চি = ১ মাইল (আধা-শহরাঞ্চল নকশা)',
    inchToMile: 32,
    ratio: 1980,
    feetPerInch: 165.0,
    linksPerInch: 250.0,
    description: 'Semi-Urban / Congested Mouza Map'
  },
  '64_inch': {
    id: '64_inch',
    name: '64 Inch = 1 Mile',
    nameBangla: '৬৪ ইঞ্চি = ১ মাইল (পৌরসভা / শহর নকশা)',
    inchToMile: 64,
    ratio: 990,
    feetPerInch: 82.5,
    linksPerInch: 125.0,
    description: 'City / Municipal Survey Sheet'
  },
  '80_inch': {
    id: '80_inch',
    name: '80 Inch = 1 Mile',
    nameBangla: '৮০ ইঞ্চি = ১ মাইল (উচ্চ ঘনবসতিপূর্ণ নকশা)',
    inchToMile: 80,
    ratio: 792,
    feetPerInch: 66.0,
    linksPerInch: 100.0,
    description: 'Detailed High Density Urban / Industrial Plot Sheet'
  },
  '4_inch': {
    id: '4_inch',
    name: '4 Inch = 1 Mile',
    nameBangla: '৪ ইঞ্চি = ১ মাইল (থানা / টোপোগ্রাফিক নকশা)',
    inchToMile: 4,
    ratio: 15840,
    feetPerInch: 1320.0,
    linksPerInch: 2000.0,
    description: 'Thana / Regional Overview Topographic Map'
  }
};
