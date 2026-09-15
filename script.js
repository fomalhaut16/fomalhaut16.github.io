const orbit = document.querySelector(".page-links");

if (orbit) {
  const links = [...orbit.querySelectorAll(".page-link")];
  const count = links.length;

  const positions = links
    .map((_, index) => {
      const angle = (-90 + (360 * index) / count) * (Math.PI / 180);

      return {
        x: 50 + 50 * Math.cos(angle),
        y: 50 + 50 * Math.sin(angle),
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
    const radius = orbit.clientWidth / 2;
    const spacing = count > 1 ? 2 * radius * Math.sin(Math.PI / count) : radius * 2;
    const smallScreen = window.matchMedia("(max-width: 600px)").matches;
    const maximum = smallScreen ? 74 : 96;
    const size = Math.min(maximum, Math.max(34, spacing * 0.68));

    orbit.style.setProperty("--bead-size", `${size}px`);
    orbit.style.setProperty("--number-size", `${Math.max(11, size * 0.26)}px`);
    orbit.style.setProperty("--status-size", `${Math.max(7, size * 0.095)}px`);
    orbit.dataset.compact = size < 52;
  };

  resizeBeads();

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeBeads).observe(orbit);
  } else {
    window.addEventListener("resize", resizeBeads);
  }
}
