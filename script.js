function guardarConfig() {
  const fecha = document.getElementById("fecha").value;
  const programa = document.getElementById("programa").value;
  const tolerancia = Number(document.getElementById("tolerancia").value);

  alert(`Configuración guardada:
Fecha: ${fecha}
Programa: ${programa}
Tolerancia: ${tolerancia}%`);
}

function agregarKPI() {
  const table = document.querySelector("#kpiTable tbody");

  const row = table.insertRow();

  row.innerHTML = `
    <td><input placeholder="Nombre KPI"></td>
    <td>
      <select>
        <option>Cuantitativo</option>
        <option>Cualitativo</option>
      </select>
    </td>
    <td><input type="number" class="meta"></td>
    <td><input type="number" class="actual" oninput="calcularEstado(this)"></td>
    <td class="estado">-</td>
    <td><input placeholder="Notas"></td>
    <td>
      <button onclick="this.closest('tr').remove()">🗑️</button>
    </td>
  `;
}

function calcularEstado(input) {
  const row = input.closest("tr");
  const meta = Number(row.querySelector(".meta").value);
  const actual = Number(input.value);
  const estadoCell = row.querySelector(".estado");
  const tolerancia = Number(document.getElementById("tolerancia").value);

  estadoCell.className = "estado";

  if (actual <= meta) {
    estadoCell.textContent = "Verde";
    estadoCell.classList.add("verde");
  } else if (actual <= meta * (1 + tolerancia / 100)) {
    estadoCell.textContent = "Amarillo";
    estadoCell.classList.add("amarillo");
  } else {
    estadoCell.textContent = "Rojo";
    estadoCell.classList.add("rojo");
  }
}




