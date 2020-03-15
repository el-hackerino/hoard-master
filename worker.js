importScripts('constants.js');

const DEBUG = 0;
const BUDGET_MAX = [0, 10, 36, 28, 20, 18];
const RNG_MIN = 0;
const RNG_MAX = [0, 10, 20, 20, 20, 10];
const RNG_LEVEL_MIN = 30;
const RNG_LEVEL_MAX = 90;
const RNG_QUALITY_MIN = 3;
const RNG_QUALITY_MAX = 9;
var levelXp = [];
var allCombos = [];
var quickCombos = [];

fillXpTable();
makeCombos();

onmessage = function (message) {
  //console.log('Worker: Message received from main script');
  //console.log(e.data);
  for (let i = 0; i < message.data.num_tests; i++) {
    let result = runTestIteration(message.data);
    //console.log('Worker: Posting message back to main script');
    postMessage(result);
  }
}

function resetSolution(solution) {
  solution.reachedQuality = false;
  solution.reachedLevel = false;
  solution.steps = [];
  solution.bestSteps = [];
  solution.bestCost = 1000000;
  solution.bestLevel = solution.initialLevel;
  solution.bestQuality = solution.initialQuality;
  solution.troopTotals = [0, 0, 0, 0, 0, 0];
  solution.iterations = 0;
  for (let [i, value] of solution.budget.entries()) {
    solution.budget[i] = Math.min(BUDGET_MAX[i], Number(value));
  }
}

function runTestIteration(solution) {
  resetSolution(solution);
  
  if (solution.run_tests) {
    for (let t = 0; t < solution.budget.length; t++) {
      solution.budget[t] = Math.floor((Math.random() * (RNG_MAX[t] - RNG_MIN)) + RNG_MIN);
    }
    solution.initialLevel = Math.floor((Math.random() * (RNG_LEVEL_MAX - RNG_LEVEL_MIN)) + RNG_LEVEL_MIN);
    solution.initialQuality = Math.floor((Math.random() * (RNG_QUALITY_MAX - RNG_QUALITY_MIN)) + RNG_QUALITY_MIN);
  }

  findSolution(solution, solution.run_tests ? 1 : solution.useQuickList);
  solution.comboCounts = countIds(solution.bestSteps);

  if (!solution.run_tests) {
    return solution;
  }
  let slowSolution = Object.assign({}, solution);
  resetSolution(slowSolution);
  findSolution(slowSolution, 0);
  slowSolution.comboCounts = countIds(slowSolution.bestSteps);
  solution.slowSolution = slowSolution;
  solution.slowTime = slowSolution.time;
  if (solution.bestQuality >= slowSolution.bestQuality && solution.bestLevel >= slowSolution.bestLevel) {
    solution.quickCostDiff = solution.bestCost - slowSolution.bestCost;
  } else {
    solution.quickCostDiff = slowSolution.bestQuality + "->" + solution.bestQuality + ", " + slowSolution.bestLevel + "->" + solution.bestLevel;
  }
  
  // Count used troops
  let combos = allCombos;
  solution.troopCounts = [];
  for (let step of solution.bestSteps) {
    for (let t = 0; t < TROOPS.length; t++) {
      if (combos[step.combo].counts[t]) {
        solution.troopCounts[t] = solution.troopCounts[t] ? solution.troopCounts[t] + combos[step.combo].counts[t] : combos[step.combo].counts[t];
      }
    }
  }
  return solution;
}

function findSolution(solution, quick) {
  let solTime = new Date().getTime();
  let combos = quick ? quickCombos : allCombos;
  search(0, 0, solution, combos);
  // Convert steps to old form as expected by the render methods
  for (let step of solution.bestSteps) {
    for (var prop in combos[step.combo]) {
      if (Object.prototype.hasOwnProperty.call(combos[step.combo], prop)) {
          step[prop] = combos[step.combo][prop];
      }
    }
  }
  solution.time = (new Date().getTime() - solTime);
}

