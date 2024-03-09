async function initBoard() {
  await includeHTML();
  await renderTasks();
  updateMenuPoint(2);
  await loadUserInitials();
  const today = new Date();
  let newDueDate = document.getElementById("add_task_due_date");
  newDueDate.setAttribute("min", today.toISOString().substring(0, 10));
}

document.addEventListener("DOMContentLoaded", function () {
  noTaskToDoNotification();
});

let currentDraggedElement;

async function renderTasks() {
  let allTasks = await getItem("allTasks");
  console.log(allTasks);
  let toDos = allTasks.filter((task) => task.status === "toDo");
  let inProgress = allTasks.filter((task) => task.status === "inProgress");
  let awaitFeedback = allTasks.filter(
    (task) => task.status === "awaitFeedback"
  );
  let done = allTasks.filter((task) => task.status === "done");
  let tasks = [toDos, inProgress, awaitFeedback, done];
  let containerIds = [
    "to_do_container",
    "In_Progress_Content",
    "Await_Feedback_Content",
    "Done_Content",
  ];

  for (let i = 0; i < tasks.length; i++) {
    let taskList = tasks[i];
    let containerId = containerIds[i];
    let container = document.getElementById(containerId);
    container.innerHTML = "";
    container.innerHTML += await generateTasks(taskList);
  }
  await noTaskToDoNotification();
}

async function generateTasks(taskList) {
  let tasksHTML = "";

  for (let j = 0; j < taskList.length; j++) {
    const task = taskList[j];
    const description = task.description ? task.description : "";
    const subtasksCount = await subTasksCount(task, taskList);
    let progressBarWidth = await generateProgressBar(task);
    let hideProgressBar = hideBar(task);
    let prio = addPrioIcon(task);
    let ContactsHTML = contactsHTML(
      task.contactsForNewTask
        ? await createContactsList(task.contactsForNewTask, false)
        : ""
    );

    tasksHTML += generateOneTaskHTML(
      task,
      subtasksCount,
      prio,
      description,
      task.id,
      ContactsHTML,
      progressBarWidth,
      hideProgressBar
    );
  }
  return tasksHTML;
}

function generateOneTaskHTML(
  task,
  subtasksCount,
  prio,
  description,
  id,
  assignedPersons,
  progressBarWidth,
  hideProgressBar
) {
  return /*html*/ `
 <div
  id="board_task_container_overwiew${id}"
  onclick="renderTaskLargeview(${id})"
  class="board-task-container-overview"
  draggable = "true"
  ondragstart = "startDragging(${task.id})"
>
  <div id="board_task_category${id}" class="board-task-category">
    ${task.category}
  </div>
  <h2 id="board_task_title${id}" class="board-task-title">${task.title}</h2>
  <div id="board-task-description${id}" class="board-task-description">
    ${description}
  </div>
  <div class="board-task-subtask-container" ${hideProgressBar}>
    <div class="board-task-progress" role="progressbar">
      <div
        id="Board_Task_Progress_Bar${id}"
        class="board-task-progress-bar"
        ${progressBarWidth}
      ></div>
    </div>
    <span id="Board_Task_Number_Of_Subtasks${id}">${subtasksCount}</span>
  </div>
  <div class="board-task-container-contacts-and-prio">
    <div id="Board_Task_Contact_Icons" class="board-task-contact-icons">${assignedPersons}</div>
    <span>${prio}</span>
  </div>
</div>
    `;
}

/* =============================
AUXILIARY FUNCTIONS RENDER-TASKS
================================*/
async function subTasksCount(task) {
  let checkedCheckboxes = getCheckedCount(task["subtasks"]);
  if (!Array.isArray(task.subtasks)) {
    return "";
  }
  let totalSubtasks = task.subtasks.length;
  return checkedCheckboxes + "/" + totalSubtasks + " Subtasks";
}

function getProgressBarWidth(task) {
  let subtasks = task["subtasks"];
  if (subtasks === undefined) {
    return;
  }
  let subtaskAmount = subtasks.length;
  let checkedCount = getCheckedCount(subtasks);
  let percent;
  percent = (checkedCount / subtaskAmount) * 100;
  return percent;
}

