// ELEMENTOS DOM
const form = document.getElementById("planForm");
const resultado = document.getElementById("resultado");
const planesGuardadosDiv = document.getElementById("planesGuardados");
const slider = document.getElementById("presupuesto");
const sliderValue = document.getElementById("sliderValue");
const aceptarDiaBtnDiv = document.getElementById("aceptarDiaBtn");


// Mostrar valor del slider en tiempo real
slider.addEventListener("input", () => {
    sliderValue.textContent = slider.value;
});

// ESTADO DEL DÍA
let planesDia = [];
let ultimoPlanPorFranja = {};
const ordenDia = ["mañana", "comida", "tarde", "cena"];

// PLANES
const planes = [
    ...window.PLANES.actividades,
    ...window.PLANES.comidas,
    ...window.PLANES.juegos
];

// EMOJIS
function lanzarEmojis(emojis, cantidad = 15) {
    for (let i = 0; i < cantidad; i++) {
        const emoji = document.createElement("div");
        emoji.className = "floating-emoji";
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        emoji.style.left = Math.random() * window.innerWidth + "px";
        emoji.style.fontSize = 24 + Math.random() * 20 + "px";
        emoji.style.setProperty("--x", `${Math.random() * 300 - 150}px`);
        emoji.style.setProperty("--rotate", `${Math.random() * 360}deg`);
        emoji.style.setProperty("--scale", 1 + Math.random());

        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 3000);
    }
}


// FILTRAR PLANES POR FRANJA, TIPO, PRESUPUESTO Y LUGAR
function filtrarPlanes(planes, franja, presupuestoMax, lugar) {
    const tiposPermitidos = franja === "comida" || franja === "cena"
        ? ["comida"]
        : ["plan", "juego"];

    return planes.filter(p => {
        const franjasPlan = Array.isArray(p.franja) ? p.franja : [p.franja];
        const yaAceptado = planesDia.some(pd => pd.nombre === p.nombre);

        return (
            p.tipo &&
            franjasPlan.includes(franja) &&
            tiposPermitidos.includes(p.tipo) &&
            (p.presupuesto === undefined || p.presupuesto <= presupuestoMax) &&
            (!lugar || p.lugar.toLowerCase() === lugar.toLowerCase()) &&
            !yaAceptado
        );
    });
}

// ELEGIR PLAN ALEATORIO
function elegirPlan(candidatos) {
    if (candidatos.length === 1) return candidatos[0];
    return candidatos[Math.floor(Math.random() * candidatos.length)];
}

// MOSTRAR PLAN
function mostrarPlan(plan, franja) {

    // PASAMOS el plan a generarExtra
    const extra = generarExtra(plan);

    resultado.innerHTML = `
        <div class="plan">
            <h2>${plan.nombre}</h2>
            <p><strong>Franja:</strong> ${franja}</p>
            <p><strong>Lugar:</strong> ${plan.lugar || "-"}</p>
            <p><strong>Duración:</strong> ${plan.duracion} h</p>
            ${plan.presupuesto !== undefined
                ? `<p><strong>Presupuesto:</strong> ${plan.presupuesto} €</p>`
                : ""
            }
            ${extra ? `<p style="color:#d4a373;"><strong>✨ EXTRA:</strong> ${extra}</p>` : ""}
            <button id="guardarPlan">Guardar</button>
        </div>
    `;

    document.getElementById("guardarPlan").addEventListener("click", () => {
        // Guardamos el plan junto con el extra
        guardarPlan({ ...plan, extra }, franja);
        lanzarEmojis(["😉"], 20);
    });
}



function mostrarPlanesGuardados() {
    planesGuardadosDiv.innerHTML = `
        <h3>📅 Tu plan del día</h3>
        ${ordenDia.map(franja => {
            const planesFranja = planesDia.filter(p => p.franja === franja);
            if (planesFranja.length === 0) return "";
            return `<div>
                        <strong>${franja.toUpperCase()}:</strong><br>
                        ${planesFranja.map(p => `${p.nombre}${p.extra ? " ✨ " + p.extra : ""}`).join("<br>")}
                    </div>`;
        }).join("")}
    `;

    // Mostrar botón si hay al menos un plan guardado
    if (planesDia.length > 0) {
        aceptarDiaBtnDiv.innerHTML = `<button id="aceptarDia">Aceptar plan del día ❤️</button>`;

        document.getElementById("aceptarDia").onclick = enviarEmail;
    } else {
        aceptarDiaBtnDiv.innerHTML = "";
    }
}



