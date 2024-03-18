let _taskList = null;
let contactsRendered = {add: false, edit: false};
let contactsDropdownOpen = {add: false, edit: false};
// the following are declared as var so they can be accessed for editing tasks
var contactsInForm = [];
var prio = "medium";
var subtasks = [];


async function initAddTask() {
  await includeHTML();
  updateMenuPoint(1);
  await loadUserInitials();
  const today = new Date();
  let newDueDate = document.getElementById("add_task_due_date");
  newDueDate.setAttribute("min", today.toISOString().substring(0, 10));
}

/* ================
CONTACTS
===================*/

async function toggleContactsDropdown(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";

  // for edit mode, we don't cache the contacts HTML
  if (!contactsRendered[classPrefix] || isEditMode === true) {
    await renderContactsInAddTask(isEditMode);
    contactsRendered[classPrefix] = true;
  }

  const contactsContainer = document.getElementById(`${classPrefix}_task_contacts_container`);

  if (contactsDropdownOpen[classPrefix] === true) {
    contactsContainer.style.display = "none";
    contactsDropdownOpen[classPrefix] = false;
  } else {
    contactsContainer.style.display = "block";
    contactsDropdownOpen[classPrefix] = true;
  }
}

function closeContactsDropdown(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";
  const contactsContainer = document.getElementById(`${classPrefix}_task_contacts_container`);

  if(contactsContainer) {
    contactsContainer.style.display = "none";
  }
  
  contactsDropdownOpen[classPrefix] = false;
  contactsRendered[classPrefix] = false;
}

function clearAndCloseContactsList(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";

  closeContactsDropdown(isEditMode);
  contactsInForm = [];
  const contactIcons = document.getElementById(`${classPrefix}_task_contacts_icons`);

  if(contactIcons) {
    contactIcons.innerHTML = '';
  }
}


async function renderContactsInAddTask(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";
  let allContacts = await loadContacts();
  let placeholder = document.getElementById(`${classPrefix}_task_placeholder`);
  let drowDownArrow = document.getElementById(`${classPrefix}-task-inputfield-arrow`);
  // let contactsContainer = document.getElementById(`${classPrefix}_task_contacts_content`);
  //   
  //   contactsContainer.innerHTML += `
  //    <div id="${classPrefix}_task_contacts_container" class="add-task-contacts-container"></div> 
  //  `;

  if (allContacts.length !== 0) {
    let contactList = document.getElementById(`${classPrefix}_task_contacts_container`);
    let html = '';
    for (let i = 0; i < allContacts.length; i++) {
      const contact = allContacts[i];
      html += renderHTMLforAddTaskContactList(isEditMode, i, contact);
    }
    contactList.innerHTML = html;
  } else {
    placeholder.style.color = "rgb(178, 177, 177)";
    placeholder.innerText = "No Contacts available";
    drowDownArrow.style.display = "none";
  }
}


function renderHTMLforAddTaskContactList(isEditMode, i, contact) {
  const classPrefix = isEditMode ? "edit" : "add";
  const contactChecked = contactsInForm.includes(contact.name);
  const checkedAttribute = contactChecked ? 'checked' : '';
  const checkedClass = contactChecked ? 'add-task-contact-selected' : '';

  return `
      <div id="${classPrefix}_task_contact_checkbox${i}" class="add-task-contact-checkbox ${checkedClass}" onclick="saveCheckedContacts(${i}, ${isEditMode}, '${contact.name.replace(
    '"',
    ""
  )}')"> 
        <div class="add-task-contact-icon-and-name">
            <div>${getIconForContact(contact)}</div>
            <div>${contact.name}</div>
        </div>
        <input class="add-task-contact-check" id="${classPrefix}_task_contact_checkbox_checkbox${i}" type="checkbox" ${checkedAttribute} >
      </div>
    `;
}


async function saveCheckedContacts(contactIndex, isEditMode, contactName) {
  const classPrefix = isEditMode ? "edit" : "add";
  const checkbox = document.getElementById(`${classPrefix}_task_contact_checkbox_checkbox${contactIndex}`);
  const index = contactsInForm.indexOf(contactName);
  const checkboxfield = document.getElementById(`${classPrefix}_task_contact_checkbox${contactIndex}`);

  if (!checkbox && !checkboxfield) {
    await addContactIcon(isEditMode, contactName);
  } else {
    const iconContainer = document.getElementById(`${classPrefix}_task_contacts_icons`);

    if (index >= 0) {
      contactsInForm.splice(index, 1);
      checkboxfield.classList.remove("add-task-contact-selected");
      checkbox.checked = false;
      await removeContactIcon(iconContainer, contactName);
    } else {
      contactsInForm.push(contactName);
      checkboxfield.classList.add("add-task-contact-selected");
      checkbox.checked = true;
      await addContactIcon(iconContainer, contactName)
    }
  }
}