async function generateProgressBar(task) {
  let taskIndex = task.id;
  let progressBarWidth = getProgressBarWidth(task);

  if (task.subtasks) {
    if (task.subtasks.length > 0) {
      let progressBar = await getItem(`Board_Task_Progress_Bar${taskIndex}`);
      return `style="width: ${progressBarWidth}%"`;
    }
  } else {
    return 'style="display: none"';
  }
}

function getCheckedCount(subtasks) {
  if (subtasks === undefined) {
    return 0;
  }

  let checkedCount = 0;
  for (let oneSubtask of subtasks) {
    if (oneSubtask.checked) {
      checkedCount++;
    }
  }
  return checkedCount;
}

function hideBar(task) {
  if (task.subtasks) {
    if (task.subtasks.length > 0) {
      return "";
    }
  } else {
    return 'style="display: none"';
  }
}

function getFirstThreeContactsHTML(contacts, numberOfHiddenContacts) {
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = contacts;

  let items = Array.from(tempDiv.querySelectorAll(".button-name")).slice(0, 3);
  //Sucht alle Elemente innerhalb von tempDiv, die klasse "button-name" hat, querySelectorAll gibt NodeList zurück, die mit Array.from in ein Array umgewandelt wird
  //slice(0, 3), um ersten drei Elemente dieses Arrays zu behalten
  let firstThreeContactsHTML = "";
  for (let item of items) {
    firstThreeContactsHTML += item.outerHTML;
  }

  let html = /*html*/ `
     ${firstThreeContactsHTML}
    <span class="show-amount-of-hidden-contacts">
          +${numberOfHiddenContacts}
    </span>
  `;
  return html;
}

function contactsHTML(contacts) {
  if (contacts === "") {
    return "";
  }
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = contacts;
  let contactCount = tempDiv.querySelectorAll(".button-name").length;

  if (contactCount > 3) {
    let numberOfHiddenContacts = contactCount - 3;
    return getFirstThreeContactsHTML(contacts, numberOfHiddenContacts);
  } else {
    return contacts;
  }
}

function addPrioIcon(task) {
  switch (task.prio) {
    case "urgent":
      return '<img src="./assets/img/priorityUrgent.svg" class="board-task-prio-icon">';
      break;

    case "medium":
      return '<img src="./assets/img/priorityMedium.svg" class="board-task-prio-icon">';
      break;

    case "low":
      return '<img src="./assets/img/priorityLow.svg" class="board-task-prio-icon">';
      break;

    default:
      return "";
  }
}

/* ================
DRAG & DROP FUNCTIONS
===================*/
function startDragging(id) {
  currentDraggedElement = id;
}

function allowDrop(ev) {
  ev.preventDefault();
}

async function moveTo(status) {
  let allTasks = await getItem("allTasks");
  console.log(allTasks);
  //Element mit der id = currentDraggedElement finden
  let task = allTasks.find((task) => task.id === currentDraggedElement);
  if (task) {
    task.status = status;
    await setItem("allTasks", allTasks);
  } else {
    console.error(`Kein Task mit der ID ${currentDraggedElement} gefunden.`);
  }
  noTaskToDoNotification();
  renderTasks();
}

function hightlight(id) {
  document.getElementById(id).classList.add("drag-area-hightlight");
}

function removeHightlight(id) {
  document.getElementById(id).classList.remove("drag-area-hightlight");
}

/* =========================================================
SHOW "NO TASK...TO DO/IN PROGRESS/AW.FEEDBACK/DONE" NOTIFICATION
==============================================================*/
async function noTaskToDoNotification() {
  let allTasks = await getItem("allTasks");

  let taskCounts = {
    toDo: 0,
    inProgress: 0,
    awaitFeedback: 0,
    done: 0,
  };

  for (let i = 0; i < allTasks.length; i++) {
    const status = allTasks[i]["status"];
    if (taskCounts.hasOwnProperty(status)) {
      //hasOwnProperty um zu überprüfen, ob das Objekt eine Eigenschaft mit Namen des aktuellen Status hat
      taskCounts[status]++;
    }
  }
  setDisplayStatus(document.getElementById("No_Task_To_Do"), taskCounts.toDo);
  setDisplayStatus(
    document.getElementById("No_Task_In_Progress"),
    taskCounts.inProgress
  );
  setDisplayStatus(
    document.getElementById("No_Task_Await_Feedback"),
    taskCounts.awaitFeedback
  );
  setDisplayStatus(document.getElementById("No_Task_Done"), taskCounts.done);
}

