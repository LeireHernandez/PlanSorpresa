// VARIABLES GLOBALES
const form = document.getElementById("planForm");
const resultado = document.getElementById("resultado");

let planElegido = null;
let ultimoPlan = null;


// SLIDER
const duracionSlider = document.getElementById("duracion");
const duracionValor = document.getElementById("duracionValor");

duracionSlider.addEventListener("input", () => {
    duracionValor.textContent = duracionSlider.value;
});


// JUEGOS
const juegos = window.PLANES.juegos;


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


// MOSTRAR JUEGO
function mostrarPlan(plan) {
    resultado.innerHTML = `
        <div class="plan">
            <h2>${plan.nombre}</h2>
            <p><strong>Lugar:</strong> ${plan.lugar}</p>
            <p><strong>Duración:</strong> ${plan.duracion} h</p>
        </div>
    `;

    lanzarEmojis(["🎮","🎲","🃏"], 20);
}


// FORMULARIO
form.addEventListener("submit", e => {
    e.preventDefault();

    const lugar = document.getElementById("lugar").value;
    const actividad = document.getElementById("actividad").value;
    const duracion = parseInt(duracionSlider.value);

    let candidatos = juegos.filter(j =>
        j.lugar === lugar &&
        j.actividad === actividad
    );

    if (candidatos.length === 0) {
        resultado.innerHTML = "<p>No hay juegos para esos filtros 😢</p>";
        return;
    }

    candidatos.sort((a, b) =>
        Math.abs(a.duracion - duracion) - Math.abs(b.duracion - duracion)
    );

    let nuevoPlan = candidatos[0];

    if (ultimoPlan && candidatos.length > 1) {
        nuevoPlan = candidatos.find(j => j.nombre !== ultimoPlan.nombre) || candidatos[0];
    }

    planElegido = nuevoPlan;
    ultimoPlan = nuevoPlan;

    mostrarPlan(planElegido);
});

// EMAIL
function enviarEmail() {
    const templateParams = {
        plan: planElegido.nombre,
        lugar: planElegido.lugar,
        duracion: planElegido.duracion,
        presupuesto: planElegido.presupuesto
    };

    emailjs.send(
        "service_95hc5y4",
        "template_l7jcfeh",
        templateParams
    ).then((response) => {
        console.log("Correo enviado:", response.status, response.text);
        alert("Correo enviado correctamente! ❤️");
        lanzarEmojis(["❤️"], 20);
    }).catch((error) => {
        console.error("Error al enviar el correo:", error);
        alert("Error al enviar correo: " + JSON.stringify(error));
    });
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

// Ejecutar al cargar y al cambiar tamaño
window.addEventListener("load", actualizarFotosResponsive);
window.addEventListener("resize", actualizarFotosResponsive);