function search(startCombo, depth, solution, combos) {
  for (let c = startCombo; c < combos.length; c++) {
    var reachedQuality = false;
    var reachedLevel = false;
    solution.iterations++;
    // if (solution.iterations % 100000 == 0) {
    //   console.log(solution.iterations);
    // }
    if (solution.steps[depth]) {
      subtractFromTotal(solution, combos[solution.steps[depth].combo]);
    }
    solution.steps[depth] = {combo: c, comboId: combos[c].id};
    solution.lastInsert = depth;
    addToTotal(solution, combos[c]);
    if (budgetFits(solution)) {
      calculateStats(solution, combos);
      if (solution.quality == solution.goalQuality) {
        reachedQuality = true;
        if (!solution.reachedQuality) {
          if (DEBUG) console.log("Reached target quality!");
          solution.reachedQuality = true;
          saveBestSolution(solution);
        }
      }
      if (solution.sumLevel >= solution.goalLevel) {
        reachedLevel = true;
        if (!solution.reachedLevel) {
          if (DEBUG) console.log("Reached target level!");
          solution.reachedLevel = true;
          saveBestSolution(solution);
        }
      }
      if (solution.quality > solution.bestQuality && solution.quality <= solution.goalQuality) {
        if (DEBUG) console.log("New quality: " + solution.quality);
        saveBestSolution(solution);
      } else if ((solution.sumCost < solution.bestCost && solution.quality == solution.bestQuality)
        && reachedQuality == solution.reachedQuality && reachedLevel == solution.reachedLevel) {
        if (DEBUG) console.log("New best cost at same goal status: " + solution.sumCost);
        saveBestSolution(solution);
      }
      if (!reachedQuality) {;// || !reachedLevel) { // Need additional logic after quality goal is reached?
        search(c, depth + 1, solution, combos);
      }
    }
  }
  subtractFromTotal(solution, combos[solution.steps[depth].combo]);
  solution.steps.pop();
}

function saveBestSolution(solution) {
  solution.bestQuality = solution.quality;
  solution.bestLevel = solution.sumLevel;
  solution.bestCost = solution.sumCost;
  solution.bestSteps = JSON.parse(JSON.stringify(solution.steps));
  //console.log(solution);
}

function addToTotal(solution, combo) {
  for (let tc = 0; tc < TROOPS.length; tc++) {
    if (!solution.troopTotals[tc]) {
      solution.troopTotals[tc] = 0;
    }
    if (combo.counts[tc]) {
      solution.troopTotals[tc] += combo.counts[tc];
    }
  }
}

function subtractFromTotal(solution, combo) {
  for (let tc = 0; tc < TROOPS.length; tc++) {
    if (combo.counts[tc]) {
      solution.troopTotals[tc] -= combo.counts[tc];
    }
  }
}

function calculateStats(solution, combos) {
  let step = solution.steps[solution.lastInsert];
  solution.quality = solution.initialQuality + solution.lastInsert + 1;
  if (solution.quality > 10) solution.quality = 10;
  step.quality = solution.quality;
  let prevXp, prevLevel, prevCost;
  if (solution.lastInsert == 0) {
    prevXp = levelXp[solution.initialLevel] + solution.initialXp;
    prevLevel = solution.initialLevel;
    prevCost = 0;
  } else {
    let prevStep = solution.steps[solution.lastInsert - 1];
    prevXp = prevStep.sumXp;
    prevLevel = prevStep.level;
    prevCost = prevStep.sumCost;
  }
  step.sumXp = prevXp + combos[step.combo].xp;
  step.level = getLevel(prevLevel, step.sumXp);
  step.cost = getCost(prevLevel, combos[step.combo].troops.length);
  step.sumCost = prevCost + step.cost;
  step.extraXp = step.sumXp - levelXp[step.level];
  solution.sumXp = step.sumXp;
  solution.sumLevel = step.level;
  solution.sumCost = step.sumCost;
}

function budgetFits(solution) {
  for (let i = 0; i < solution.budget.length; i++) {
    if (solution.troopTotals[i] > solution.budget[i]) {
      return false;
    }
  }
  return true;
}

/////////////////////////////////////////////////////////////////////////

function countTroops(arr) {
  return arr.reduce(function (acc, curr) {
    acc[curr] ? acc[curr]++ : (acc[curr] = 1);
    return acc;
  }, {});
}

function fillXpTable() {
  for (let i = 0; i < 1000; i++) {
    levelXp[i] = 0.5 * i + 0.5 * i * i;
  }
}

function sumXp(total, i) {
  return total + TROOPS[i].xp;
}

function sumPercent(total, i) {
  return total + TROOPS[i].percent;
}

function getLevel(level, newXp) {
  // Actually slower
  // return parseInt(-0.5 + Math.sqrt(0.25 + 2 * newXp));
  while (level < 1000) {
    level++;
    if (levelXp[level] > newXp) {
      return level - 1;
    }
  }
  return level;
}

function getCost(level, numTroops) {
  return (600 + 200 * level) * numTroops;
}

function makeCombos() {
  let id = 0;
  for (let template of TEMPLATES) {
    let combo = {};
    combo.id = id;
    combo.troops = template;
    combo.percent = combo.troops.reduce(sumPercent, 0);
    combo.xp = combo.troops.reduce(sumXp, 0);
    combo.counts = countTroops(combo.troops);
    if (TEMPLATES_QUICK.includes(combo.id)) {
      quickCombos.push(combo);
    }
    allCombos.push(combo);
    id++;
  }
}

function countIds(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      result[arr[i].combo] ? result[arr[i].combo]++ : result[arr[i].combo] = 1;
    }
  }
  return result;
}
