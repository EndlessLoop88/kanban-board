let contacts = [];

let letters = contacts.map((contact) => contact.name.charAt(0)); 

let twolettersName = contacts.map((contact) => {
  
  const nameSplit = contact.name.split(" ");
  const twoNummber = nameSplit.map((teil) => teil.charAt(0));
  return twoNummber.join("");
});


async function initContacts() {
  await includeHTML();
  await loadContacts();
  await contactsSort();
  queryContainer();
  updateLettersAndTwoLettersName();
  await contactList();
  updateMenuPoint(3);
  await loadUserInitials();
  window.onload = hideOnSmallScreens;
  window.onresize = hideOnSmallScreens;
}


async function loadContacts() {
  if(contacts && contacts.length > 0) {
    return contacts;
  }

  try {
    contacts = await getItem("allContacts");
    return contacts;
  } catch (e) {
    console.info("Not load Contacts");
  }
}


async function addContact() {
  let text = document.getElementById("text").value;
  let email = document.getElementById("email").value;
  let number = document.getElementById("number").value;

  let newContact = {
    name: text,
    "e-mail": email,
    tel: number,
    color: getRandomColor(),
  };

  contacts.push(newContact);
  await setItem("allContacts", contacts);
  contactsSort();
  updateLettersAndTwoLettersName();
  valueToEmpty();
  saveAnimat();
}


function valueToEmpty() {
  document.getElementById("text").value = "";
  document.getElementById("email").value = "";
  document.getElementById("number").value = "";
  transformCloseContacts();
  contactList();
}


function newContactOpen() {
  let backround = document.getElementById("backround");
  backround.classList.add("animate");
  }


function closeContact() {
  let backround = document.getElementById("backround");
  backround.classList.remove("animate");
}


async function contactList() {
  let list = document.getElementById("newContacts");
  list.innerHTML = "";
  let previousLetter = null; 
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const currentLetter = letters[i];
    
    if (currentLetter !== previousLetter) {
      list.innerHTML += /*html*/ `
                <div class="name-letter">${currentLetter}</div>
                <div class="contact-parting-line">
                    <hr>
                </div>`;
      previousLetter = currentLetter;
    }

    list.innerHTML += /*html*/ `
            <div id="newColorContact${i}" class="contacts" onclick="pushContact(${i})">
                <button class="button-name" style="background-color: ${contact.color};">${twolettersName[i]}</button>
                <div class="names">
                    <p>${contact["name"]} <br> <p class="mail">${contact["e-mail"]}</p>
                </div>
            </div>`;
  }
}


function pushContact(i) {
  let pushContact = document.getElementById("push_contacts");
  pushContact.innerHTML = "";
  contactListColor(i);
  transformNewContacts();
  const contact = contacts[i]; 
  const buttonColor = contact.color; 

  pushContact.innerHTML = generateContactsListHTML(i, buttonColor);
  pushContact.innerHTML += returnContactInfo(i);
  mobileBackRemove();
  queryContainer(i);
}


function generateContactsListHTML(i, buttonColor) {
  return /*html*/ `
    <div class="contacts-list">
      <button class="button-name-contacts" style="background-color: ${buttonColor};">${twolettersName[i]}</button>
      <div>
        <p class="contacts-name">${contacts[i]["name"]}</p>
        <div id="edit_back">
          <div class="edit-delete" id="edit_delete">
            <p class="edit-hover" onclick="editContact(${i})"> <img src="./assets/img/edit.png"> Edit </p>
            <p class="delete-hover" onclick="deleteQuery(${i})"><img src="./assets/img/delete.png"> Delete</p>
          </div>
        </div>
      </div>
    </div>
  `;
}


function returnContactInfo(i) {
  return /*html*/`
    <div>
                    <p class="contact-information">Contact Information</p>
                </div>
                <div class="email-phone">
                    <p class="name-email-phone">Email</p> <br>
                    <a href="">${contacts[i]["e-mail"]}</a> <br> <br>
                    <p class="name-email-phone"> Phone</p> <br>
                    <p>${contacts[i]["tel"]}</p>
                </div>
            </div>
  `
}


function transformNewContacts() {
  let pushContacts = document.getElementById("push_contacts");
  pushContacts.classList.add("animate");
}


function transformCloseContacts() {
  let pushContacts = document.getElementById("push_contacts");
  pushContacts.classList.remove("animate");
}