async function addContactIcon(iconContainer, contactName) {
  let contactInformation = await getContactInformation(contactName);
  iconContainer.innerHTML += `
      <span>${getIconForContact(contactInformation)}</span>
        `;
}

async function removeContactIcon(iconContainer, contactName) {
  let contactInformation = await getContactInformation(contactName)
  let iconToRemove = getIconForContact(contactInformation);

  if(iconContainer.children) {
    for (let i = 0; i < iconContainer.children.length; i++) {
      let span = iconContainer.children[i];

      if (span.innerHTML === iconToRemove) {
        iconContainer.removeChild(span);
        break;
      }
    }
  }
}


async function getContactInformation(contactName) {
  let allContacts = await loadContacts();
  let contactInfo = allContacts.find(
    (contact) => contact["name"] === contactName
  );
  return contactInfo;
}

/* ================
PRIORITY BUTTONS
===================*/


function setTaskPriority(priority) {
  if ("medium" === priority) {
    prio = "medium";
  } else {
    prio = priority;
  }
  return prio;
}


function changeButtonColor(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";
  let urgentButton = document.getElementById(
    `${classPrefix}_task_prio_button_urgent`
  );
  let urgentIcon = document.getElementById(
    `${classPrefix}_task_prio_icon_urgent`
  );
  let mediumButton = document.getElementById(
    `${classPrefix}_task_prio_button_medium`
  );
  let mediumIcon = document.getElementById(
    `${classPrefix}_task_prio_icon_medium`
  );
  let lowButton = document.getElementById(
    `${classPrefix}_task_prio_button_low`
  );
  let lowIcon = document.getElementById(`${classPrefix}_task_prio_icon_low`);

  urgentButton.classList = ["add-task-prio-button"];
  urgentIcon.classList = [];
  mediumButton.classList = ["add-task-prio-button"];
  mediumIcon.classList = [];
  lowButton.classList = ["add-task-prio-button"];
  lowIcon.classList = [];

  switch (prio) {
    case "urgent":
      urgentButton.classList.add("add-task-prio-button-red");
      urgentIcon.classList.add("add-task-prio-icon-white");
      break;

    case "medium":
      mediumButton.classList.add("add-task-prio-button-yellow");
      mediumIcon.classList.add("add-task-prio-icon-white");
      break;

    case "low":
      lowButton.classList.add("add-task-prio-button-green");
      lowIcon.classList.add("add-task-prio-icon-white");
      break;
  }
}

/* ================
SUBTASKS
===================*/

function addNewSubtask(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";
  let newSubtasksList = document.getElementById(`${classPrefix}_task_subtasks_list`);
  let subtaskInputField = document.getElementById(`${classPrefix}_task_subtasks_inputfield`);
  let subtasksInputfield = document.getElementById(`${classPrefix}_task_subtasks_inputfield`);

  subtasksInputfield.setAttribute("placeholder", "Add new subtask");

  if (subtaskInputField.value !== "") {
    const subtaskIndex = subtasks.length;
    const newSubtask = {subtaskName: subtaskInputField.value, checked: false};
    subtasks.push(newSubtask);
    newSubtasksList.innerHTML += renderHTMLforSubtask(isEditMode, subtaskIndex, newSubtask);
    subtaskInputField.value = "";
  } else {
    subtasksInputfield.setAttribute("placeholder", "Write a subtask title");
  }
}


function renderHTMLforSubtask(isEditMode, subtaskIndex, subtask) {
  const classPrefix = isEditMode ? "edit" : "add";
  const displaySubtaskHtml = `
      <div id="${classPrefix}_task_subtask_and_icons_${subtaskIndex}" class="add-task-subtask-and-icons">
           <span>• ${subtask.subtaskName}</span>
           <div class="add-task-subtask-edit-and-delete-icons">
              <img onclick="editSubtask(${isEditMode}, ${subtaskIndex})" src="./assets/img/edit.svg" class="add-task-subtask-icon">
              <span class="add-task-subtask-dividing-line"></span>
              <img onclick="deleteSubtask(${isEditMode}, ${subtaskIndex})" src="./assets/img/delete.svg" class="add-task-subtask-icon">
           </div>
      </div>`;

  const editSubtaskHtml = ` 
      <div id="${classPrefix}_task_subtask_and_icons_edit_subtask_${subtaskIndex}" class="add-task-subtask-and-icons-edit-subtask"> 
          <input id="${classPrefix}_task_subtask_inputfield_to_edit_${subtaskIndex}" class="add-task-subtask-inputfield-edit-subtask">
          <div class="add-task-subtask-delete-and-check-icons-edit-subtask">
              <img onclick="deleteSubtask(${isEditMode}, ${subtaskIndex})" src="./assets/img/delete.svg" class="add-task-subtask-icon-edit-subtask">
              <span class="add-task-subtask-dividing-line-edit-subtask"></span> 
              <img onclick="saveEditedSubtask(${isEditMode}, ${subtaskIndex})" src="./assets/img/check.svg" class="add-task-subtask-icon-check-subtask">
          </div>
      </div>`;

  return ` 
    <div>${displaySubtaskHtml}${editSubtaskHtml}</div>
  `;
}


