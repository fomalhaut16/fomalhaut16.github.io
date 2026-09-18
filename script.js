const orbit = document.querySelector(".page-links");

if (orbit) {
  const links = [...orbit.querySelectorAll(".page-link")];
  const count = links.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const meteor = orbit.querySelector(".orbit-meteor");
  const preview = orbit.querySelector(".orbit-preview");
  const copy = preview.querySelector(".preview-copy");
  const title = preview.querySelector(".preview-title");
  const description = preview.querySelector(".preview-description");
  const openLink = preview.querySelector(".preview-open");
  let selected = null;
  let meteorAnimation;
  let previewAnimation;
  let pointerType = "";

  const positions = links
    .map((_, index) => {
      const angle = (-90 + (360 * index) / count) * (Math.PI / 180);

      return {
        x: 50 + 50 * Math.cos(angle),
        y: 50 + 50 * Math.sin(angle),
        angle: (angle * 180) / Math.PI + 90,
      };
    })
    .sort((a, b) => {
      const rowDifference = Math.round(a.y * 1000) - Math.round(b.y * 1000);
      return rowDifference || a.x - b.x;
    });

  links.forEach((link, index) => {
    link.style.left = `${positions[index].x}%`;
    link.style.top = `${positions[index].y}%`;
  });

  const resizeBeads = () => {
    const smallScreen = window.matchMedia("(max-width: 600px)").matches;
    // Use the circle's intended diameter even when the dense layout is active.
    const diameter = smallScreen
      ? Math.min(window.innerWidth * 0.62, 240)
      : Math.min(window.innerWidth * 0.58, 520);
    const spacing = count > 1 ? diameter * Math.sin(Math.PI / count) : diameter;
    const dense = spacing * 0.68 < 52;
    const maximum = smallScreen ? 74 : 96;
    const size = dense ? maximum : Math.min(maximum, spacing * 0.68);

    orbit.dataset.layout = dense ? "grid" : "circle";
    orbit.style.setProperty("--bead-size", `${size}px`);
    orbit.style.setProperty("--number-size", `${Math.max(11, size * 0.26)}px`);
    orbit.style.setProperty("--status-size", `${Math.max(7, size * 0.095)}px`);
    orbit.dataset.compact = size < 64;
  };

  const shoot = (link) => {
    meteorAnimation?.cancel();
    if (reducedMotion.matches || orbit.dataset.layout !== "circle") return;
    const angle = positions[links.indexOf(link)].angle;
    meteorAnimation = meteor.animate(
      [
        { transform: `rotate(${angle}deg)`, opacity: 0 },
        { opacity: 1, offset: 0.06 },
        { opacity: 0.65, offset: 0.35 },
        { transform: `rotate(${angle + 360}deg)`, opacity: 0 },
      ],
      { duration: 650, easing: "linear" },
    );
  };

  const select = (link) => {
    shoot(link);
    if (selected === link) return;
    selected?.removeAttribute("data-selected");
    selected = link;
    selected.setAttribute("data-selected", "");
    const number = link.querySelector(".page-number").textContent.trim();
    title.textContent = link.dataset.title || number;
    description.textContent = link.dataset.description || "準備中です。";
    openLink.href = link.href;
    openLink.setAttribute("aria-label", `${title.textContent}を開く`);
    openLink.hidden = false;
    previewAnimation?.cancel();
    if (!reducedMotion.matches) {
      previewAnimation = copy.animate(
        [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 220, easing: "ease-out" },
      );
    }
  };

  links.forEach((link) => {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") select(link);
    });
    link.addEventListener("pointerdown", (event) => { pointerType = event.pointerType; });
    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible") && pointerType !== "touch" && pointerType !== "pen") select(link);
    });
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const touch = event.pointerType === "touch" || event.pointerType === "pen" ||
        (event.detail > 0 && (pointerType === "touch" || pointerType === "pen"));
      // Touch: first tap previews; the central link or a second tap opens the page.
      if (touch && selected !== link) {
        event.preventDefault();
        select(link);
      }
    });
  });

  document.addEventListener("keydown", () => { pointerType = ""; });

  reducedMotion.addEventListener("change", () => {
    meteorAnimation?.cancel();
    previewAnimation?.cancel();
  });

  preview.hidden = false;
  orbit.dataset.enhanced = "";
  resizeBeads();

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeBeads).observe(orbit.parentElement);
  } else {
    window.addEventListener("resize", resizeBeads);
  }
}
