const STORAGE_INITIALIZED = 'kanban-board-storage-initialized';

/**
 * Populate the browser's storage with some demo data if it has not been initialized yet.
 */
async function populateBoardWithDemoDataIfNotInitialized() {
  if(!await getItem(STORAGE_INITIALIZED)) {
    await setItem(STORAGE_INITIALIZED, true);
    await setItem('taskIdCounter', 2);
    await setItem('allTasks', [
          {
            "id": 0,
            "title": "Benutzeroberfläche für Vertragsverlängerung implementieren",
            "dueDate": "2024-04-20",
            "category": "Technical Task",
            "status": "awaitFeedback",
            "description": "Kunden sollen online eine Vertragsverlängerung durchführen können",
            "contacts": ["Dimitrios Kapetanis", "Lydia Lehnert", "Andreas Pflaum"],
            "prio": "urgent",
            "subtasks": [
              {"subtaskName": "Benutzeroberfläche erstellen", "checked": true},
              {"subtaskName": "Formulare gestalten", "checked": true},
              {"subtaskName": "Validierung einbauen", "checked": true},
            ]
          },
          {
            "id": 1,
            "title": "API-Endpunkte zur Vertragsverlängerung entwickeln",
            "dueDate": "2024-04-30",
            "category": "Technical Task",
            "status": "inProgress",    
            "contacts": ["Dimitrios Kapetanis", "Andreas Pflaum"],
            "prio": "medium",
            "subtasks": [
              {"subtaskName": "API-Endpunkte erstellen", "checked": true},
              {"subtaskName": "Verlängerungslogik implementieren", "checked": true},
              {"subtaskName": "Datenbank aktualisieren", "checked": false},
            ]
          },
          {
            "id": 2,
            "title": "Funktion zur Vertragsverlängerung überprüfen und freigeben",
            "dueDate": "2024-04-28",
            "category": "Technical Task",
            "status": "toDo",
            "contacts": ["Dimitrios Kapetanis", "Lydia Lehnert"],
            "prio": "low",
            "subtasks": [
              {"subtaskName": "Unit-Tests schreiben", "checked": false},
              {"subtaskName": "UI-Tests durchführen", "checked": false},
              {"subtaskName": "End-to-End-Tests durchführen", "checked": false},
            ]
          },
        ]
    );
    await setItem('allContacts', [
        {"name": "Andreas Pflaum", "e-mail": "asdasd@web.de", "tel": "0524366", "color": "#47FFDD"},
        {"name": "Dimitrios Kapetanis", "e-mail": "asdasd@web.de", "tel": "01515615165", "color": "#319332"},
        {"name": "Lydia Lehnert", "e-mail": "asdas@web.de", "tel": "1728916893", "color": "#8991F1"},
    ]);
    await setItem('allRegisteredUsers', [
        {"name": "User One", "email": "user.one@example.org", "password": "Geheim789#", "confirmPassword": "Geheim789#"},
        {"name": "User Two", "email": "user.two@example.org", "password": "Geheim789#", "confirmPassword": "Geheim789#"},
    ]);
  }
}


/**
 * This function initializes the index page
 */
function initIndex() {
  populateBoardWithDemoDataIfNotInitialized().catch(console.error);
  let indexPage = document.getElementById("Index_Page");

  if (window.innerWidth <= 850) {
    indexPage.innerHTML = /*html*/ `
       <img src="./assets/img/join-mobile.png" />
    `;
    indexPage.style.backgroundColor = "rgb(43,54,71)";
  } else {
    indexPage.innerHTML = /*html*/ `
      <img src="./assets/img/join.png">
    `;
    indexPage.style.backgroundColor = "white";
  }
  //As soon as animation is over:
  indexPage.querySelector("img").addEventListener("animationend", function () {
    window.location.href = "log_In.html";
  });
}
