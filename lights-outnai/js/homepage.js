const sizeButtons = Array.from(document.querySelectorAll(".sizeChoice"));
const howToToggle = document.getElementById("howToToggle");
const howToContent = document.getElementById("howToContent");

sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = Number(btn.dataset.size);
    window.location.href = `./index.html?size=${size}`;
  });
});

if (howToToggle && howToContent) {
  howToToggle.addEventListener("click", () => {
    const isExpanded = howToToggle.getAttribute("aria-expanded") === "true";
    howToToggle.setAttribute("aria-expanded", String(!isExpanded));
    howToContent.hidden = isExpanded;
  });
}
