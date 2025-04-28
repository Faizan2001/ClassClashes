let activeUser = null;
let users = loadUsers() || {};

function loadUsers() {
  const saved = localStorage.getItem("scheduleUsers");
  return saved ? JSON.parse(saved) : null;
}

function saveUsers() {
  localStorage.setItem("scheduleUsers", JSON.stringify(users));
  // Send updates to all connected users
  if (window.updateInterval) clearInterval(window.updateInterval);
  window.updateInterval = setInterval(loadLatestUsers, 2000);
}

function loadLatestUsers() {
  const savedUsers = localStorage.getItem("scheduleUsers");
  if (savedUsers) {
    users = JSON.parse(savedUsers);
    updateUI();
  }
}

function createUser(name, userId) {
  if (!users[userId]) {
    users[userId] = {
      name: name,
      schedule: Array(7)
        .fill()
        .map(() => Array(6).fill(false)),
    };
    saveUsers();
  }
  return users[userId];
}

function setActiveUser(userId) {
  activeUser = userId;
  updateUI();
}

function toggleSlot(day, time) {
  if (!activeUser) return;
  users[activeUser].schedule[day][time] =
    !users[activeUser].schedule[day][time];
  saveUsers();
  updateUI();
}

function updateUI() {
  const slots = document.querySelectorAll(".slot");
  slots.forEach((slot) => {
    const day = parseInt(slot.dataset.day);
    const time = parseInt(slot.dataset.time);
    slot.className = "slot";
    updateSlotDisplay(slot, day, time);
  });

  // Update user list
  const userList = document.getElementById("userList");
  userList.innerHTML = Object.entries(users)
    .map(
      ([userId, user]) => `
      <div class="user-item ${activeUser === userId ? "active" : ""}">
        <button onclick="setActiveUser('${userId}')">${user.name}</button>
      </div>
    `
    )
    .join("");
}

let compareMode = false;

function compareSchedules() {
  compareMode = !compareMode;
  document.getElementById("compare").classList.toggle("active");
  updateUI();
}

function updateSlotDisplay(slot, day, time) {
  const usersWithSlot = Object.values(users).filter(
    (user) => user.schedule[day][time]
  );

  if (compareMode) {
    if (usersWithSlot.length > 1) {
      slot.classList.add("conflict");
    } else if (usersWithSlot.length === 1) {
      slot.classList.add("selected");
    }
  } else {
    if (usersWithSlot.some((user) => user === users[activeUser])) {
      slot.classList.add("selected");
    }
  }
}

function addNewUser() {
  const name = document.getElementById("userName").value;
  const userId = document.getElementById("userId").value;
  if (name && userId) {
    createUser(name, userId);
    setActiveUser(userId);
    document.getElementById("userName").value = "";
    document.getElementById("userId").value = "";
  }
}

// Initialize click handlers
document.querySelectorAll(".slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    const day = parseInt(slot.dataset.day);
    const time = parseInt(slot.dataset.time);
    toggleSlot(day, time);
  });
});
