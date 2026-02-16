// VARIABLES GLOBALES
const form = document.getElementById("planForm");
const resultado = document.getElementById("resultado");

let planElegido = null;
let ultimoPlan = null;



// SLIDERS
const presupuestoSlider = document.getElementById("presupuesto");
const presupuestoValor = document.getElementById("presupuestoValor");

presupuestoSlider.addEventListener("input", () => {
    presupuestoValor.textContent = presupuestoSlider.value;
});

const duracionSlider = document.getElementById("duracion");
const duracionValor = document.getElementById("duracionValor");

duracionSlider.addEventListener("input", () => {
    duracionValor.textContent = duracionSlider.value;
});



// PLANES DE COMIDA
const planes = window.PLANES.comidas;


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



// MOSTRAR PLAN
function mostrarPlan(plan) {
    resultado.innerHTML = `
        <div class="plan">
            <h2>${plan.nombre}</h2>
            <p><strong>Lugar:</strong> ${plan.lugar}</p>
            <p><strong>Duración:</strong> ${plan.duracion} h</p>
            <p><strong>Presupuesto:</strong> ${plan.presupuesto} €</p>
            <button id="aceptarPlan">Acepto ❤️</button>
        </div>
    `;

    lanzarEmojis(["🍕","🍣","🍔"], 20);
}



// FORMULARIO
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const lugar = document.getElementById("lugar").value;
    const presupuesto = parseInt(presupuestoSlider.value);
    const duracion = parseInt(duracionSlider.value);

    let candidatos = planes.filter(p =>
        p.lugar === lugar &&
        p.presupuesto <= presupuesto
    );

    if (candidatos.length === 0) {
        resultado.innerHTML = "<p>No hay planes de comida con esos filtros 😢</p>";
        return;
    }

    candidatos.forEach(p => {
        p.puntuacion = Math.abs(p.duracion - duracion);
    });

    candidatos.sort((a, b) => a.puntuacion - b.puntuacion);

    let nuevoPlan = candidatos[0];

    if (ultimoPlan && candidatos.length > 1) {
        nuevoPlan = candidatos.find(p => p.nombre !== ultimoPlan.nombre) || candidatos[0];
    }

    planElegido = nuevoPlan;
    ultimoPlan = nuevoPlan;

    mostrarPlan(planElegido);
});

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

// Ejecutar al cargar y al cambiar tamaño
window.addEventListener("load", actualizarFotosResponsive);
window.addEventListener("resize", actualizarFotosResponsive);