let token = '';

async function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (response.ok) {
    alert("Registration Successful");
    window.location.href = "index.html";
  } else {
    alert("Registration Failed");
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    token = data.token;
    localStorage.setItem("token", token);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid Credentials");
  }
}

async function addTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const dueDate = document.getElementById("dueDate").value;

  await fetch("http://localhost:5000/dashboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ title, description, dueDate })
  });

  fetchTasks();
}

async function fetchTasks() {
  const response = await fetch("http://localhost:5000/dashboard", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  const tasks = await response.json();
  displayTasks(tasks);
}

function displayTasks(tasks) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach(displayTask);
}

function displayTask(task) {
  const taskList = document.getElementById("taskList");
  const div = document.createElement("div");
  div.classList.add("task");
  div.innerHTML = `
    ${task.title} - ${task.description} (Due: ${task.dueDate}) - [${task.status}]
    <button onclick="markCompleted('${task._id}')">Mark as Completed</button>
    <button onclick="deleteTask('${task._id}')">Delete</button>
  `;
  taskList.appendChild(div);
}

async function deleteTask(id) {
  await fetch(`http://localhost:5000/dashboard`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ taskId: id })
  });
  fetchTasks();
}

async function markCompleted(id) {
  await fetch(`http://localhost:5000/dashboard`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ taskId: id })
  });
  fetchTasks();
}

function searchTasks() {
  const query = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".task").forEach(task => {
    task.style.display = task.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

window.onload = fetchTasks;
