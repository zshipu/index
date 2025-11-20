import { TOOLS, TOOL_SECTIONS } from "./tools_data.js";

function createToolLogoBadge(logoStyle) {
  const badge = document.createElement("div");
  badge.className = "tool-logo-badge";
  badge.style.background = logoStyle.bg;
  const span = document.createElement("span");
  span.className = "tool-logo-mark";
  span.textContent = logoStyle.text;
  badge.appendChild(span);
  return badge;
}

function createTagPill(label, type) {
  const pill = document.createElement("span");
  pill.className = "tag-pill " + (type === "functional" ? "tag-functional" : "tag-value");
  const dot = document.createElement("span");
  dot.className = "tag-dot";
  const text = document.createElement("span");
  text.textContent = label;
  pill.appendChild(dot);
  pill.appendChild(text);
  return pill;
}

function createToolCard(tool) {
  const outer = document.createElement("article");
  outer.className = "tool-card";

  const inner = document.createElement("div");
  inner.className = "tool-card-inner";

  const header = document.createElement("div");
  header.className = "tool-card-header";

  const logo = createToolLogoBadge(tool.logoStyle);
  header.appendChild(logo);

  const titleBlock = document.createElement("div");
  titleBlock.className = "tool-title-block";

  const nameEl = document.createElement("h3");
  nameEl.className = "tool-name title-en";
  nameEl.textContent = tool.name;
  titleBlock.appendChild(nameEl);

  const sectionDef = TOOL_SECTIONS.find(s => s.id === tool.sectionId);
  const catEl = document.createElement("p");
  catEl.className = "tool-category body-ch";
  catEl.textContent = sectionDef ? sectionDef.label : "";
  titleBlock.appendChild(catEl);

  header.appendChild(titleBlock);
  inner.appendChild(header);

  const desc = document.createElement("p");
  desc.className = "tool-desc body-ch";
  desc.textContent = tool.description;
  inner.appendChild(desc);

  const tagsWrap = document.createElement("div");
  tagsWrap.className = "tool-tags";
  (tool.tagsFunctional || []).forEach(t => {
    tagsWrap.appendChild(createTagPill(t, "functional"));
  });
  (tool.tagsValue || []).forEach(t => {
    tagsWrap.appendChild(createTagPill(t, "value"));
  });
  inner.appendChild(tagsWrap);

  const footer = document.createElement("div");
  footer.className = "tool-footer";

  const button = document.createElement("button");
  button.className = "tool-cta btn-ch";
  button.type = "button";
  button.innerHTML = '<span>前往官网</span>';
  button.addEventListener("click", () => {
    if (tool.url) {
      window.open(tool.url, "_blank", "noopener,noreferrer");
    }
  });

  const meta = document.createElement("p");
  meta.className = "tool-meta body-ch";
  const func = (tool.tagsFunctional || [])[0] || "";
  const val = (tool.tagsValue || [])[0] || "";
  const pieces = [];
  if (func) pieces.push(func);
  if (val) pieces.push(val);
  meta.textContent = pieces.join(" · ");

  footer.appendChild(button);
  footer.appendChild(meta);

  inner.appendChild(footer);

  outer.appendChild(inner);
  return outer;
}

function renderTools() {
  const bySection = {};
  TOOL_SECTIONS.forEach(s => {
    bySection[s.id] = [];
  });
  TOOLS.forEach(tool => {
    if (!bySection[tool.sectionId]) {
      bySection[tool.sectionId] = [];
    }
    bySection[tool.sectionId].push(tool);
  });

  Object.keys(bySection).forEach(sectionId => {
    const grid = document.querySelector('.tool-grid[data-section="' + sectionId + '"]');
    if (!grid) return;
    bySection[sectionId].forEach(tool => {
      const card = createToolCard(tool);
      grid.appendChild(card);
    });
  });
}

function setupNavScroll() {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.charAt(0) !== "#") return;
      e.preventDefault();
      const element = document.querySelector(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 76;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    });
  });

  const sectionMap = {
    "section-writing": ["writing"],
    "section-visual": ["image-gen", "image-edit"],
    "section-career": ["career"],
    "section-learning": ["learning"],
    "section-docs": ["docs"],
    "section-ops": ["docs", "video", "image-gen"],
    "section-code": ["code"],
    "section-all": TOOL_SECTIONS.map(s => s.id)
  };

  const sectionElements = {};
  Object.keys(sectionMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionElements[id] = el;
  });

  function updateActiveNav() {
    const scrollPos = window.scrollY || window.pageYOffset;
    let activeId = null;
    let maxTop = -Infinity;
    Object.keys(sectionElements).forEach(id => {
      const rect = sectionElements[id].getBoundingClientRect();
      const top = rect.top + scrollPos;
      if (scrollPos + 90 >= top && top > maxTop) {
        maxTop = top;
        activeId = id;
      }
    });
    navLinks.forEach(link => {
      link.classList.remove("is-active");
      const target = link.getAttribute("data-target");
      if (!target) return;
      if (target === activeId) {
        link.classList.add("is-active");
      }
    });
  }

  updateActiveNav();
  window.addEventListener("scroll", updateActiveNav, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTools();
  setupNavScroll();
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
});
