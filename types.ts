// Splits
export type ShiftKey = "standard" | "night" | "overTime" | "premiumTime";

export type Shift = {
  start: Date | null;
  end: Date | null;
  qty?: number;
};

export type ShiftSplits = Record<ShiftKey, Shift>;

// Rules
export type ShiftChangeType = "cut" | "start";
export type RuleVariation = {
  shiftChange: ShiftChangeType;
  shiftDailyMax: number;
  shiftMinimum: number;
  otShiftDailyMax: number | null;
  otSat: boolean;
  otSun: boolean;
  nightHoursStart: number | null;
  nightHoursEnd: number | null;
};
