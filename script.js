// Select SVG and add points for triangle
const svg = document.getElementById('triangle-svg');

// Initial triangle coordinates
let points = [
  { x: 50, y: 200 },
  { x: 250, y: 200 },
  { x: 150, y: 50 }
];

// Create draggable circles for each point
points.forEach((p, i) => {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", p.x);
  circle.setAttribute("cy", p.y);
  circle.setAttribute("r", 8);
  circle.setAttribute("fill", "#ff5722");
  circle.setAttribute("cursor", "move");
  circle.setAttribute("data-index", i);
  svg.appendChild(circle);
});

// Create dynamic triangle polygon
const triangle = svg.querySelector("polygon");

// Create formula display (attach dynamically if needed)
const formulaBox = document.querySelector('.formula-box');
const results = document.createElement("div");
results.style.marginTop = "1rem";
results.style.fontSize = "0.95rem";
results.style.color = "#004d40";
formulaBox.appendChild(results);

// Handle dragging
let selected = null;

svg.addEventListener("mousedown", (e) => {
  if (e.target.tagName === "circle") {
    selected = e.target;
  }
});

svg.addEventListener("mousemove", (e) => {
  if (!selected) return;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  const index = parseInt(selected.getAttribute("data-index"));
  points[index].x = svgP.x;
  points[index].y = svgP.y;
  updateTriangle();
});

svg.addEventListener("mouseup", () => (selected = null));
svg.addEventListener("mouseleave", () => (selected = null));

// Update triangle shape and formulas
function updateTriangle() {
  // Update polygon points
  triangle.setAttribute("points", points.map(p => `${p.x},${p.y}`).join(" "));

  // Move draggable points
  const circles = svg.querySelectorAll("circle");
  circles.forEach((c, i) => {
    c.setAttribute("cx", points[i].x);
    c.setAttribute("cy", points[i].y);
  });

  // Calculate side lengths
  const a = distance(points[1], points[2]);
  const b = distance(points[0], points[2]);
  const c = distance(points[0], points[1]);
  const perimeter = a + b + c;

  // Heron’s formula
  const s = perimeter / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  // Show values
  results.innerHTML = `
    <strong>Sides:</strong><br>
    a = ${a.toFixed(2)}, b = ${b.toFixed(2)}, c = ${c.toFixed(2)}<br>
    <strong>Perimeter:</strong> ${perimeter.toFixed(2)}<br>
    <strong>Area (Heron’s):</strong> ${area.toFixed(2)} sq units
  `;
}

// Utility: distance between 2 points
function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// First load
updateTriangle();
