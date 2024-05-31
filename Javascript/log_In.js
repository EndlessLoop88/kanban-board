/**
 * Used to determine whether the logIn Button or guest LogIn was clicked
 */
async function handleSubmit() {
  let submitButton = document.activeElement.id;
  if (submitButton === "LogIn_Button") {
    await logInUser();
  } else if (submitButton === "Guest_LogIn_Button") {
    localStorage.setItem("loggedInPerson", "guest");
    loadWelcomeGreeting("GUEST");
  }
}


/**
 * Used to check if user exists and then continue the logIn process
 */
async function logInUser() {
  let email = document.getElementById("Email");
  let password = document.getElementById("Password_LogIn");

  let user = await findUser(email.value, password.value);

  if (user) {
    await storeLoggedInUser(user);
    localStorage.setItem("loggedInPerson", "user");
    await loadWelcomeGreeting(user.name);
  } else {
    showAlert('User not found or login credentials incorrect !');
  }
}


/**
 * closing popUp message that tells us that the user was not found
 */
function closeAlert() {
  let alertMessage = document.getElementById("Alert_Message");
  document.body.removeChild(alertMessage);
}


/**
 *
 * @param {string} email - this is the email of the person who is trying to logIn
 * @param {string} password - this is the password of the person who is trying to logIn
 * @returns
 */
async function findUser(email, password) {
  let getAllRegisteredUsers = await getItem("allRegisteredUsers");
  let user = getAllRegisteredUsers.find(
    (u) => u.email == email && u.password == password
  );
  return user;
}


/**
 * serves for saving user information
 * @param {object} user - this is the user that was found
 */
async function storeLoggedInUser(user) {
  //Zuerst User in LocalStorage speichern:
  let emailAsText = JSON.stringify(user.email);
  localStorage.setItem("userEmail", emailAsText);
  //Dann User remote speichern:
  let key = "loggedInUser-" + user.email;
  await setItem(key, user);
}


/**
 * Used to display the welcome-greeting after the logIn was successfully
 * @param {string} userName - this is the username that we want to greet
 */
async function loadWelcomeGreeting(userName) {
  let greetingForm = getGreetingForm();
  setGreetingAndName(userName, greetingForm);

  let overlay = document.querySelector(".summary-mobile-position-content");
  overlay.style.display = "flex";

  let animationDuration = 3000;
  let redirectDelay = animationDuration - 1000;
  overlay.addEventListener("animationend", () => {
    overlay.style.display = "none";
    overlay.style.zIndex = "-1";
  });
  setTimeout(() => {
    window.location.href = "summary.html";
  }, redirectDelay);
}


/**
 *  Used to combine greeting form and username
 * @param {string} userName - this is the username
 * @param {string} greetingForm - this is the greeting form based on the current time of logIn
 */
function setGreetingAndName(userName, greetingForm) {
  let greetingName = document.getElementById("Greeting_Name");
  let greeting = document.getElementById("Greeting");

  if (userName !== "GUEST") {
    greeting.innerHTML = greetingForm + ",";
    greetingName.innerHTML = userName;
  } else {
    greeting.innerHTML = greetingForm + "!";
    greetingName.innerHTML = "";
  }
}
