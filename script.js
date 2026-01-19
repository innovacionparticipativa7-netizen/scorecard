const fechaInput = document.getElementById("fecha");
const programaSelect = document.getElementById("programa");
const toleranciaInput = document.getElementById("tolerancia");
const kpiBody = document.querySelector("#kpiTable tbody");

let currentRole = "admin";

/* ---------------- ROLES ---------------- */

function setRole(role) {
  document.body.className = role;

  const editable = role === "admin";

  document.querySelectorAll("input, select, button").forEach(el => {
    if (el.closest(".summary")) return;
    if (el.textContent === "🗑️" || el.textContent === "✔" || el.textContent.includes("Añadir")) {
      el.disabled = !editable;
    }
    if (el.classList.contains("notas") || el.classList.contains("kpi")) {
      el.disabled = !editable;
    }
  });
}


/* ---------------- CONFIG ---------------- */

function guardarConfig() {
  if (currentRole === "viewer") return;

  const key = getKey();
  const data = getData();

  data[key] = data[key] || {};
  data[key].config = {
    fecha: fechaInput.value,
    programa: programaSelect.value,
    tolerancia: toleranciaInput.value
  };

  localStorage.setItem("scorecard", JSON.stringify(data));
  alert("Configuración guardada");
}

/* ---------------- KPI CRUD ---------------- */

function agregarKPI(kpi = {}) {
  if (currentRole === "viewer") return;

  const row = document.createElement("tr");

  row.innerHTML = `
  <td>
    <input class="kpi" value="${kpi.nombre || ""}">
  </td>

  <td>
    <select class="tipo">
      <option ${kpi.tipo === "Cuantitativo" ? "selected" : ""}>Cuantitativo</option>
      <option ${kpi.tipo === "Cualitativo" ? "selected" : ""}>Cualitativo</option>
    </select>
  </td>

  <td>
    <input type="number" class="meta" value="${kpi.meta || ""}">
  </td>

  <td>
    <input type="number" class="actual" value="${kpi.actual || ""}">
  </td>

  <!-- 🔥 AQUÍ VA EL PASO 1 -->
  <td>
    <select class="direccion">
      <option value="menos" ${kpi.direccion === "menos" ? "selected" : ""}>
        Menos es mejor
      </option>
      <option value="mas" ${kpi.direccion === "mas" ? "selected" : ""}>
        Más es mejor
      </option>
    </select>
  </td>

  <td class="estado">
    ${kpi.estado || "-"}
  </td>

  <td>
    <input class="notas" value="${kpi.notas || ""}">
  </td>

  <td>
    <button onclick="calcularEstado(this)">✔</button>
    <button onclick="eliminarFila(this)">🗑️</button>
  </td>
`;

  kpiBody.appendChild(row);
}

function eliminarFila(btn) {
  btn.closest("tr").remove();
  guardarKPIs();
  actualizarResumen();
}

/* ---------------- LÓGICA KPI ---------------- */

function calcularEstado(btn) {
  const row = btn.closest("tr");

  const meta = Number(row.querySelector(".meta").value);
  const actual = Number(row.querySelector(".actual").value);
  const direccion = row.querySelector(".direccion").value;
  const tolerancia = Number(toleranciaInput.value) / 100;

  const estado = row.querySelector(".estado");

  // limpiar estado anterior
  estado.textContent = "-";
  estado.classList.remove("verde", "amarillo", "rojo");

  if (isNaN(meta) || isNaN(actual)) return;

  if (direccion === "mas") {
    const limiteAmarillo = meta * (1 - tolerancia);

    if (actual >= meta) {
      estado.textContent = "Verde";
      estado.classList.add("verde");
    } else if (actual >= limiteAmarillo) {
      estado.textContent = "Amarillo";
      estado.classList.add("amarillo");
    } else {
      estado.textContent = "Rojo";
      estado.classList.add("rojo");
    }

  } else {
    const limiteAmarillo = meta * (1 + tolerancia);

    if (actual <= meta) {
      estado.textContent = "Verde";
      estado.classList.add("verde");
    } else if (actual <= limiteAmarillo) {
      estado.textContent = "Amarillo";
      estado.classList.add("amarillo");
    } else {
      estado.textContent = "Rojo";
      estado.classList.add("rojo");
    }
  }

  guardarKPIs();
  actualizarResumen();
}


/* ---------------- GUARDAR / CARGAR ---------------- */

function guardarKPIs() {
  if (currentRole === "viewer") return;

  const key = getKey();
  const data = getData();

  data[key] = data[key] || {};
  data[key].kpis = [];

  document.querySelectorAll("#kpiTable tbody tr").forEach(row => {
    data[key].kpis.push({
      nombre: row.querySelector(".kpi").value,
      tipo: row.querySelector(".tipo").value,
      meta: row.querySelector(".meta").value,
      actual: row.querySelector(".actual").value,
      direccion: row.querySelector(".direccion").value,
      estado: row.querySelector(".estado").textContent,
      notas: row.querySelector(".notas").value
    });
  });

  localStorage.setItem("scorecard", JSON.stringify(data));
}

function cargarDatos() {
  const key = getKey();
  const data = getData();

  kpiBody.innerHTML = "";

  if (!data[key]) {
    actualizarResumen();
    return;
  }

  const config = data[key].config;
  if (config) toleranciaInput.value = config.tolerancia;

  data[key].kpis.forEach(kpi => {
    agregarKPI(kpi);

    // recalcular estado visual
    const lastRow = kpiBody.lastElementChild;
    if (lastRow) {
      calcularEstado(lastRow.querySelector("button"));
    }
  });

  actualizarResumen();
}


/* ---------------- RESUMEN ---------------- */

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

/* ---------------- HELPERS ---------------- */

function getKey() {
  return `${fechaInput.value}_${programaSelect.value}`;
}

function getData() {
  return JSON.parse(localStorage.getItem("scorecard")) || {};
}

/* ---------------- EVENTOS ---------------- */

fechaInput.addEventListener("change", cargarDatos);
programaSelect.addEventListener("change", cargarDatos);


function getKey() {
  return `${fechaInput.value}_${programaInput.value}`;
}









