let notifications = [];

function saveNotification() {
    const category = document.getElementById("category").value;
    const title = document.getElementById("title").value;
    const message = document.getElementById("message").value;

    if (!title || !message) {
        alert("Please fill in all fields");
        return;
    }

    const newNotification = {
        id: Date.now(),
        category,
        title,
        message,
        date: new Date().toLocaleDateString()
    };

    notifications.push(newNotification);
    displayNotifications();

    alert("Notification saved!");
    clearForm();
}

function sendNotification() {
    alert("Notification sent to users (linking later with Firebase)");
}

function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("message").value = "";
}

function displayNotifications() {
    const list = document.getElementById("notificationList");
    list.innerHTML = "";

    notifications.forEach(n => {
        list.innerHTML += `
            <div class="notification-card">
                <strong>${n.category} Wellness</strong><br>
                <b>${n.title}</b><br>
                <small>Created: ${n.date}</small>
                <p>${n.message}</p>

                <button onclick="viewNotification(${n.id})">View</button>
                <button onclick="deleteNotification(${n.id})">Delete</button>
            </div>
        `;
    });
}

function viewNotification(id) {
    const n = notifications.find(x => x.id === id);
    alert(`${n.title}\n\n${n.message}`);
}

function deleteNotification(id) {
    notifications = notifications.filter(x => x.id !== id);
    displayNotifications();
}