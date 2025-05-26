
// Notifies user when offline/online and protects session

function showStatus(status) {
  let el = document.getElementById("netStatus");
  if (!el) {
    el = document.createElement("div");
    el.id = "netStatus";
    el.style.position = "fixed";
    el.style.bottom = "0";
    el.style.left = "0";
    el.style.width = "100%";
    el.style.padding = "10px";
    el.style.textAlign = "center";
    el.style.zIndex = "9999";
    el.style.fontWeight = "bold";
    document.body.appendChild(el);
  }
  if (status === "offline") {
    el.style.backgroundColor = "#ff4444";
    el.style.color = "white";
    el.textContent = "⚠️ Connection lost. Trying to reconnect...";
  } else {
    el.style.backgroundColor = "#4CAF50";
    el.style.color = "white";
    el.textContent = "✅ Back online.";
    setTimeout(() => el.remove(), 3000);
  }
}

// Detect connectivity
window.addEventListener("offline", () => showStatus("offline"));
window.addEventListener("online", () => showStatus("online"));

// Optional Firebase keep-alive logic if needed
