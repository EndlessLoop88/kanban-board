let rememberLogIn = [];

/* async function initLogIn() {
  await loadLogInData();
}

async function loadLogInData() {
  let storedData = await getItem(
    "rememberLogIn",
    JSON.stringify(rememberLogIn)
  );
  if (storedData) {
    rememberLogIn = JSON.parse(storedData);
  }
} */

async function logInUser() {
  let email = document.getElementById("Email");
  let password = document.getElementById("Password");

  rememberLogInData(email, password);

  /* let getAllRegisteredUsers = await getItem("allRegisteredUsers");
  let user = getAllRegisteredUsers.find(
    (u) => u.email == email.value && u.password == password.value
  ); */
  let user = await findUser(email.value, password.value);

  if (user) {
    await storeLoggedInUser(user);
    window.location.href = "summary.html";
  } else {
    alert("USER NICHT GEFUNDEN");
  }
}

function rememberLogInData(userEmail, userPassword) {
  let checkbox = document.getElementById("Remember_Me_Checkbox");

  if (checkbox.checked) {
    rememberLogIn.push({
      email: userEmail.value,
      password: userPassword.value,
    });
    setItem("rememberLogIn", JSON.stringify(rememberLogIn));
  } else {
    rememberLogIn = []; //Array leeren
    setItem("rememberLogIn", JSON.stringify(rememberLogIn));
  }
}

async function findUser(email, password) {
  let getAllRegisteredUsers = await getItem("allRegisteredUsers");
  let user = getAllRegisteredUsers.find(
    (u) => u.email == email && u.password == password
  );
  return user;
}

function guestLogIn() {
  document.getElementById("Email").required = false;
  document.getElementById("Password").required = false;

  window.location.href = "summary.html";
}

async function storeLoggedInUser(user) {
  let currentUser = [];
  currentUser.push(user);
  await setItem("loggedInUser", JSON.stringify(currentUser));
}
