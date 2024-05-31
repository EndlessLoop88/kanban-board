let allRegisteredUsers = [];

/**
 * initialise register.html
 */
async function initRegister() {
  loadUsers();
}

/**
 * Load all existing users
 */
async function loadUsers() {
  try {
    allRegisteredUsers = await getItem("allRegisteredUsers");
  } catch {
    console.info("COULD NOT LOAD USERS");
  }
}

/**
 * Adding new registered user
 */
async function registerUser() {
  document.getElementById("Register_Button").disabled = true;
  let name = document.getElementById("Name");
  let email = document.getElementById("Email");
  let password = document.getElementById("Password");
  let confirmPassword = document.getElementById("Confirm_Password");
  let checkbox = document.getElementById("Privacy_Policy_Checkbox");

  let formStatus = formValidation(
    name,
    email,
    password,
    confirmPassword,
    checkbox
  );
  if (formStatus === true) {
    await setItem("allRegisteredUsers", allRegisteredUsers);
    resetForm(name, email, password, confirmPassword);
    signedUpSuccessfully();
    countdownToRedirect();
  }
}

/**
 * Verify if all registration requirements have been met
 * @param {HTMLInputElement} name
 * @param {HTMLInputElement} email
 * @param {HTMLInputElement} password
 * @param {HTMLInputElement} confirmPassword
 * @param {HTMLInputElement} checkbox
 */
function formValidation(name, email, password, confirmPassword, checkbox) {
  if (password.value !== confirmPassword.value) {
    showAlert("Passwords do not match");
    return false;
  } else if (!checkbox.checked) {
    showAlert("Privacy Policy must be accepted");
    return false;
  } else {
    allRegisteredUsers.push({
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });
    return true;
  }
}

/**
 * Used to reset the formular
 * @param {HTMLInputElement} name
 * @param {HTMLInputElement} email
 * @param {HTMLInputElement} password
 * @param {HTMLInputElement} confirmPassword
 */
function resetForm(name, email, password, confirmPassword) {
  name.value = ``;
  email.value = ``;
  password.value = ``;
  confirmPassword.value = ``;
  document.getElementById("Register_Button").disabled = false;
}

/**
 * Display message "signed up successfully"
 */
function signedUpSuccessfully() {
  let message = document.getElementById("Signed_Up_Successfully_Overlay");

  message.style.display = "flex";

  setTimeout(function () {
    message.style.display = "none";
  }, 4000);
}

/**
 * When the countdown reaches 0, the user is redirected to the "log_In.html" page
 */
function countdownToRedirect() {
  let countDownElement = document.getElementById("Countdown_To_LogIn");
  let countdownValue = 4;
  countDownElement.innerText = countdownValue;

  setInterval(function () {
    countdownValue--;
    countDownElement.innerText = countdownValue;

    if (countdownValue === 0) {
      window.location.href = "log_In.html";
    }
  }, 1000);
}

/**
 * Used to show password requirements
 */
function displayPasswordRequirements() {
  document
    .getElementById("Check_Requirements_Pop_Up")
    .classList.add("slide-down");
}

/**
 * Used to hide password requirements
 */
function hidePasswordRequirements() {
  document
    .getElementById("Check_Requirements_Pop_Up")
    .classList.remove("slide-down");
}

/**
 * It checks if the password contains at least one uppercase letter, one lowercase letter, one number, and is at least 8 characters long
 */
function checkPasswordRequirements() {
  let input = document.getElementById("Password");
  check(input, /[A-Z]/g, "Capital_Letter_Img", "Capital");
  check(input, /[0-9]/g, "Number_Img", "Number");
  check(input, /.{8,}/g, "Length_Img", "Length");
  check(input, /[a-z]/g, "Letter_Img", "Letter");
}

/**
 * This function checks if the input matches a given pattern
 * @param {HTMLInputElement} input - The input element to check
 * @param {RegExp} pattern - The pattern to match the input against
 * @param {string} imgID - The ID of the image element to update based on the check result
 * @param {string} classID - The ID of the element to which the 'valid' or 'invalid' class will be added
 */
function check(input, pattern, imgID, classID) {
  let element = document.getElementById(classID);

  if (input.value.match(pattern)) {
    element.classList.remove("invalid");
    element.classList.add("valid");
    document.getElementById(imgID).src = "./assets/img/RightPassword.png";
  } else {
    element.classList.remove("valid");
    element.classList.add("invalid");
    document.getElementById(imgID).src = "./assets/img/WrongPassword.png";
  }
}

/**
 * generating popUp alert-messages
 */
function showAlert(message) {
  let background = document.createElement("div");
  background.className = "pop-up-backdrop";
  background.id = "Alert_Message";
  background.innerHTML = /*html*/ `
    <div class="alert-container">
         <h3>Information</h3>
         <p>${message}</p> 
        <button onclick="closeAlert()">Ok</button>
    </div>
  `;
  document.body.appendChild(background);
}


/**
 * closing popUp message that tells us that the user was not found
 */
function closeAlert() {
  let alertMessage = document.getElementById("Alert_Message");
  document.body.removeChild(alertMessage);
}


/**
 * let inputfield-icon & border around inputfield disappear
 */
document.addEventListener("click", function (event) {
  let inputBoxes = document.querySelectorAll(".input-box");
  inputBoxes.forEach(function (inputBox) {
    let img = inputBox.querySelector("img");
    let inputField = inputBox.querySelector("input");

    if (inputBox.contains(event.target) && inputField.type === "password") {
      img.src = "./assets/img/visibility_off.png";
      inputBox.style.borderColor = "#29abe2";

      //Event-Listener for changed img
      img.addEventListener("click", function () {
        if (img.src.endsWith("visibility_off.png")) {
          img.src = "./assets/img/visibility.png";
          inputField.type = "text";
        } else {
          img.src = "./assets/img/visibility_off.png";
          inputField.type = "password";
        }
      });
    } else {
      img.style.display = "block";
      inputBox.style.borderColor = "#d1d1d1";
    }
  });
});