function actualizarFotosResponsive() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Configura posiciones como % de ventana
    const posiciones = {
        left1: { top: 0.03 * windowHeight, left: 0.02 * windowWidth, rotate: -10 },
        left2: { top: 0.28 * windowHeight, left: 0.18 * windowWidth, rotate: 8 },
        left3: { top: 0.62 * windowHeight, left: 0.05 * windowWidth, rotate: -5 },
        right1: { top: 0.04 * windowHeight, right: 0.02 * windowWidth, rotate: 12 },
        right2: { top: 0.28 * windowHeight, right: 0.18 * windowWidth, rotate: -8 },
        right3: { top: 0.65 * windowHeight, right: 0.08 * windowWidth, rotate: 6 },
    };

    Object.keys(posiciones).forEach(cls => {
        const foto = document.querySelector(`.${cls}`);
        if (!foto) return;

        const pos = posiciones[cls];
        foto.style.top = pos.top + "px";
        if (pos.left !== undefined) foto.style.left = pos.left + "px";
        if (pos.right !== undefined) foto.style.right = pos.right + "px";

        foto.style.setProperty("--rotate", `${Math.random() * 40 - 20}deg`);

    });
}

// Función para enviar email con todos los planes guardados
function enviarEmail() {
    if (planesDia.length === 0) return;

    const resumen = planesDia.map(p => 
        `${p.franja.toUpperCase()}: ${p.nombre} (${p.lugar || "-"}) - ${p.duracion}h - ${p.presupuesto !== undefined ? p.presupuesto + "€" : ""}`
    ).join("\n");

    const templateParams = {
        resumen: resumen
    };

    emailjs.send(
        "service_95hc5y4",   // tu Service ID
        "template_s0lqqde",  // tu Template ID
        templateParams
    ).then(response => {
        lanzarEmojis(["❤️"], 20);
        alert("Correo enviado correctamente! ❤️");

        console.log("Correo enviado:", response.status, response.text);
    }).catch(error => {
        console.error("Error al enviar correo:", error);
        alert("Error al enviar correo: " + JSON.stringify(error));
    });
}





// GUARDAR PLAN
function guardarPlan(plan, franja) {
    // Eliminamos plan previo de la misma franja
    //planesDia = planesDia.filter(p => p.franja !== franja);

    // Guardamos plan con extra incluido
    planesDia.push({ ...plan, franja });
    ultimoPlanPorFranja[franja] = plan;

    mostrarPlanesGuardados();
    resultado.innerHTML = "";
}


// GENERAR PLAN
function generarPlan(franja) {
    const presupuestoMax = parseInt(slider.value) || 100;
    const lugar = document.getElementById("lugar").value;

    const candidatos = filtrarPlanes(planes, franja, presupuestoMax, lugar);

    if (candidatos.length === 0) {
        resultado.innerHTML = `<p>No hay planes para ${franja} con ese presupuesto/lugar 😢</p>`;
        return;
    }

    const plan = elegirPlan(candidatos);
    mostrarPlan(plan, franja);
}

// FORMULARIO
form.addEventListener("submit", e => {
    e.preventDefault();
    const franja = document.getElementById("franja").value;
    generarPlan(franja);
});


// Generar Extra
function generarExtra(plan) {
    const probabilidad = 0.05; 

    if (Math.random() < probabilidad && plan && plan.entorno) {
        const extras = window.EXTRAS[plan.entorno]; 
        if (extras && extras.length > 0) {
            const extraAleatorio = extras[Math.floor(Math.random() * extras.length)];
            return extraAleatorio;
        }
    }

    return null;
}


// Ejecutar al cargar y al cambiar tamaño
window.addEventListener("load", actualizarFotosResponsive);
window.addEventListener("resize", actualizarFotosResponsive);


