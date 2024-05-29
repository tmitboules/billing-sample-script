import { RuleVariation } from "../types";

export const RULE_VARIATIONS: RuleVariation[] = [
  // standard rules
  {
    shiftChange: "cut",
    shiftDailyMax: 8,
    shiftMinimum: 4,
    otShiftDailyMax: 12,
    otSat: true,
    otSun: false,
    nightHoursStart: 18,
    nightHoursEnd: 7,
  },
  {
    shiftChange: "start",
    shiftDailyMax: 8,
    shiftMinimum: 4,
    otShiftDailyMax: 12,
    otSat: true,
    otSun: false,
    nightHoursStart: 18,
    nightHoursEnd: 7,
  },

  // no premium time
  {
    shiftChange: "start",
    shiftDailyMax: 8,
    shiftMinimum: 4,
    otShiftDailyMax: null,
    otSat: true,
    otSun: true,
    nightHoursStart: null,
    nightHoursEnd: null,
  },
  {
    shiftChange: "cut",
    shiftDailyMax: 8,
    shiftMinimum: 4,
    otShiftDailyMax: null,
    otSat: true,
    otSun: true,
    nightHoursStart: null,
    nightHoursEnd: null,
  },
];

export const SHIFTS = [
  {
    start: new Date("5/15/2024 24:00"),
    end: new Date("5/16/2024 10:00"),
  },
  {
    start: new Date("5/15/2024 8:00"),
    end: new Date("5/15/2024 10:00"),
  },
  {
    start: new Date("5/15/2024 16:00"),
    end: new Date("5/15/2024 21:00"),
  },
  {
    start: new Date("5/17/2024 18:00"),
    end: new Date("5/18/2024 8:00"),
  },
  {
    start: new Date("5/18/2024 8:00"),
    end: new Date("5/18/2024 18:00"),
  },
  {
    start: new Date("5/18/2024 18:00"),
    end: new Date("5/19/2024 5:00"),
  },
  {
    start: new Date("5/19/2024 18:00"),
    end: new Date("5/20/2024 3:00"),
  },
];