function setDisplayStatus(container, taskCount) {
  container.style.display = taskCount > 0 ? "none" : "flex";
}

/* ========
FIND TASKS
==========*/
function findTask() {
  let inputfield = document.getElementById("Find_Task");
  let input = inputfield.value.toLowerCase();
  let inputfieldSmallScreen = document.getElementById("Find_Task_SmallScreen");
  let inputSmallScreen = inputfieldSmallScreen.value.toLowerCase();

  let boardSection = document.getElementById("Board_Section_Main_Content");
  let tasks = boardSection.getElementsByClassName(
    "board-task-container-overview"
  );
  for (const oneTask of tasks) {
    oneTask.style.display = "none";
  }
  for (let i = 0; i < tasks.length; i++) {
    const oneTaskName = tasks[i]
      .getElementsByTagName("h2")[0]
      .innerText.toLowerCase();
    if (
      (window.innerWidth > 650 && oneTaskName.startsWith(input)) ||
      (window.innerWidth <= 650 && oneTaskName.startsWith(inputSmallScreen))
    ) {
      tasks[i].style.display = "flex";
    }
  }
}

/* ========================
SHOW LARGE VIEW OF ONE TASK
===========================*/
let largeViewIsOpen = false;
async function renderTaskLargeview(taskIndex) {
  if (largeViewIsOpen) {
    return;
  }
  largeViewIsOpen = true;

  const allTasks = await getTasks();
  console.log(allTasks);
  const task = allTasks[taskIndex];
  const board = document.getElementById("Board");

  const description = task.description ? task.description : "";
  const dueDate = task.dueDate ? formatDate(task.dueDate) : "";
  let prio = addPrioIcon(task);
  let contacts = task.contactsForNewTask
    ? await createContactsList(task.contactsForNewTask, true)
    : "";
  let subtasks = task.subtasks ? await createSubtasklist(taskIndex) : "";

  board.innerHTML += generateTaskLargeViewHTML(
    task,
    description,
    dueDate,
    prio,
    subtasks,
    contacts,
    taskIndex
  );
}

function generateTaskLargeViewHTML(
  task,
  description,
  dueDate,
  prio,
  subtasks,
  contacts,
  taskIndex
) {
  return /*html*/ `
  <div id="Pop_Up_Backdrop" class="pop-up-backdrop">
    <div id="Board_Task_Container_Largeview" class="board-task-container-largeview">
            <div class = "board-task-category-and-closebutton-container">
                <div class = "board-task-category board-task-category-largeview"> ${task.category} </div>
                <img class="hoverCloseButton" onclick = "closeLargeview()" src = "./assets/img/close.svg">
            </div>
            <div class = "board-task-title-largeview">${task.title}</div>
            <div class = "board-task-description-largeview">${description}</div>
            <div class="board-task-dueDate-and-priority">
                <div class="arrange-dueDate-and-priority"> <span>Due date: </span><span>Priority:</span> </div>
                <div class="arrange-dueDate-and-priority"> <span>${dueDate}</span><span>${task.prio} ${prio}</span> </div>
            </div>
            <div class = "board-task-assigned-to-largeview"> <span class = "board-task-largeview-color"> Assigned To: </span>${contacts}</div>
            <div class = "board-task-subtasks-container-largeview"> <span class = "board-task-largeview-color"> Subtasks: </span>${subtasks}</div>
            <div class = "board-task-delete-and-edit-container">
                <div id = "Board_Task_Delete_Button" onclick = "deleteTaskConfirmNotification(${taskIndex})" class = "board-task-largeview-icon">
                    <img src = "assets/img/delete.png">
                    <span> Delete </span>
                </div>
                <svg height="20" width="1">
                    <line x1="0" y1="0" x2="0" y2="200" style="stroke:black; stroke-width:0.5" />
                </svg>
                <div id = "Board_Task_Edit_Button" class = "board-task-largeview-icon">
                     <img src = "assets/img/edit.png">
                     <span onclick="editTask(${taskIndex})"> Edit </span>
                </div>
            </div>
        </div>
    </div>
`;
}

