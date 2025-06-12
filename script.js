function openLanguageModal() {
  document.getElementById('languageModal').style.display = 'block';
}

function closeLanguageModal() {
  document.getElementById('languageModal').style.display = 'none';
}

function selectLanguage(language) {
  document.querySelector('.language-toggle').innerHTML = language + ' &#x25BC;';
  closeLanguageModal();
}

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const found = users.find(user => user.username === username && user.password === password);

  if (found) {
    alert("Login successful");
    window.location.href = "home.html";
  } else {
    alert("Invalid credentials");
  }
}

function registerUser() {
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful");
  window.location.href = "index.html";
}

function logoutUser() {
  alert("Logged out");
  window.location.href = "index.html";
}
