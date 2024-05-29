import {
  addHours,
  differenceInHours,
  isWeekend as getIsWeekend,
  isSaturday,
  isSunday,
} from "date-fns";
import { RULE_VARIATIONS, SHIFTS } from "./rules_tests";
import {
  addQuantityCheckingMinimum,
  initShiftSplits,
  addHourToSplit,
  printShiftSplits,
  getIsNight,
} from "./utils";

const RULE_SET = RULE_VARIATIONS[0];

// TODO : Calculate Minimums
function calculateShiftChangeCutOver(start: Date, end: Date) {
  let shiftSplits = initShiftSplits();
  const shiftLength = differenceInHours(end, start);

  for (let hour = 0; hour < shiftLength; hour++) {
    const cur = addHours(start, hour);
    const isWeekend = getIsWeekend(cur);
    const isNight = getIsNight(cur, RULE_SET);

    // standard rate
    if (!isWeekend && !isNight && hour < RULE_SET.shiftDailyMax) {
      addHourToSplit("standard", cur, shiftSplits);
      continue;
    }

    // night rate
    if (!isWeekend && isNight && hour < RULE_SET.shiftDailyMax) {
      addHourToSplit("night", cur, shiftSplits);
      continue;
    }

    const isOtHours =
      (RULE_SET.otShiftDailyMax != null &&
        hour < RULE_SET.otShiftDailyMax &&
        hour >= RULE_SET.shiftDailyMax) ||
      (RULE_SET.otShiftDailyMax == null && hour >= RULE_SET.shiftDailyMax);

    const isPtHours =
      RULE_SET.otShiftDailyMax != null && hour >= RULE_SET.otShiftDailyMax;

    if (
      isOtHours ||
      (RULE_SET.otSat && isSaturday(cur) && !isPtHours) ||
      (RULE_SET.otSun && isSunday(cur) && !isPtHours)
    ) {
      console.log("saturday calc");
      addHourToSplit("overTime", cur, shiftSplits);
      continue;
    }

    addHourToSplit("premiumTime", cur, shiftSplits);
  }

  printShiftSplits(shiftSplits);
}

// calculateShiftChangeCutOver();
//

function calculateShiftChangeStart(start: Date, end: Date) {
  let shiftRemaning = differenceInHours(end, start);
  const startsDuringNight = getIsNight(start, RULE_SET);
  const splits = initShiftSplits();

  console.log("--- SHIFT INFO ---\n", {
    start: start.toString(),
    end: end.toString(),
    shiftLength: shiftRemaning,
  });

  if (isSunday(start)) {
    if (RULE_SET.otSun) {
      splits.overTime.start = start;
      splits.overTime.end = end;
      splits.overTime.qty = addQuantityCheckingMinimum(shiftRemaning, RULE_SET);
    } else {
      splits.premiumTime.start = start;
      splits.premiumTime.end = end;
      splits.premiumTime.qty = addQuantityCheckingMinimum(
        shiftRemaning,
        RULE_SET,
      );
    }

    return printShiftSplits(splits);
  }

  if (isSaturday(start) && RULE_SET.otSat) {
    splits.overTime = {
      start: start,
      end: end,
      qty: addQuantityCheckingMinimum(shiftRemaning, RULE_SET),
    };

    return printShiftSplits(splits);
  }

  // standard
  if (!startsDuringNight) {
    let standardLength = shiftRemaning;

    if (shiftRemaning > RULE_SET.shiftDailyMax) {
      standardLength = RULE_SET.shiftDailyMax;
    }

    if (shiftRemaning < RULE_SET.shiftMinimum) {
      standardLength = RULE_SET.shiftMinimum;
    }

    splits.standard = {
      start,
      end:
        shiftRemaning < RULE_SET.shiftMinimum
          ? end
          : addHours(start, standardLength),
      qty: standardLength,
    };

    shiftRemaning = shiftRemaning - standardLength;
  }

  // night
  if (startsDuringNight) {
    let nightLength = shiftRemaning;

    if (shiftRemaning > RULE_SET.shiftDailyMax) {
      nightLength = RULE_SET.shiftDailyMax;
    }

    if (shiftRemaning < RULE_SET.shiftMinimum) {
      nightLength = RULE_SET.shiftMinimum;
    }

    splits.night = {
      start,
      end:
        shiftRemaning < RULE_SET.shiftMinimum
          ? end
          : addHours(start, nightLength),
      qty: nightLength,
    };

    shiftRemaning = shiftRemaning - nightLength;
  }

  let premiumTime = 0;
  // overtime
  if (shiftRemaning > 0) {
    let otLength = shiftRemaning;

    if (
      RULE_SET.otShiftDailyMax &&
      shiftRemaning > RULE_SET.otShiftDailyMax - RULE_SET.shiftDailyMax
    ) {
      otLength = RULE_SET.otShiftDailyMax - RULE_SET.shiftDailyMax;
    }

    splits.overTime = {
      start: addHours(start, RULE_SET.shiftDailyMax),
      end: addHours(start, RULE_SET.shiftDailyMax + otLength),
      qty: otLength,
    };

    premiumTime = shiftRemaning - otLength;
  }

  if (premiumTime > 0 && RULE_SET.otShiftDailyMax) {
    splits.premiumTime = {
      start: addHours(start, RULE_SET.otShiftDailyMax),
      end,
      qty: premiumTime,
    };
  }

  return printShiftSplits(splits);
}

function main() {
  // SHIFTS.forEach((shift) =>
  //   calculateShiftChangeCutOver(shift.start, shift.end),
  // );

  calculateShiftChangeCutOver(SHIFTS[6].start, SHIFTS[6].end);
}

main();