function renderSubtasks(isEditMode) {
  const classPrefix = isEditMode ? "edit" : "add";
  const newSubtasksList = document.getElementById(`${classPrefix}_task_subtasks_list`);
  let html = '';

  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    html += renderHTMLforSubtask(isEditMode, i, subtask);
  }

  newSubtasksList.innerHTML = html;
}


function editSubtask(isEditMode, subtaskIndex) {
  const classPrefix = isEditMode ? "edit" : "add";
  const subtasksInputfieldRenderSubtask = document.getElementById(`${classPrefix}_task_subtask_and_icons_${subtaskIndex}`);
  const subtasksInputfieldEditSubtask = document.getElementById(`${classPrefix}_task_subtask_and_icons_edit_subtask_${subtaskIndex}`);
  const inputfieldToEdit = document.getElementById(`${classPrefix}_task_subtask_inputfield_to_edit_${subtaskIndex}`);

  subtasksInputfieldRenderSubtask.style.display = "none";
  subtasksInputfieldEditSubtask.style.display = "flex";
  inputfieldToEdit.setAttribute("value", subtasks[subtaskIndex].subtaskName);
}


function deleteSubtask(isEditMode, subtaskIndex) {
  const classPrefix = isEditMode ? "edit" : "add";
  let subtask = document.getElementById(`${classPrefix}_task_subtask_and_icons_${subtaskIndex}`);
  subtasks.splice(subtaskIndex, 1);
  renderSubtasks(isEditMode);
}


function saveEditedSubtask(isEditMode, subtaskIndex) {
  const classPrefix = isEditMode ? "edit" : "add";
  const subtasksInputfieldToEdit = document.getElementById(`${classPrefix}_task_subtask_inputfield_to_edit_${subtaskIndex}`);
  const oldSubtask = subtasks[subtaskIndex];
  subtasks[subtaskIndex] = {subtaskName: subtasksInputfieldToEdit.value, checked: oldSubtask.checked};
  renderSubtasks(isEditMode);
}


/* ================
TASKS
===================*/

async function getTasks(overrideCache) {
  if (_taskList != null && overrideCache !== true) {
    return _taskList;
  }

  const allTasksResponse = await getItem("allTasks");

  if (allTasksResponse instanceof Array) {
    _taskList = allTasksResponse; //
    return allTasksResponse; //
  } else {
    return [];
  }
}


async function getTaskIdCounter() {
  const taskIdCounterResponse = await getItem("taskIdCounter");

  if (taskIdCounterResponse != null) {
    return parseInt(taskIdCounterResponse);
  } else {
    return 0;
  }
}


function clearAddTaskForm() {
  prio = "medium";
  changeButtonColor();

  const form = document.getElementById('add_task_form');

  if(form) {
    form.reset();
  }

  let newSubtasksList = document.getElementById("add_task_subtasks_list");
  newSubtasksList.innerHTML = "";

  clearAndCloseContactsList(false);
}


async function createTask() {
  const allTasks = await getTasks();

  let title = document.getElementById("add_task_title");
  let dueDate = document.getElementById("add_task_due_date");
  let category = document.getElementById("add_task_category");
  let description = document.getElementById("add_task_description");

  let task = {
    id: allTasks.length,
    title: title.value,
    dueDate: dueDate.value,
    category: category.value,
    status: "toDo",
  };

  if (description.value.trim() !== "") {
    task.description = description.value.trim();
  }

  if (contactsInForm.length !== 0) {
    task.contacts = contactsInForm;
  }

  task.subtasks = subtasks;

  if (prio !== "") {
    task.prio = prio;
  }

  allTasks.push(task);

  await setItem("allTasks", allTasks);
  _taskList = allTasks;
  await setItem("taskIdCounter", task.id);

  showPopupTaskAdded();
  navigateToBoardPage();
}


function showPopupTaskAdded() {
  let mainContainer = document.getElementById("main_container");
  mainContainer.innerHTML += `
        <div id = "add-task-popup-container">
            <div class="add-task-popup-task-added">
                <span> Task added to board </span>
                <img class= "add-task-board-icon" src="./assets/img/board.svg"
            </div>
        </div >
    `;
}


function navigateToBoardPage() {
  const animationDuration = 200;
  const extraDelay = 500;
  setTimeout(() => {
    window.location.href = "board.html";
  }, animationDuration + extraDelay);
}
