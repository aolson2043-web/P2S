"use strict";
document.documentElement.classList.add("js");
const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
function closeMenu() {
  if (!menu || !navigation) return;
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
}
if (menu && navigation) {
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
}
const filters = Array.from(document.querySelectorAll("[data-filter]"));
const programs = Array.from(document.querySelectorAll("#program-library .program-card"));
const status = document.querySelector(".filter-status");
function filterPrograms(category) {
  if (!filters.some(button => button.dataset.filter === category)) return;
  filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
  let count = 0;
  programs.forEach(program => {
    const visible = category === "all" || program.dataset.category === category;
    program.hidden = !visible;
    if (visible) count += 1;
  });
  if (status) status.textContent = `${count} training ${count === 1 ? "path" : "paths"}`;
}
filters.forEach(button => button.addEventListener("click", () => filterPrograms(button.dataset.filter)));
const focus = new URLSearchParams(window.location.search).get("focus");
if (focus) filterPrograms(focus);
function openLinkedProgram() {
  let id;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const card = target.closest(".program-card");
  if (!card || !card.closest("#program-library")) return;
  if (card.hidden) filterPrograms("all");
  const details = card.querySelector("details");
  if (details) details.open = true;
}
document.querySelectorAll("#program-library .program-art").forEach(link => {
  link.addEventListener("click", () => {
    const details = document.getElementById(link.hash.slice(1));
    if (details) details.open = true;
  });
});
window.addEventListener("hashchange", openLinkedProgram);
openLinkedProgram();
