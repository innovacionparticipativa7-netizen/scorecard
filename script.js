/* =====================
   REFERENCIAS DOM
===================== */
const fechaInput = document.getElementById("fecha");
const programaSelect = document.getElementById("programa");
const toleranciaInput = document.getElementById("tolerancia");
const kpiBody = document.querySelector("#kpiTable tbody");

const greenBox = document.getElementById("green");
const yellowBox = document.getElementById("yellow");
const redBox = document.getElementById("red");

let currentRole = "admin";

/* =====================
   ROLES
===================== */
function setRole(role) {
  currentRole = role;
  document.body.className = role;

  const editable = role === "admin";

  document.querySelectorAll("input, select, button").forEach(el => {
    // 🔥 NO bloquear el selector de rol
    if (el.id === "role") return;

    if (el.closest(".summary")) return;

    if (
      el.textContent === "🗑️" ||
      el.textContent === "✔" ||
      el.textContent.includes("Añadir")
    ) {
      el.disabled = !editable;
    }

    if (
      el.classList.contains("notas") ||
      el.classList.contains("kpi") ||
      el.classList.contains("meta") ||
      el.classList.contains("actual") ||
      el.classList.contains("direccion") ||
      el.classList.contains("tipo")
    ) {
      el.disabled = !editable;
    }
  });

  cargarDatos();
}


/* =====================
   HELPERS STORAGE
===================== */
function getData() {
  return JSON.parse(localStorage.getItem("scorecard")) || {};
}

function saveData(data) {
  localStorage.setItem("scorecard", JSON.stringify(data));
}

function getKey() {
  if (!fechaInput.value || !programaSelect.value) return null;
  return `${fechaInput.value}_${programaSelect.value}`;
}

/* =====================
   CONFIGURACIÓN
===================== */
function guardarConfig() {
  if (currentRole === "viewer") return;

  const key = getKey();
  if (!key) return alert("Seleccione fecha y programa");

  const data = getData();

  data[key] = data[key] || {};
  data[key].config = {
    fecha: fechaInput.value,
    programa: programaSelect.value,
    tolerancia: toleranciaInput.value
  };

  saveData(data);
  alert("Configuración guardada");
}

/* =====================
   KPI CRUD
===================== */
function agregarKPI(kpi = {}) {
  if (currentRole === "viewer") return;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input class="kpi" value="${kpi.nombre || ""}"></td>

    <td>
      <select class="tipo">
        <option ${kpi.tipo === "Cuantitativo" ? "selected" : ""}>Cuantitativo</option>
        <option ${kpi.tipo === "Cualitativo" ? "selected" : ""}>Cualitativo</option>
      </select>
    </td>

    <td><input type="number" class="meta" value="${kpi.meta || ""}"></td>

    <td><input type="number" class="actual" value="${kpi.actual || ""}"></td>

    <td>
      <select class="direccion">
        <option value="menos" ${kpi.direccion === "menos" ? "selected" : ""}>Menos es mejor</option>
        <option value="mas" ${kpi.direccion === "mas" ? "selected" : ""}>Más es mejor</option>
      </select>
    </td>

    <td class="estado">${kpi.estado || "-"}</td>

    <td><input class="notas" value="${kpi.notas || ""}"></td>

    <td>
      <button onclick="calcularEstado(this)">✔</button>
      <button onclick="eliminarFila(this)">🗑️</button>
    </td>
  `;

  kpiBody.appendChild(row);
}

/* =====================
   KPI LÓGICA
===================== */
function calcularEstado(btn) {
  const row = btn.closest("tr");

  const meta = Number(row.querySelector(".meta").value);
  const actual = Number(row.querySelector(".actual").value);
  const direccion = row.querySelector(".direccion").value;
  const tolerancia = Number(toleranciaInput.value) / 100;

  const estado = row.querySelector(".estado");
  estado.textContent = "-";
  estado.className = "estado";

  if (isNaN(meta) || isNaN(actual)) return;

  if (direccion === "mas") {
    const limite = meta * (1 - tolerancia);
    if (actual >= meta) estado.textContent = "Verde", estado.classList.add("verde");
    else if (actual >= limite) estado.textContent = "Amarillo", estado.classList.add("amarillo");
    else estado.textContent = "Rojo", estado.classList.add("rojo");
  } else {
    const limite = meta * (1 + tolerancia);
    if (actual <= meta) estado.textContent = "Verde", estado.classList.add("verde");
    else if (actual <= limite) estado.textContent = "Amarillo", estado.classList.add("amarillo");
    else estado.textContent = "Rojo", estado.classList.add("rojo");
  }

  guardarKPIs();
  actualizarResumen();
}

function eliminarFila(btn) {
  btn.closest("tr").remove();
  guardarKPIs();
  actualizarResumen();
}

/* =====================
   GUARDAR / CARGAR KPIs
===================== */
function guardarKPIs() {
  if (currentRole === "viewer") return;

  const key = getKey();
  if (!key) return;

  const data = getData();
  data[key] = data[key] || {};
  data[key].kpis = [];

  kpiBody.querySelectorAll("tr").forEach(row => {
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

  saveData(data);
}

function cargarDatos() {
  const key = getKey();
  const data = getData();

  kpiBody.innerHTML = "";

  if (!key || !data[key] || !data[key].kpis) {
    actualizarResumen();
    return;
  }

  if (data[key].config) {
    toleranciaInput.value = data[key].config.tolerancia;
  }

  data[key].kpis.forEach(kpi => {
    agregarKPI(kpi);
    const row = kpiBody.lastElementChild;
    if (row) calcularEstado(row.querySelector("button"));
  });

  actualizarResumen();
}

/* =====================
   RESUMEN
===================== */
function actualizarResumen() {
  let v = 0, a = 0, r = 0;

  document.querySelectorAll(".estado").forEach(e => {
    if (e.textContent === "Verde") v++;
    if (e.textContent === "Amarillo") a++;
    if (e.textContent === "Rojo") r++;
  });

  greenBox.textContent = `🟢 ${v}`;
  yellowBox.textContent = `🟡 ${a}`;
  redBox.textContent = `🔴 ${r}`;
}
function descargarCSV() {
  let csv = [];
  
  // Encabezados
  csv.push([
    "KPI",
    "Tipo",
    "Meta",
    "Actual",
    "Dirección",
    "Estado",
    "Notas"
  ].join(","));

  // Filas
  document.querySelectorAll("#kpiTable tbody tr").forEach(row => {
    const fila = [
      row.querySelector(".kpi")?.value || "",
      row.querySelector(".tipo")?.value || "",
      row.querySelector(".meta")?.value || "",
      row.querySelector(".actual")?.value || "",
      row.querySelector(".direccion")?.value || "",
      row.querySelector(".estado")?.textContent || "",
      row.querySelector(".notas")?.value || ""
    ];

    // Escapar comas y comillas
    csv.push(
      fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
  });

  // Crear archivo
  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `kpis_${fechaInput.value || "sin_fecha"}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}


/* =====================
   EVENTOS
===================== */
fechaInput.addEventListener("change", cargarDatos);
programaSelect.addEventListener("change", cargarDatos);


