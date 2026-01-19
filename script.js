const fechaInput = document.getElementById("fecha");
const programaSelect = document.getElementById("programa");
const toleranciaInput = document.getElementById("tolerancia");
const kpiBody = document.querySelector("#kpiTable tbody");

function setRole(role) {
  document.body.className = role === "viewer" ? "viewer" : "";
}

function guardarConfig() {
  const key = `${fechaInput.value}_${programaSelect.value}`;
  const data = JSON.parse(localStorage.getItem("scorecard")) || {};

  data[key] = data[key] || {};
  data[key].config = {
    fecha: fechaInput.value,
    programa: programaSelect.value,
    tolerancia: toleranciaInput.value
  };

  localStorage.setItem("scorecard", JSON.stringify(data));
  alert("Configuración guardada");
}

function agregarKPI(kpi = {}) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input class="kpi" value="${kpi.nombre || ""}"></td>
    <td>
      <select class="tipo">
        <option>Cuantitativo</option>
        <option>Cualitativo</option>
      </select>
    </td>
    <td><input type="number" class="meta" value="${kpi.meta || ""}"></td>
    <td><input type="number" class="actual" value="${kpi.actual || ""}"></td>
    <td class="estado">-</td>
    <td><input class="notas" value="${kpi.notas || ""}"></td>
    <td>
      <button onclick="calcularEstado(this)">✔</button>
      <button onclick="this.closest('tr').remove(); actualizarResumen()">🗑️</button>
    </td>
  `;

  kpiBody.appendChild(row);
}

function calcularEstado(btn) {
  const row = btn.closest("tr");
  const meta = Number(row.querySelector(".meta").value);
  const actual = Number(row.querySelector(".actual").value);
  const tolerancia = Number(toleranciaInput.value);
  const estado = row.querySelector(".estado");

  estado.className = "estado";

  if (actual <= meta) {
    estado.textContent = "Verde";
    estado.classList.add("verde");
  } else if (actual <= meta * (1 + tolerancia / 100)) {
    estado.textContent = "Amarillo";
    estado.classList.add("amarillo");
  } else {
    estado.textContent = "Rojo";
    estado.classList.add("rojo");
  }

  actualizarResumen();
}

function actualizarResumen() {
  let v = 0, a = 0, r = 0;

  document.querySelectorAll(".estado").forEach(e => {
    if (e.textContent === "Verde") v++;
    if (e.textContent === "Amarillo") a++;
    if (e.textContent === "Rojo") r++;
  });

  document.getElementById("green").textContent = `🟢 ${v}`;
  document.getElementById("yellow").textContent = `🟡 ${a}`;
  document.getElementById("red").textContent = `🔴 ${r}`;
}






