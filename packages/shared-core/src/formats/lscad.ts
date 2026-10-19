/**
 * LSCAD Project File Schema & Serializer
 * Native JSON project format for Land Survey CAD platform
 */

export interface LSCADProjectData {
  version: string;
  timestamp: string;
  mouzaInfo: {
    mouza: string;
    jlNo: string;
    upazila: string;
    district: string;
    sheetNo: string;
    scalePreset: string;
  };
  plots: Array<{
    id: string;
    name: string;
    vertices: Array<{ x: number; y: number }>;
    color?: string;
  }>;
  pillars: Array<{
    id?: string;
    name: string;
    x: number;
    y: number;
    type?: string;
  }>;
  annotations: Array<{
    id?: string;
    text: string;
    x: number;
    y: number;
  }>;
  khatianOwners?: Array<{
    id: number;
    name: string;
    share: number;
  }>;
  calibration?: {
    scaleFactor: number;
    unit: string;
  };
}

export function serializeLSCAD(data: Partial<LSCADProjectData>): string {
  const fullData: LSCADProjectData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mouzaInfo: data.mouzaInfo || {
      mouza: 'খাজুরাদিয়া',
      jlNo: '১৬',
      upazila: 'ফরিদগঞ্জ',
      district: 'চাঁদপুর',
      sheetNo: '১',
      scalePreset: '16_inch'
    },
    plots: data.plots || [],
    pillars: data.pillars || [],
    annotations: data.annotations || [],
    khatianOwners: data.khatianOwners || [],
    calibration: data.calibration
  };
  return JSON.stringify(fullData, null, 2);
}

export function parseLSCAD(jsonString: string): LSCADProjectData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.plots)) {
    throw new Error('Invalid .lscad project file format');
  }
  return parsed as LSCADProjectData;
}
