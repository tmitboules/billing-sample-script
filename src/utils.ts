import {
  set,
  getHours,
  addDays,
  subDays,
  addHours,
  format,
  differenceInHours,
} from "date-fns";
import { RuleVariation, ShiftKey, ShiftSplits } from "../types";

export function addQuantityCheckingMinimum(
  remaining: number,
  rules: RuleVariation,
) {
  return remaining > rules.shiftMinimum ? remaining : rules.shiftMinimum;
}

export function getIsNight(cur: Date, rules: RuleVariation): boolean {
  if (!rules.nightHoursStart || !rules.nightHoursEnd) return false;

  let nightHoursStart = set(new Date(cur), {
    hours: rules.nightHoursStart,
    minutes: 0,
  });
  let nightHourEnd = set(new Date(cur), {
    hours: rules.nightHoursEnd,
    minutes: 0,
  });

  if (getHours(cur) > getHours(nightHourEnd)) {
    nightHourEnd = addDays(nightHourEnd, 1);
  } else {
    nightHoursStart = subDays(nightHoursStart, 1);
  }

  if (nightHoursStart <= cur && cur < nightHourEnd) {
    return true;
  }

  return false;
}

export function addHourToSplit(key: ShiftKey, time: Date, splits: ShiftSplits) {
  if (!splits[key].start) {
    splits[key].start = time;
  }

  if (!splits[key].end) {
    splits[key].end = addHours(time, 1);
  } else {
    splits[key].end = addHours(splits[key].end!, 1);
  }
}

export function printShiftSplits(splits: ShiftSplits) {
  const printableShift = Object.entries(splits).reduce(
    (acc, [split, shift]) => {
      if (shift.start && shift.end) {
        acc = {
          ...acc,
          [split]: {
            start: format(shift.start!, "MM/dd, p"),
            end: format(shift.end!, "MM/dd, p"),
            qty: shift.qty,
          },
        };
      }

      return acc;
    },
    {},
  );

  console.log(printableShift);
}

export function initShiftSplits(): ShiftSplits {
  return {
    standard: {
      start: null,
      end: null,
    },
    night: {
      start: null,
      end: null,
    },
    overTime: {
      start: null,
      end: null,
    },
    premiumTime: {
      start: null,
      end: null,
    },
  };
}

export function calcHoursTillNextDay(time: Date): number {
  return 24 - getHours(time);
}

export function calcHoursTillNightShift(time: Date, start: number): number {
  return start - getHours(time);
}

export function calcHoursTillDayShift(time: Date, end: number): number {
  let nightHourEnd = set(new Date(time), {
    hours: end,
    minutes: 0,
  });

  if (getHours(time) > getHours(end)) {
    nightHourEnd = addDays(nightHourEnd, 1);
  }

  return differenceInHours(nightHourEnd, time);
}