function queryContainer(i) {
  let queryContainer = document.getElementById('query_comtainer');
  queryContainer.innerHTML = '';
  queryContainer.innerHTML = /*html*/ `
    <div class="backround-delete-contact-container" id="backgroundDeleteContactContainer">
      <div class="really-delete" id="really_delete">
        <span>Do you really want to delete this contact?</span>
        <div>
          <button onclick="closeQuery()" class="button-delete">No, cancel</button>
          <button onclick="deleteContact(${i})" class="button-delete">Yes, delete</button>
        </div>
      </div>
    </div>
  `;
}


function deleteQuery() {
  mobilEditContact();
  let backgroundDeleteContactContainer = document.getElementById('backgroundDeleteContactContainer');
  backgroundDeleteContactContainer.style.display = 'flex'; 
  let reallyDelete = document.getElementById('really_delete')
  reallyDelete.classList.add('slideInContactDelete');
}


function closeQuery() {
  let backgroundDeleteContactContainer = document.getElementById('backgroundDeleteContactContainer');
  let reallyDelete = document.getElementById('really_delete')
  setTimeout(() => {
    reallyDelete.classList.add('slideOutContactDelete');
  }, 50); 
  setTimeout(() => {
    reallyDelete.classList.remove('slideOutContactDelete');
    backgroundDeleteContactContainer.style.display = 'none'; 
  }, 500); 
}


async function deleteContact(i) {
  closeQuery();
  transformCloseContacts();

  await deleteNameFromTask(i);
  contacts.splice(i, 1); 
  letters.splice(i, 1); 
  twolettersName.splice(i, 1); 
  await setItem("allContacts", contacts);
  updateLettersAndTwoLettersName(); 
  contactList(); 
}


async function deleteNameFromTask(i) {
  let allTasks = await getItem("allTasks");
  let deletedName = contacts[i]["name"];
  for (let task of allTasks) {
    if (task["contacts"]) {
      for (let j = 0; j < task["contacts"].length; j++) {
        if (task["contacts"][j] === deletedName) {
          task["contacts"].splice(j, 1);
        }
      }
    }
  }
  await setItem("allTasks", allTasks);
}


function updateLettersAndTwoLettersName() {
  oneLetterGenerator();
  twoLetterGenerator();
}


function oneLetterGenerator() {
  letters = contacts.map((contact) => contact.name.charAt(0));
}


function getIconForContact(contact) {
  const splitName = contact.name.split(" ");
  const initials = splitName.map((part) => part[0]).join("");
  return `<button class="button-name" style="background-color: ${contact.color};">${initials}</button>`;
}


function twoLetterGenerator() {
  twolettersName = contacts.map((contact) => {
    const nameSplit = contact.name.split(" ");
    const twoNummber = nameSplit.map((teil) => teil.charAt(0));
    return twoNummber.join("");
  });
}


function contactsSort() {
  contacts.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
}


function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


async function editContact(i) {
  let edit = document.getElementById("edit_contact");
  let editContact = document.getElementById("edit_contact");
  editContact.classList.remove("d-none");
  editContact.classList.add("edit-contact-background");

  const contact = contacts[i]; 
  const buttonColor = contact.color;
  const name = contact["name"];
  const email = contact["e-mail"];
  const tel = contact["tel"];

  edit.innerHTML = "";
  edit.innerHTML = generateEditHeader();
  edit.innerHTML+= generateEditForm(buttonColor, twolettersName, i, name, email, tel);
  twoLetterGenerator();
  setItem('allContacts', contacts);
}


function generateEditHeader() {
  return /*html*/ `
    <div class="edit">
      <div class="edit-one">
        <img class="join-png" src="./assets/img/join-mobile.png" alt="Bild Join">
        <img onclick="mobilEditContact()" class="mobil-edit-close" src="./assets/img/close.png" alt="">
        <p> Edit contact</p>
        <div class="parting-line"></div>
      </div>
    </div>
  `;
}