async function editTask(taskIndex) {
  const allTasks = await getItem("allTasks");
  let task = allTasks[taskIndex];
  let background = document.createElement("div");
  background.id = "Edit_Task_Background";
  background.className = "pop-up-backdrop";
  background.innerHTML = /*html*/ `
   <main id="Edit_Task_Container">
  <div class="positionCloseButton">
    <img
      class="hoverCloseButton"
      src="./assets/img/close.svg"
      onclick="closeEditTask()"
    />
  </div>
  <!-- TITLE -->
  <section class="editSection">
    <p>Title</p>
    <input class="inputAndTextareaSettings" type="text" value="${task.title}" />
  </section>
  <!-- DESCRIPTION -->
  <section class="editSection">
    <p>Description</p>
    <textarea
      class="inputAndTextareaSettings"
      name=""
      id=""
      cols="30"
      rows="10"
    >
${task.description}</textarea
    >
  </section>
  <!-- DUE DATES -->
  <section class="editSection">
    <p>Due Date</p>
    <input
      class="inputAndTextareaSettings"
      type="date"
      value="${task.dueDate}"
    />
  </section>
  <!-- PRIORITY  -->
  <section class="editSection">
    <p>Priority</p>
    <div class="edit-task-prio-button-container">
      <button
        onclick="setTaskPriority('urgent'); changeButtonColor(true)"
        id="edit_task_prio_button_urgent"
        class="add-task-prio-button add-task-urgent-prio-button"
        type="button"
      >
        <span> Urgent </span>
        <img
          id="edit_task_prio_icon_urgent"
          class="add-task-prio-icon"
          src="./assets/img/priorityUrgent.svg"
        />
      </button>
      <button
        onclick="setTaskPriority('medium'); changeButtonColor(true)"
        id="edit_task_prio_button_medium"
        class="add-task-prio-button add-task-prio-button-yellow add-task-medium-prio-button"
        type="button"
      >
        <span> Medium </span>
        <img
          id="edit_task_prio_icon_medium"
          class="add-task-prio-icon add-task-prio-icon-white"
          src="./assets/img/priorityMedium.svg"
        />
      </button>
      <button
        onclick="setTaskPriority('low'); changeButtonColor(true)"
        id="edit_task_prio_button_low"
        class="add-task-prio-button add-task-low-prio-button"
        type="button"
      >
        <span> Low </span>
        <img
          id="edit_task_prio_icon_low"
          class="add-task-prio-icon"
          src="./assets/img/priorityLow.svg"
        />
      </button>
    </div>
  </section>
  <!-- ASSIGNED TO -->
  <section class="editSection">
  <span>Assigned to</span>
  <div
    onclick="toggleContactsDropdown(true)"
    class="add-task-inputfield add-task-inputfield-contacts inputAndTextareaSettings"
  >
    <span id="edit_task_placeholder" class="add-task-placeholder">
      Select contacts to assign
    </span>
    <img
      id="edit-task-inputfield-arrow"
      class="add-task-inputfield-arrow"
      src="./assets/img/arrow_drop_down.svg"
    />
  </div>
  <div id="edit_task_contacts_content"></div>
</section>
</main>

  `;
  document.body.appendChild(background);
}

function closeEditTask() {
  let editTaskDiv = document.getElementById("Edit_Task_Background");
  document.body.removeChild(editTaskDiv);
}

