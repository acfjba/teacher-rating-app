
export function showError(error, elementId = "errorDisplay") {
  console.error("🚨 Error:", error.message || error);
  let el = document.getElementById(elementId);
  if (!el) {
    el = document.createElement("div");
    el.id = elementId;
    el.style.color = "red";
    el.style.padding = "10px";
    document.body.prepend(el);
  }
  el.textContent = "⚠️ " + (error.message || error);
}