function generateEditForm(buttonColor, twolettersName, i, name, email, tel) {
  return /*html*/ `
    <div class="edit-two">
    <img onclick="mobilEditContact()" class="mobil-edit-close-black" src="./assets/img/closeBlack.png">
      <button class="edit-button-contact" style="background-color: ${buttonColor};">${twolettersName[i]}</button>
      <form class="form" id="editForm" onsubmit="saveContact(${i}); return false;">
        <input id="editText" required type="text" placeholder="Name" value="${name}"> <br>
        <input id="editEmail" required type="email" placeholder="Email" value="${email}"> <br>
        <input id="editNumber" required type="number" placeholder="Phone" value="${tel}"> <br>
        <div class="cancel-and-ceate">
          <button onclick="deleteQuery()" type="button" class="cancel">Delete</button> 
          <button onclick="closeSaveContact()" type="submit" class="create-contact">Save<img  src="./assets/img/check.png"></button>
        </div>
      </form>
    </div>
  `;
}


async function saveContact(i) {
  await updateName(i);

  const newName = document.getElementById("editText").value;
  const newEmail = document.getElementById("editEmail").value;
  const newTel = document.getElementById("editNumber").value;

  contacts[i]['name'] = newName;
  contacts[i]['e-mail'] = newEmail;
  contacts[i]['tel'] = newTel;

  await setItem("allContacts", contacts);
  updateLettersAndTwoLettersName();
  transformCloseContacts();
  contactsSort();
  contactList();
  initContacts();
}


async function updateName(index) {
  let allTasks = await getItem("allTasks");
  let oldName = contacts[index]["name"];

  const newName = document.getElementById("editText").value;

  for (let task of allTasks) {
    if (task["contacts"]) {
      for (let j = 0; j < task["contacts"].length; j++) {
        if (task["contacts"][j] === oldName) {
          task["contacts"][j] = newName;
        }
      }
    }
  }
  await setItem("allTasks", allTasks);
}


function mobileEditDelete() {
  let element = document.getElementById("menu_mobile");
  if (element) {
    if (element.style.display === "none") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
}


function closeSaveContact() {
  let editContact = document.getElementById("edit_contact");
  editContact.classList.add("d-none");
}


function closeEditContactDelete(i) {
  transformCloseContacts();

  contacts.splice(i, 1);
  letters.splice(i, 1);
  twolettersName.splice(i, 1);

  setItem("allContacts", contacts);
  contactList();
  closeSaveContact();
}


function pushBackroundColor() {
  let newColorContact = document.getElementById("newColorContact(i)");
  newColorContact.classList.add("contacts-onclick");
}


function contactListColor(i) {
  let allContacts = document.querySelectorAll(".contacts");

  allContacts.forEach((contact) => {
    contact.classList.remove("contacts-onclick");
  });

  let newColorContact = document.getElementById("newColorContact" + i);
  newColorContact.classList.add("contacts-onclick");
}


function saveAnimat() {
  let backround = document.getElementById("backround");
  backround.classList.remove("animate");
}


function mobileBack() {
  let mobileBackElement = document.getElementById("mobileBack");
  let editDelet = document.getElementById("edit_delete");
  editDelet.style.display = "none";
  if (mobileBackElement) {
    mobileBackElement.style.display = "none";
  }
}


function mobileBackRemove() {
  let mobileBack = document.getElementById("mobileBack");
  mobileBack.classList.remove("d-none-mobile");
  let mobileBackElement = document.getElementById("mobileBack");
  if (mobileBackElement) {
    mobileBackElement.style.display = "block";
  }
}


function mobilEditContact() {
  let editContact = document.getElementById("edit_contact");
  editContact.classList.add("d-none");
}


function hideOnSmallScreens() {
  let mobileBackElement = document.getElementById("mobileBack");
  if (mobileBackElement) {
    mobileBackElement.style.display =
      window.innerWidth <= 1009 ? "none" : "block";
  }
}


function mobilMenu() {
  moveEditDeleteContainer();
  let editDelet = document.getElementById("edit_delete");

  if (editDelet.style.display === "none") {
    editDelet.style.display = "block";
  } else {
    editDelet.style.display = "none";
  }
}


function moveEditDeleteContainer() {
  let editDeleteDiv = document.getElementById("edit_delete");
  let container2Div = document.getElementById("container2");
  let editBackDiv = document.getElementById("edit_back");

  if (window.innerWidth < 1009) {
    if (container2Div)
      container2Div.appendChild(editDeleteDiv);
  } else {
    if (editBackDiv) {
      editBackDiv.appendChild(editDeleteDiv);
    }
  }
}