function formatDate(dateString) {
  const date = new Date(dateString); //erstellt ein neues Date-Objekt aus dem Eingabestring
  let day = date.getDate(); // Tag, Monat & Jahr werden aus dem Date-Objekt extrahiert
  day = day < 10 ? "0" + day : day;
  let month = date.getMonth() + 1; // da die Monate in Javascript nullbasiert sind (Januar = 0, Februar = 1,..), wird 1 zum zurückgegeben Monat addiert
  month = month < 10 ? "0" + month : month;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function createContactsList(contactNames, showName) {
  let contactsList = "";
  const allContacts = await loadContacts();

  for (let i = 0; i < contactNames.length; i++) {
    const contactName = contactNames[i];
    const filteredContacts = allContacts.filter(function (
      contactElementInArray
    ) {
      // in add task ausgewählte Elemente aus Array filtern
      return contactElementInArray.name === contactName;
    });
    const contact = filteredContacts[0];

    if (!filteredContacts) {
      continue;
    }
    contactsList += generateContactListHTML(contact, showName);
  }
  return contactsList;
}

function generateContactListHTML(contact, showName) {
  if (showName) {
    return /*html*/ `
    <div class="board-task-contacticon-and-name">
      <span>${getIconForContact(contact)}</span>
      <span>&nbsp ${contact.name}</span>
  </div>
  `;
  } else {
    return /*html*/ `
      <span class="item">${getIconForContact(contact)}</span>`;
  }
}
/* =======================
TASK-LARGEVIEW SUBTASKS
==========================*/
async function updateProgress(taskIndex, subtaskIndex) {
  let allTasks = await getItem("allTasks");
  let task = allTasks[taskIndex];
  let subtask = task["subtasks"][subtaskIndex];
  let checkboxStatus = subtask["checked"];

  let changedStatus;
  if (checkboxStatus === true) {
    changedStatus = false;
  } else {
    changedStatus = true;
  }

  subtask["checked"] = changedStatus;

  updateProgressBarAndCount(task);
  await setItem("allTasks", allTasks);
}

function updateProgressBarAndCount(task) {
  let taskIndex = task.id;
  let progressBarWidth = getProgressBarWidth(task);
  document.getElementById(
    `Board_Task_Progress_Bar${taskIndex}`
  ).style.width = `${progressBarWidth}%`;

  let checkedCount = getCheckedCount(task["subtasks"]);
  let subtaskAmount = task["subtasks"].length;
  document.getElementById(
    `Board_Task_Number_Of_Subtasks${taskIndex}`
  ).innerHTML = `${checkedCount}` + "/" + `${subtaskAmount}` + " Subtasks";
}

async function getCheckboxStatus(subtasks) {
  let checkboxStatus = [];
  for (let i = 0; i < subtasks.length; i++) {
    let checkbox = subtasks[i]["checked"];
    checkboxStatus.push(checkbox);
  }
  return checkboxStatus;
}

async function createSubtasklist(taskIndex) {
  let tasks = await getItem("allTasks");
  let subtasksArray = tasks[taskIndex]["subtasks"];
  let checkedCheckboxes = await getCheckboxStatus(subtasksArray);

  let subtasklist = "";
  for (let i = 0; i < subtasksArray.length; i++) {
    const subtask = subtasksArray[i]["subtaskName"];
    let checkedAttribute = checkedCheckboxes[i] ? "checked" : "unchecked";
    subtasklist += generateSubtaskListHTML(
      taskIndex,
      i,
      subtask,
      checkedAttribute
    );
  }
  return subtasklist;
}

function generateSubtaskListHTML(taskIndex, i, subtask, checkedAttribute) {
  return /*html*/ `
    <div
  id="Board_Task_Subtasks_Largeview${taskIndex}${i}"
  class="board-task-subtasks-largeview"
>
  <input
    onclick="updateProgress(${taskIndex},${i});"
    id="Board_Task_Subtask_Checkbox${taskIndex}${i}"
    type="checkbox"
    ${checkedAttribute}
  />
  <label for="Board_Task_Subtask_Checkbox${taskIndex}${i}">
    &nbsp ${subtask}</label
  >
</div>
  `;
}
/* =======================
TASK LARGEVIEW CLOSE POP-UP
===========================*/
function closeLargeview() {
  let largeviewPopup = document.getElementById(
    "Board_Task_Container_Largeview"
  );
  document.getElementById("Pop_Up_Backdrop").remove();
  largeviewPopup.remove();
  largeViewIsOpen = false;
}
/* ==================
TASK LARGEVIEW DELETE
=====================*/
function deleteTaskConfirmNotification(i) {
  let notificationDiv = document.createElement("div");
  notificationDiv.className = "pop-up-backdrop";
  notificationDiv.id = "Delete_Task_Confirm_Notification";
  notificationDiv.innerHTML = /*html*/ `
  <section class="deleteTaskNotification">
    <p>Are you sure you want to delete this task?</p>
    <div>
      <button onclick="closeNotification()">No, cancel</button>
      <button onclick="deleteTask(${i})">Yes, delete</button>
    </div>
</section>
  `;
  // Append the div to the body
  document.body.appendChild(notificationDiv);
}

async function deleteTask(i) {
  _taskList.splice(i, 1);
  reassignTaskIds(_taskList);
  await setItem("allTasks", _taskList);
  closeNotification();
  closeLargeview();
  noTaskToDoNotification();
  renderTasks();
}

function closeNotification() {
  let notificationDiv = document.getElementById(
    "Delete_Task_Confirm_Notification"
  );
  document.body.removeChild(notificationDiv);
}

function reassignTaskIds(tasks) {
  for (let i = 0; i < tasks.length; i++) {
    tasks[i].id = i;
  }
}
/* ============================
OPEN & CLOSE ADD TASK - POP-UP
===============================*/
function openAddTaskPopUp() {
  let addTaskPopup = document.getElementById("add_task_popup");
  if (window.innerWidth >= 1090) {
    addTaskPopup.style.display = "unset";
  } else {
    window.location.href = "add_Task.html";
  }
}

function closeAddTaskPopup() {
  let addTaskPopup = document.getElementById("add_task_popup");
  addTaskPopup.style.display = "none";
  // Entfernen Sie das Hintergrundelement aus dem DOM
}
/* ====================================
WHEN SCREEN < 1090, SHOW OR HIDE ARROWS
=======================================*/
window.addEventListener("load", function () {
  let container = [
    "to_do_container",
    "In_Progress_Content",
    "Await_Feedback_Content",
    "Done_Content",
  ];

  let arrowRight = [
    "To_Do_Container_Arrow_Right",
    "In_Progress_Container_Arrow_Right",
    "Await_Feedback_Arrow_Right",
    "Done_Arrow_Right",
  ];

  let arrowLeft = [
    "To_Do_Container_Arrow_Left",
    "In_Progress_Container_Arrow_Left",
    "Await_Feedback_Arrow_Left",
    "Done_Arrow_Left",
  ];

  function checkScroll() {
    for (let i = 0; i < container.length; i++) {
      let subContainer = document.getElementById(container[i]);
      let rightArrow = document.getElementById(arrowRight[i]);

      if (subContainer.scrollWidth > subContainer.clientWidth) {
        rightArrow.style.display = "flex";
        rightArrow.addEventListener("click", function () {
          subContainer.scrollLeft += 200;
        });
      } else {
        rightArrow.style.display = "none";
      }
    }
  }

  function checkScrollEnd() {
    for (let i = 0; i < container.length; i++) {
      let subContainer = document.getElementById(container[i]);
      let rightArrow = document.getElementById(arrowRight[i]);
      let leftArrow = document.getElementById(arrowLeft[i]);

      let scrollRight =
        subContainer.scrollWidth -
        subContainer.scrollLeft -
        subContainer.clientWidth;
      if (scrollRight <= 100) {
        rightArrow.style.display = "none";
      } else {
        rightArrow.style.display = "flex";
        rightArrow.addEventListener("click", function () {
          subContainer.scrollLeft += 200;
        });
      }

      if (subContainer.scrollLeft >= 100) {
        leftArrow.style.display = "flex";
        leftArrow.addEventListener("click", function () {
          subContainer.scrollLeft -= 200;
        });
      } else {
        leftArrow.style.display = "none";
      }
    }
  }
  setTimeout(function () {
    checkScroll();
    checkScrollEnd();
  }, 1000);
  window.addEventListener("resize", checkScroll);
  for (let i = 0; i < container.length; i++) {
    const subContainer = document.getElementById(container[i]);
    subContainer.addEventListener("scroll", checkScrollEnd);
  }
});
