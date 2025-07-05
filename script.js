const svg = document.getElementById('triangle-svg');
const results = document.getElementById('results');
const gridBtn = document.getElementById('toggle-grid');
const protractorBtn = document.getElementById('toggle-protractor');
const resetBtn = document.getElementById('reset-triangle');

let points = [];
let circles = [];
let triangle = null;
let angleLabels = [];
let dragging = null;
let protractorImage = null;
let gridLines = [];
let isGridOn = false;
let isProtractorOn = false;

// Utility functions
function dist(p1, p2) {
  return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

function angleBetween(p1, p2, p3) {
  const a = dist(p2, p3);
  const b = dist(p1, p3);
  const c = dist(p1, p2);
  const angle = Math.acos((b**2 + c**2 - a**2) / (2 * b * c));
  return angle * (180 / Math.PI);
}

// Create triangle polygon
function drawTriangle() {
  if (triangle) triangle.remove();
  triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  triangle.setAttribute("fill", "#e1f5fe");
  triangle.setAttribute("stroke", "#0288d1");
  triangle.setAttribute("stroke-width", "2");
  triangle.setAttribute("pointer-events", "none");
  svg.insertBefore(triangle, svg.firstChild);
}

// Update everything
function update() {
  if (points.length !== 3) return;

  const ptsStr = points.map(p => `${p.x},${p.y}`).join(" ");
  triangle.setAttribute("points", ptsStr);

  circles.forEach((c, i) => {
    c.setAttribute("cx", points[i].x);
    c.setAttribute("cy", points[i].y);
  });

  const [A, B, C] = points;
  const a = dist(B, C);
  const b = dist(A, C);
  const c = dist(A, B);
  const perimeter = a + b + c;
  const s = perimeter / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  const angleA = angleBetween(B, A, C).toFixed(2);
  const angleB = angleBetween(A, B, C).toFixed(2);
  const angleC = (180 - angleA - angleB).toFixed(2);

  const type = triangleType(a, b, c, angleA, angleB, angleC);

  results.innerHTML = `
    <strong>Sides:</strong><br>
    a = ${a.toFixed(2)}, b = ${b.toFixed(2)}, c = ${c.toFixed(2)}<br><br>
    <strong>Angles:</strong><br>
    ∠A = ${angleA}°, ∠B = ${angleB}°, ∠C = ${angleC}°<br><br>
    <strong>Perimeter:</strong> ${perimeter.toFixed(2)}<br>
    <strong>Area (Heron’s):</strong> ${area.toFixed(2)}<br>
    <strong>Type:</strong> ${type}
  `;

  drawAngleArcs([angleA, angleB, angleC]);
}

function triangleType(a, b, c, A, B, C) {
  let type = '';
  if (Math.abs(a - b) < 0.1 && Math.abs(b - c) < 0.1) {
    type = 'Equilateral';
  } else if (Math.abs(a - b) < 0.1 || Math.abs(b - c) < 0.1 || Math.abs(a - c) < 0.1) {
    type = 'Isosceles';
  } else {
    type = 'Scalene';
  }

  if (Math.abs(A - 90) < 1 || Math.abs(B - 90) < 1 || Math.abs(C - 90) < 1) {
    type += ' & Right';
  }

  return type;
}

// Dragging functionality
svg.addEventListener('mousedown', e => {
  if (e.target.tagName === 'circle') {
    dragging = parseInt(e.target.getAttribute('data-index'));
  }
});

svg.addEventListener('mousemove', e => {
  if (dragging === null) return;
  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  points[dragging] = { x, y };
  update();
});

svg.addEventListener('mouseup', () => dragging = null);
svg.addEventListener('mouseleave', () => dragging = null);

// Draw triangle with 3 clicks
svg.addEventListener('click', e => {
  if (points.length === 3) return;

  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const point = { x, y };
  points.push(point);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", 7);
  circle.setAttribute("fill", "#ff5722");
  circle.setAttribute("cursor", "move");
  circle.setAttribute("data-index", points.length - 1);
  svg.appendChild(circle);
  circles.push(circle);

  if (points.length === 3) {
    drawTriangle();
    update();
  }
});

// Draw angle arcs
function drawAngleArcs(angles) {
  angleLabels.forEach(l => l.remove());
  angleLabels = [];

  points.forEach((p, i) => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", p.x + 10);
    label.setAttribute("y", p.y - 10);
    label.setAttribute("fill", "#00796b");
    label.setAttribute("font-size", "14");
    label.setAttribute("font-weight", "bold");
    label.textContent = `∠${String.fromCharCode(65 + i)} = ${angles[i]}°`;
    svg.appendChild(label);
    angleLabels.push(label);
  });
}

// Toggle grid lines
gridBtn.addEventListener('click', () => {
  isGridOn = !isGridOn;

  if (isGridOn) {
    for (let i = 0; i <= 500; i += 25) {
      const v = document.createElementNS("http://www.w3.org/2000/svg", "line");
      v.setAttribute("x1", i);
      v.setAttribute("y1", 0);
      v.setAttribute("x2", i);
      v.setAttribute("y2", 400);
      v.setAttribute("stroke", "#cfd8dc");
      v.setAttribute("stroke-width", "0.5");
      svg.insertBefore(v, svg.firstChild);
      gridLines.push(v);

      const h = document.createElementNS("http://www.w3.org/2000/svg", "line");
      h.setAttribute("x1", 0);
      h.setAttribute("y1", i);
      h.setAttribute("x2", 500);
      h.setAttribute("y2", i);
      h.setAttribute("stroke", "#cfd8dc");
      h.setAttribute("stroke-width", "0.5");
      svg.insertBefore(h, svg.firstChild);
      gridLines.push(h);
    }
  } else {
    gridLines.forEach(line => line.remove());
    gridLines = [];
  }
});

// Toggle protractor
protractorBtn.addEventListener('click', () => {
  isProtractorOn = !isProtractorOn;

  if (isProtractorOn) {
    protractorImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    protractorImage.setAttribute("href", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Protractor.svg/600px-Protractor.svg.png");
    protractorImage.setAttribute("x", 0);
    protractorImage.setAttribute("y", 200);
    protractorImage.setAttribute("width", 300);
    protractorImage.setAttribute("height", 150);
    protractorImage.setAttribute("opacity", "0.3");
    svg.insertBefore(protractorImage, svg.firstChild);
  } else {
    if (protractorImage) protractorImage.remove();
  }
});

// Reset
resetBtn.addEventListener('click', () => {
  points = [];
  circles.forEach(c => c.remove());
  circles = [];
  if (triangle) triangle.remove();
  angleLabels.forEach(a => a.remove());
  angleLabels = [];
  results.innerHTML = '';
});
