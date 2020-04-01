/* eslint-disable no-undef */
const DEBUG_SINGLE_SOLUTION = 0;
const TARGET_QUALITY = 10;
const STOP_THRESHOLD = 10000;

const TROOP_COST_FACTORS = [0, 100, 150, 200, 500, 1000, 5000, 20000, 100000];
const TROOP_INPUTS = [
  document.querySelector("#T1"),
  document.querySelector("#T2"),
  document.querySelector("#T3"),
  document.querySelector("#T4"),
  document.querySelector("#T5"),
  document.querySelector("#T6")
];
const INPUT_LEVEL = document.querySelector("#Level");
const INPUT_QUALITY = document.querySelector("#Quality");
const INPUT_XP = document.querySelector("#Xp");
const INPUT_TARGET_LEVEL = document.querySelector("#TargetLevel");
const INPUT_TROOP_COST_FACTOR = document.querySelector("#TroopCostFactor");
const ALL_INPUTS = [
  ...TROOP_INPUTS,
  INPUT_LEVEL,
  INPUT_QUALITY,
  INPUT_XP,
  INPUT_TARGET_LEVEL,
  INPUT_TROOP_COST_FACTOR,
];
const MAIN_TABLE_COLUMNS = ["Step", "Treasure", "Gold", "Level", "Quality"];
const MAIN_TABLE_ATTRIBUTES = ["nr", "troops", "cost", "level", "quality"];
var resultMessage;

if (!window.Worker) {
  showMessage("Your browser does not support web workers :(", true, false);
  document.getElementById("MainForm").classList.add("hidden");
  document.getElementById("Results").classList.add("hidden");
  throw new Error("Your browser does not support web workers :(");
}

document.getElementById("CloseButton").classList.add("hidden");

// Prevent form submission
var buttons = document.querySelectorAll("form button:not([type=\"submit\"])");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", function(e) {
    e.preventDefault();
  });
}

// Set event handlers
document.getElementById("HelpButton").addEventListener("click", function() {
  showHelp();
});
for (let input of ALL_INPUTS) {
  input.onchange = calculate;
}
INPUT_TROOP_COST_FACTOR.oninput = calculate;
for (let input of [...TROOP_INPUTS, INPUT_LEVEL, INPUT_QUALITY, INPUT_XP, INPUT_TARGET_LEVEL]) {
  input.previousElementSibling.addEventListener("click", function() {
    this.parentNode.querySelector("input[type=number]").stepDown();
    calculate();
  });
  input.nextElementSibling.addEventListener("click", function() {
    this.parentNode.querySelector("input[type=number]").stepUp();
    calculate();
  });
  input.previousElementSibling.tabIndex = -1;
  input.nextElementSibling.tabIndex = -1;
}
document.getElementById("StopButton").onclick = stop;

initTable("MainTable", MAIN_TABLE_COLUMNS);
if (DEBUG_SINGLE_SOLUTION) {
  initTable("MainTable2", MAIN_TABLE_COLUMNS);
}
var myWorker;
calculate();

function calculate() {
  if (DEBUG) console.log("Calculating.........................................................");
  if (Number(INPUT_QUALITY.value) >= TARGET_QUALITY
    && Number(INPUT_LEVEL.value) >= Number(INPUT_TARGET_LEVEL.value)) {
    showMessage("No need to upgrade!", true, false);
    return;
  } else {
    hideMessage();
  }
  if (myWorker) myWorker.terminate();
  myWorker = new Worker("worker.js");
  myWorker.onmessage = render;
  var budget = [];
  for (let [i, input] of TROOP_INPUTS.entries()) {
    budget[i] = input.value;
  }
  let solution = {
    runTests: false,
    budget: budget,
    initialQuality: Number(INPUT_QUALITY.value),
    initialLevel: Number(INPUT_LEVEL.value),
    initialXp: Number(INPUT_XP.value),
    targetLevel: Number(INPUT_TARGET_LEVEL.value),
    targetQuality: TARGET_QUALITY,
    troopCostFactor: TROOP_COST_FACTORS[Number(INPUT_TROOP_COST_FACTOR.value)],
    maxRefinementLevel: MAX_REFINEMENT_LEVEL
  };
  myWorker.postMessage(solution);
  showMessage("Calculating...", false, true, false);
  document.getElementById("Results").classList.add("blurred");
  document.getElementById("InterruptIndicator").classList.add("hidden");
}

function stop() {
  if (myWorker) myWorker.terminate();
  showMessage(resultMessage, false, false, false);
  document.getElementById("InterruptIndicator").classList.remove("hidden");
}

