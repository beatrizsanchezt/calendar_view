let data = null;
let slots = null;
const SLOT_DURATION = 30;

readData();

function readData() {
  fetch("../data.json")
    .then((response) => response.json())
    .then((dataJson) => {
      data = dataJson;
      slots = getSlotsDay();
      assignPinnedTask();
      renderTimes();
    });
}

function getSlotsDay() {
  let slots = [];
  let startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  let endTime;
  let numberSlots = (24 * 60) / SLOT_DURATION;

  for (let i = 0; i < numberSlots; i++) {
    endTime = new Date(startTime.getTime() + SLOT_DURATION * 60000);
    let slot = {
      ind: i,
      iniTime: startTime,
      endTime: endTime,
      tasks: [],
    };
    slots.push(slot);
    startTime = endTime;
  }
  return slots;
}

//Move pinned first, then highest priority, duration desc
function sortFunction(taskA, taskB) {
  if (taskA.pinned < taskB.pinned) {
    return 1;
  }
  if (taskA.pinned > taskB.pinned) {
    return -1;
  } else if (taskA === "false") {
    return taskA.priority == taskB.priority
      ? taskB.duration - taskA.duration
      : taskA.priority - tasksB.priority;
  }
}

function assignPinnedTask() {
  //TODO: this should receive pinned tasks
  let sortedTasks = data.tasks.sort(sortFunction);
  let indexNotPinned = sortedTasks.findIndex((task) => task.pinned === "false");
  const pinnedTasks = sortedTasks.splice(0, indexNotPinned);

  pinnedTasks.forEach((task) => {
    let unitTime = task.iniTime.split(":");
    let hour = unitTime[0];
    let min = unitTime[1];
    let ind = (hour * 60) / SLOT_DURATION;

    if (min >= 30) {
      ind++;
    }

    const slotsQuantity = Math.round(task.duration / 30);
    task.slotsQuantity = slotsQuantity;

    for (let i = 0; i < slotsQuantity; i++) {
      slots[ind].tasks.push(task);
      ind++;
    }
  });
}

function renderTimes() {
  let prevTaskId = null;
  const grid = document.getElementById("grid");
  slots.forEach((slot) => {
    const newDiv = document.createElement("div");
    newDiv.style.gridRow = slot.ind + 1;
    newDiv.textContent = slot.iniTime.toLocaleTimeString("en-uk", {
      hour: "2-digit",
      minute: "2-digit",
    });
    newDiv.classList.add("grid-item");
    grid.appendChild(newDiv);

    //render slots

    if (slot.tasks.length == 0 || slot.tasks[0].id !== prevTaskId) {
      const newSlot = newDiv.cloneNode();
      newSlot.style.gridCol = 2;

      if (slot.tasks.length == 0) {
        newSlot.textContent = "Free";
        prevTaskId = null;
      } else {
        newSlot.style.gridRow = `${slot.ind + 1}/span ${
          slot.tasks[0].slotsQuantity
        }`;
        newSlot.textContent = `${slot.tasks[0].name}, ${slot.tasks[0].duration}`;
        //TODO: render concurrent events
        prevTaskId = slot.tasks[0].id;
      }
      grid.appendChild(newSlot);
    }
  });
}

//assignPinnedTask();

//not tested

function scheduleTasks() {}

function scheduleTask(task) {
  if (task.pinned) {
    assignFixedTask(task);
  }
}
