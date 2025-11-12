const API_URL = 'https://6913ff4bf34a2ff1170dc8da.mockapi.io/METAS';
let metas = [];
let metaSeleccionada = null;

// Frases motivadoras
const frases = [
  "¡Cada peso cuenta, estás más cerca!",
  "El futuro que sueñas se construye hoy.",
  "¡Un paso más hacia tu libertad!",
  "Ahorrar es invertir en tu felicidad.",
  "¡Tú puedes! La disciplina paga.",
  "Pequeños ahorros, grandes sueños."
];

// Cargar metas
async function cargarMetas() {
  try {
    const res = await fetch(API_URL);
    metas = await res.json();
    mostrarMetas();
  } catch (error) {
    alert('Error al cargar las metas.');
  }
}

// Mostrar metas
function mostrarMetas() {
  const principalContainer = document.getElementById('meta-principal-container');
  const listaContainer = document.getElementById('metas-lista');

  principalContainer.innerHTML = '';
  listaContainer.innerHTML = '';

  if (metas.length === 0) {
    principalContainer.innerHTML = '<p style="text-align:center; font-size:1.3rem; margin:40px;">¡Empieza hoy tu primera meta!</p>';
    return;
  }

  // Primera meta (ahora con click y datos)
  const primera = metas[0];
  const ahorrado = primera.totalAhorrado || 0;
  const faltante = primera.CantidadFinal - ahorrado;

  const principalDiv = document.createElement('div');
  principalDiv.className = 'meta-principal';
  principalDiv.innerHTML = `
    <h2>${primera.Nombre}</h2>
    <div class="objetivo">Objetivo: <strong>$${primera.CantidadFinal}</strong></div>
    <p style="margin:10px 0; font-size:1.2rem;">
      Ahorrado: <strong style="color:#a5d6a7;">$${ahorrado}</strong>
    </p>
    <p class="faltante" style="font-size:1.2rem;">
      Faltan: <strong>$${faltante > 0 ? faltante : 0}</strong>
    </p>
    <div class="frase">"${frases[Math.floor(Math.random() * frases.length)]}"</div>
  `;

  // Añadir click a la meta principal
  principalDiv.onclick = () => abrirPopupAhorro(primera);

  principalContainer.appendChild(principalDiv);

  // Resto de metas (sin cambios, ya tienen click)
  metas.forEach((meta, index) => {
    if (index === 0) return;

    const card = document.createElement('div');
    card.className = 'meta-card';
    const ahorradoR = meta.totalAhorrado || 0;
    const faltanteR = meta.CantidadFinal - ahorradoR;

    card.innerHTML = `
      <h3>${meta.Nombre}</h3>
      <p>Objetivo: <strong>$${meta.CantidadFinal}</strong></p>
      <p>Ahorrado: <strong style="color:#a5d6a7;">$${ahorradoR}</strong></p>
      <p class="faltante">Faltan: <strong>$${faltanteR > 0 ? faltanteR : 0}</strong></p>
      <p class="frase"><em>"${frases[Math.floor(Math.random() * frases.length)]}"</em></p>
    `;

    card.onclick = () => abrirPopupAhorro(meta);
    listaContainer.appendChild(card);
  });
}

// Abrir popup de ahorro
function abrirPopupAhorro(meta) {
  metaSeleccionada = meta;
  document.getElementById('titulo-ahorro').textContent = `Ahorro para: ${meta.Nombre}`;
  document.getElementById('monto-ahorro').value = '';
  document.getElementById('overlay-ahorro').style.display = 'flex';
}

// Confirmar ahorro + SONIDO DE MONEDA
document.getElementById('confirmar-ahorro').onclick = async () => {
  const monto = parseFloat(document.getElementById('monto-ahorro').value);
  if (isNaN(monto) || monto <= 0) {
    alert('Ingresa un monto válido');
    return;
  }

  const nuevoAhorrado = (metaSeleccionada.totalAhorrado || 0) + monto;

  try {
    // Reproducir sonido
    const audio = document.getElementById('sonido-moneda');
    audio.currentTime = 0; // Reiniciar
    audio.play().catch(() => {}); // Evita errores en móviles

    // Guardar en la API
    await fetch(`${API_URL}/${metaSeleccionada.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalAhorrado: nuevoAhorrado })
    });

    metaSeleccionada.totalAhorrado = nuevoAhorrado;
    document.getElementById('overlay-ahorro').style.display = 'none';
    mostrarMetas();

  } catch (error) {
    alert('Error al guardar');
  }
};

// Cancelar ahorro
document.getElementById('cancelar-ahorro').onclick = () => {
  document.getElementById('overlay-ahorro').style.display = 'none';
};

// Botón + → Nueva meta
document.getElementById('btn-agregar').onclick = () => {
  document.getElementById('overlay-nueva').style.display = 'flex';
};

// Cancelar nueva meta
document.getElementById('cancelar-meta').onclick = () => {
  document.getElementById('overlay-nueva').style.display = 'none';
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
    const nueva = await res.json();
    metas.push(nueva);
    document.getElementById('overlay-nueva').style.display = 'none';
    limpiarFormulario();
    mostrarMetas();
  } catch (error) {
    alert('Error al crear meta');
  }
};

function limpiarFormulario() {
  document.getElementById('nueva-nombre').value = '';
  document.getElementById('nueva-cantidad').value = '';
  document.getElementById('nueva-ahorrado').value = '0';
}

// Iniciar
cargarMetas();