function render(workerMessage) {
  let solution = workerMessage.data;
  if (DEBUG) console.log("Time: " + solution.time / 1000 + " s, " + solution.iterations + " iterations, best cost: " + solution.bestGoldCost);
  if (!solution.bestSteps.length) {
    showMessage("Cannot find any useful steps!", true, false, false);
    return;
  }

  showMessage("Refining...", false, true, solution.time > STOP_THRESHOLD);
  document.getElementById("Results").classList.remove("blurred");

  updateResultMessage(solution);
  if (solution.final) {
    showMessage(resultMessage, false, false, false);
  }

  let troopCountDiv = document.getElementById("TroopCounts");
  troopCountDiv.innerHTML = "";
  for (let [i, count] of solution.troopCounts.entries()) {
    if (!count) continue;
    let card = document.createElement("div");
    card.classList.add("card", "card" + i, "troop-entry");
    troopCountDiv.appendChild(card);
    troopCountDiv.innerHTML += " x " + count + "&nbsp;&nbsp;&nbsp;";
  }

  const tableId = DEBUG_SINGLE_SOLUTION ? solution.secondarySearch ? "MainTable2" : "MainTable" : "MainTable";
  const table = clearTable(tableId);

  for (let [i, step] of solution.bestSteps.entries()) {
    let tr = table.insertRow(-1);
    for (let attribute of MAIN_TABLE_ATTRIBUTES) {
      let td = tr.insertCell(-1);
      if (attribute == "nr") {
        td.innerHTML = i + 1;
      } else if (attribute == "troops") {
        td.classList.add("fontSizeZero");
        for (let troop of step.troops) {
          let card = document.createElement("div");
          card.classList.add("card");
          card.classList.add("card" + troop);
          td.appendChild(card);
        }
      } else {
        td.innerHTML = step[attribute];
      }
    }
  }

  document.getElementById("TotalCostContainer").classList.remove("hidden");
  document.getElementById("TotalCost").innerHTML = solution.bestGoldCost;
}

function updateResultMessage(solution) {
  if (solution.bestQuality >= solution.targetQuality) {
    if (solution.bestLevel >= solution.targetLevel) {
      if (solution.bestSteps.length > 1 &&
        solution.bestSteps[solution.bestSteps.length - 2].quality == TARGET_QUALITY) {
        resultMessage = "Reached quality " + TARGET_QUALITY + " and level " + solution.targetLevel + ", extra steps just to level up";
      }
      else {
        resultMessage = "Reached quality " + TARGET_QUALITY + " and level " + solution.targetLevel + "!";
      }
    }
    else {
      resultMessage = "Reached quality " + TARGET_QUALITY + " but couldn't reach level " + solution.targetLevel + " :(";
    }
  }
  else {
    if (solution.bestLevel >= solution.targetLevel) {
      resultMessage = "Reached level " + solution.targetLevel + " but couldn't reach quality " + TARGET_QUALITY + " :(";
    }
    else {
      resultMessage = "Could not reach quality " + TARGET_QUALITY + " or level " + solution.targetLevel + " :(";
    }
  }
}

function showMessage(message, hideTable, showSpinner, showStopButton) {
  if (message) document.getElementById("Message").innerHTML = message;
  toggleElement("Results", !hideTable);
  toggleElement("StopButton", showStopButton);
  document.getElementById("Spinner").style.display = showSpinner ? "inline-block" : "none";
}

function toggleElement(elementId, status) {
  if (status) {
    document.getElementById(elementId).classList.remove("hidden");
  } else {
    document.getElementById(elementId).classList.add("hidden");
  }
}

function hideMessage() {
  showMessage("&nbsp;", false, false);
}

function showHelp() {
  document.getElementById("MainForm").classList.add("hidden");
  document.getElementById("Message").classList.add("hidden");
  document.getElementById("Results").classList.add("hidden");
  document.getElementById("HelpButton").classList.add("hidden");
  document.getElementById("CloseButton").classList.remove("hidden");
  document.getElementById("Help").classList.remove("hidden");
  document.body.addEventListener("click", hideHelp, true);
}

function hideHelp() {
  document.getElementById("MainForm").classList.remove("hidden");
  document.getElementById("Message").classList.remove("hidden");
  document.getElementById("Results").classList.remove("hidden");
  document.getElementById("HelpButton").classList.remove("hidden");
  document.getElementById("CloseButton").classList.add("hidden");
  document.getElementById("Help").classList.add("hidden");
  document.body.removeEventListener("click", hideHelp, true);
}