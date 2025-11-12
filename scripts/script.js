    const API_URL = 'https://6913ff4bf34a2ff1170dc8da.mockapi.io/METAS';
    let metas = [];

    // Cargar metas
    async function cargarMetas() {
      try {
        const res = await fetch(API_URL);
        metas = await res.json();
        mostrarMetas();
      } catch (error) {
        alert('Error al cargar las metas. Revisa la conexión.');
      }
    }

    // Mostrar metas en pantalla
    function mostrarMetas() {
      const principalContainer = document.getElementById('meta-principal-container');
      const listaContainer = document.getElementById('metas-lista');

      principalContainer.innerHTML = '';
      listaContainer.innerHTML = '';

      if (metas.length === 0) {
        principalContainer.innerHTML = '<p style="text-align:center; font-size:1.2rem;">No hay metas aún. ¡Agrega una!</p>';
        return;
      }

      // Primera meta
      const primera = metas[0];
      const faltante = primera.CantidadFinal - primera.totalAhorrado;
      principalContainer.innerHTML = `
        <div class="meta-principal">
          <h2>${primera.Nombre}</h2>
          <div class="progreso">Llevas: $${primera.totalAhorrado}</div>
          <div class="progreso">Faltan: $${faltante > 0 ? faltante : 0}</div>
          <div class="mensaje">
            La cantidad esperada es aproximada, considerando emergencias o inversiones.
          </div>
        </div>
      `;

      // Resto de metas
      metas.forEach((meta, index) => {
        if (index === 0) return; // Saltar la primera

        const card = document.createElement('div');
        card.className = 'meta-card';
        const faltanteResto = meta.CantidadFinal - meta.totalAhorrado;
        card.innerHTML = `
          <h3>${meta.Nombre}</h3>
          <p><strong>Objetivo:</strong> $${meta.CantidadFinal}</p>
          <p><strong>Ahorrado:</strong> $${meta.totalAhorrado}</p>
          <p><strong>Faltan:</strong> $${faltanteResto > 0 ? faltanteResto : 0}</p>
          <div class="ahorro-input">
            <input type="number" placeholder="Ahorro este mes" id="ahorro-${meta.id}" />
            <button onclick="agregarAhorro(${meta.id})">Añadir</button>
          </div>
        `;
        listaContainer.appendChild(card);
      });
    }

    // Añadir ahorro a una meta
    async function agregarAhorro(id) {
      const input = document.getElementById(`ahorro-${id}`);
      const monto = parseFloat(input.value);

      if (isNaN(monto) || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
      }

      const meta = metas.find(m => m.id == id);
      const nuevoAhorrado = meta.totalAhorrado + monto;

      try {
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalAhorrado: nuevoAhorrado })
        });
        meta.totalAhorrado = nuevoAhorrado;
        input.value = '';
        mostrarMetas();
      } catch (error) {
        alert('Error al guardar el ahorro');
      }
    }

    // Mostrar popup
    document.getElementById('btn-agregar').onclick = () => {
      document.getElementById('overlay').style.display = 'flex';
    };

    // Cancelar popup
    document.getElementById('cancelar-meta').onclick = () => {
      document.getElementById('overlay').style.display = 'none';
      limpiarFormulario();
    };

    // Guardar nueva meta
    document.getElementById('guardar-meta').onclick = async () => {
      const nombre = document.getElementById('nueva-nombre').value.trim();
      const cantidad = parseFloat(document.getElementById('nueva-cantidad').value);
      const ahorrado = parseFloat(document.getElementById('nueva-ahorrado').value) || 0;

      if (!nombre || isNaN(cantidad) || cantidad <= 0) {
        alert('Completa todos los campos correctamente');
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Nombre: nombre,
            CantidadFinal: cantidad,
            totalAhorrado: ahorrado
          })
        });
        const nuevaMeta = await res.json();
        metas.push(nuevaMeta);
        mostrarMetas();
        document.getElementById('overlay').style.display = 'none';
        limpiarFormulario();
      } catch (error) {
        alert('Error al crear la meta');
      }
    };

    function limpiarFormulario() {
      document.getElementById('nueva-nombre').value = '';
      document.getElementById('nueva-cantidad').value = '';
      document.getElementById('nueva-ahorrado').value = '0';
    }

    // Iniciar
    cargarMetas();
