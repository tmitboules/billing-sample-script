import { RULE_VARIATIONS, SHIFTS } from "./rules_tests";
import { RuleVariation } from "../types";
import {
  addQuantityCheckingMinimum,
  calcHoursTillDayShift,
  calcHoursTillNextDay,
  calcHoursTillNightShift,
  getIsNight,
  initShiftSplits,
  printShiftSplits,
} from "./utils";
import {
  addHours,
  differenceInHours,
  isSaturday,
  isSunday,
  format,
  isFriday,
} from "date-fns";

function calculateShiftSplits(start: Date, end: Date, rules: RuleVariation) {
  let splits = initShiftSplits();
  const totalShiftLength = differenceInHours(end, start);
  const {
    otSun,
    otSat,
    shiftChange,
    shiftDailyMax,
    otShiftDailyMax,
    nightHoursStart,
    nightHoursEnd,
  } = rules;

  console.log("\n--- SHIFT INFO ---\n", {
    start: format(start, "EEEE, p"),
    end: format(end, "EEEE, p"),
    shiftLength: totalShiftLength,
    shiftChange,
  });

  // Sunday, carry over rate regardless of shift change type
  if (isSunday(start)) {
    if (otSun) {
      splits.overTime = {
        start,
        end,
        qty: addQuantityCheckingMinimum(totalShiftLength, rules),
      };
    }

    if (!otSun) {
      splits.premiumTime = {
        start,
        end,
        qty: addQuantityCheckingMinimum(totalShiftLength, rules),
      };
    }

    return printShiftSplits(splits);
  }

  // Saturday
  if (isSaturday(start) && otSat) {
    let hoursTillSunday = calcHoursTillNextDay(start);
    if (
      shiftChange == "start" ||
      otSun ||
      hoursTillSunday >= totalShiftLength
    ) {
      splits.overTime = {
        start,
        end,
        qty: addQuantityCheckingMinimum(totalShiftLength, rules),
      };
      return printShiftSplits(splits);
    }

    let splitAt = addHours(start, hoursTillSunday);

    splits.overTime = {
      start,
      end: splitAt,
      qty: differenceInHours(splitAt, start),
    };

    splits.premiumTime = {
      start: splitAt,
      end,
      qty: differenceInHours(end, splitAt),
    };

    return printShiftSplits(splits);
  }

  let remaining = totalShiftLength;

  // standard rate during day
  if (!getIsNight(start, rules)) {
    let standardQty = 0;
    let nightQty = 0;

    if (remaining > shiftDailyMax) {
      standardQty = shiftDailyMax;
    } else {
      standardQty = remaining;
    }

    // friday to saturday cut
    if (
      isFriday(start) &&
      calcHoursTillNextDay(start) < standardQty &&
      shiftChange == "cut"
    ) {
      standardQty = calcHoursTillNextDay(start);
      console.log(standardQty);
    }

    if (shiftChange == "cut" && nightHoursStart != null) {
      const hoursTillNight = calcHoursTillNightShift(start, nightHoursStart);
      // figure out night hours start for friday

      if (hoursTillNight < shiftDailyMax) {
        nightQty = standardQty - hoursTillNight;
        standardQty = standardQty - nightQty;

        splits.night = {
          start: addHours(start, standardQty),
          end: addHours(start, standardQty + nightQty),
          qty: nightQty,
        };
        remaining = remaining - nightQty;
      }
    }

    splits.standard = {
      start,
      end: addHours(start, standardQty),
      qty: standardQty,
    };
    remaining = remaining - standardQty;
  }

  // Night Rate
  if (getIsNight(start, rules)) {
    let nightQty = 0;
    let standardQty = 0;

    if (remaining > shiftDailyMax) {
      nightQty = shiftDailyMax;
    } else {
      nightQty = remaining;
    }

    // calc fri - sat cut
    if (
      isFriday(start) &&
      calcHoursTillNextDay(start) < nightQty &&
      shiftChange == "cut"
    ) {
      nightQty = calcHoursTillNextDay(start);
    }

    if (shiftChange == "cut" && nightHoursEnd != null) {
      const hoursTillDay = calcHoursTillDayShift(start, nightHoursEnd);

      if (hoursTillDay < shiftDailyMax) {
        standardQty = nightQty - hoursTillDay;
        nightQty = nightQty - standardQty;

        splits.standard = {
          start: addHours(start, nightQty),
          end: addHours(start, standardQty + nightQty),
          qty: standardQty,
        };
        remaining = remaining - standardQty;
      }
    }

    splits.night = {
      start,
      end: addHours(start, nightQty),
      qty: nightQty,
    };
    remaining = remaining - nightQty;
  }

  // Overtime Hours
  if (remaining > 0) {
    let otLength = remaining;
    let otMax = otShiftDailyMax ? otShiftDailyMax - shiftDailyMax : 0;

    if (otMax && remaining > otMax) {
      otLength = otMax;
    }

    splits.overTime = {
      // can't use shift daily max here
      start: addHours(start, shiftDailyMax),
      end: addHours(start, shiftDailyMax + otLength),
      qty: otLength,
    };

    remaining = remaining - otLength;
  }

  // Premium Time Hours
  if (remaining > 0 && otShiftDailyMax) {
    splits.premiumTime = {
      start: addHours(start, otShiftDailyMax),
      end,
      qty: remaining,
    };
  }

  return printShiftSplits(splits);
}

function main() {
  RULE_VARIATIONS.forEach((variation, i) => {
    console.log("*** Variation Set " + (i + 1) + " ***");
    console.log(variation);
    console.log("*******");

    SHIFTS.forEach((shift) =>
      calculateShiftSplits(shift.start, shift.end, variation),
    );
  });

  // const rule = 2;
  // const shift = 3;
  //
  // calculateShiftSplits(
  //   SHIFTS[shift].start,
  //   SHIFTS[shift].end,
  //   RULE_VARIATIONS[rule],
  // );
}

main();
