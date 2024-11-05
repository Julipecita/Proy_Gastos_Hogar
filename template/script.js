
// Espera a que el contenido de la página esté completamente cargado antes de ejecutar
// el código.
document.addEventListener("DOMContentLoaded", () => {

    // Referencias a elementos del formulario y botones en el DOM.
    const form = document.getElementById("gastosForm");  // Formulario para crear o actualizar una persona.
    //const updateBtn = document.getElementById("updateBtn"); // Botón para actualizar personas.
    const tableBody = document.querySelector("#gastosTable tbody"); // Cuerpo de la tabla donde se muestran laos gastos.

    // Llama a la función para obtener y mostrar los gastos cuando la página se carga.
    fetchGastos();

    let isEditing = false; // Bandera que indica si el usuario está en modo edición.
    let actualItem = null; // Almacena la cédula de la persona que se está editando.

    // Obtiene la lista de los gastos de la API.
    function fetchGastos() {
        fetch("/api/obtener")
            .then((response) => response.json())
            .then((data) => renderGastos(data.data)) // Llama a renderGastos para mostrar los datos en la tabla.
            .catch((error) => console.error("Error fetching gastos:", error)); // Muestra un error en la consola si falla la solicitud.
    }

    // Renderiza los gastos en la tabla.
    function renderGastos(gasto) {
        tableBody.innerHTML = ""; // Limpia la tabla antes de agregar los datos.
        gasto.forEach((gastos) => {
            // Crea una fila para cada persona.
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${gastos.item}</td>
            <td>${gastos.concepto}</td>
            <td>${gastos.monto}</td>
            <td>${gastos.fecha}</td>
            <td class="actions">
                <button class="button-edt" onclick="editGastos('${gastos.item}')">Editar</button>
                <button class="button-del" onclick="deleteGastos('${gastos.item}')">Eliminar</button>
            </td>`;
            tableBody.appendChild(row); // Agrega la fila a la tabla.
        });
    }

    // Maneja el evento de envío del formulario.
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita el comportamiento predeterminado del formulario.

        // Obtiene los datos ingresados en el formulario.
        const item = form.item.value;
        const concepto = form.concepto.value;
        const monto = form.monto.value;
        const fecha = form.fecha.value;

        const gastoData = { item, concepto, monto, fecha }; // Datos del gasto en un objeto.

        if (isEditing) {
            // Si está en modo edición, actualiza la persona con la cédula actual.
            updateGasto(actualItem, gastoData);
        } else {
            // Si no está en modo edición, crea una nueva persona.
            createGasto(gastoData);
        }

    });

    // Función para Agregar un nuevo registro de gasto.
    function createGasto(gastos) {
        fetch("/api/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gastos),
        })
            .then(fetchGastos) // Refresca la lista de gastos después de crear una nueva.
            .catch((error) => console.error("Error creating gasto:", error));
    }

    // Función para editar un gasto. Obtiene los datos de un gasto usando 
    //su itemcédula y los muestra en el formulario.
    window.editGasto = (item) => {
        isEditing = true; // Cambia a modo edición.
        actualItem = item; // Almacena item del gasto que se está editando.

        // Solicita los datos del gasto usando la API.
        fetch(`/api/obtener/${item}`)
            .then(() => {
                const row = Array.from(document.querySelectorAll('#gastosTable tbody tr'))
                    .find(tr => tr.cells[0].textContent === item);

                document.getElementById('item').value = row.cells[0].textContent;
                document.getElementById('concepto').value = row.cells[1].textContent;
                document.getElementById('monto').value = row.cells[2].textContent;
                document.getElementById('fecha').value = row.cells[3].textContent;

                actualItem = item;  // Establece el item actual
                document.getElementById('submitBtn').style.display = 'inline';

            })
            .catch((error) => console.error("Error al obtener datos del gasto:", error))
    };

    // Función para actualizar una persona.
    function updateGasto(item, updatedData) {
        isEditing = false;
        fetch(`/api/actualizar/${item}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then(() => {
                fetchGastos(); // Refresca la lista de gastos.
                resetForm(); // Resetea el formulario.
            })
            .catch((error) => console.error("Error updating gasto:", error));
    }

    window.deleteGasto = (item) => {
        fetch(`/api/eliminar/${item}`, { method: "DELETE" })
            .then(fetchGastos)
            .catch((error) => console.error("Error Al borrar el registro", error));
    };

    function resetForm() {
        form.reset();
        isEditing = false;
        actualItem = null;
    }

});