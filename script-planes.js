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



// PLANES 
const planes = window.PLANES.actividades;

// VARIABLES GLOBALES
const form = document.getElementById("planForm");
const resultado = document.getElementById("resultado");
let planElegido = null;
let ultimoPlan = null; // Para no repetir



// FUNCION DE EMOJIS
function lanzarEmojis(emojis, cantidad = 10) {
    for (let i = 0; i < cantidad; i++) {
        const emoji = document.createElement("div");
        emoji.classList.add("floating-emoji");
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Posición inicial aleatoria
        emoji.style.left = Math.random() * window.innerWidth + "px";
        emoji.style.bottom = Math.random() * 50 + "px"; 

        // Escala y tamaño aleatorio
        const scale = 1 + Math.random();
        emoji.style.fontSize = `${24 + Math.random() * 24}px`;
        emoji.style.setProperty("--scale", scale);

        // Movimiento horizontal y rotación aleatoria
        const deltaX = (Math.random() * 400 - 200);
        const rotate = (Math.random() * 360 - 180);
        emoji.style.setProperty("--x", deltaX + "px");
        emoji.style.setProperty("--rotate", rotate + "deg");

        // Duración y altura aleatoria
        const duracion = 2000 + Math.random() * 1500; // 2s a 3.5s
        const altura = 400 + Math.random() * 400; // suben 400px a 800px
        emoji.style.animation = `floatUp ${duracion}ms ease-out forwards`;
        emoji.style.setProperty("--altura", altura + "px");

        document.body.appendChild(emoji);

        // Quitar después de la animación
        setTimeout(() => emoji.remove(), duracion);
    }
}


// FUNCION PARA MOSTRAR PLAN
function mostrarPlan(plan) {
    const extra = generarExtra(plan); // PASAMOS EL PLAN

    resultado.innerHTML = `
        <div class="plan">
            <h2>${plan.nombre}</h2>
            <p><strong>Lugar:</strong> ${plan.lugar}</p>
            <p><strong>Duración:</strong> ${plan.duracion} h</p>
            <p><strong>Presupuesto:</strong> ${plan.presupuesto} €</p>
            ${extra ? `<p style="color:#d4a373;"><strong>✨ EXTRA:</strong> ${extra}</p>` : ""}
            <button id="aceptarPlan">Acepto ❤️</button>
        </div>
    `;

    lanzarEmojis(["✨"], 25);

    document.getElementById("aceptarPlan").addEventListener("click", enviarEmail);
}



// FORMULARIO
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tiempo = document.getElementById("tiempo").value;
    const lugar = document.getElementById("lugar").value;
    const actividad = document.getElementById("actividad").value;
    const presupuesto = parseInt(presupuestoSlider.value);
    const duracion = parseInt(duracionSlider.value);
    
    // Filtrar candidatos
    let candidatos = planes.filter(p =>
        p.lugar === lugar &&
        p.presupuesto <= presupuesto
    );

    if (candidatos.length === 0) {
    resultado.innerHTML = "<p>No hay planes con esos filtros 😢</p>";
    return;
}


    // Calcular puntuaciones
    candidatos.forEach(p => {
        p.puntuacion = 0;
        if (p.tiempos.includes(tiempo) || p.tiempos.includes("cualquiera")) p.puntuacion += 3;
        if (Math.abs(p.duracion - duracion) <= 1) p.puntuacion += 2;
        if (p.actividad === actividad) p.puntuacion += 1;
    });

    // Buscar puntuación máxima
    const maxPuntuacion = Math.max(...candidatos.map(p => p.puntuacion));

    // Filtrar solo los mejores
    let mejoresCandidatos = candidatos.filter(p => p.puntuacion === maxPuntuacion);

    // Elegir uno diferente al anterior
    let nuevoPlan;
    if (mejoresCandidatos.length === 1) {
        nuevoPlan = mejoresCandidatos[0];
    } else {
        do {
            nuevoPlan = mejoresCandidatos[Math.floor(Math.random() * mejoresCandidatos.length)];
        } while (ultimoPlan && nuevoPlan.nombre === ultimoPlan.nombre && mejoresCandidatos.length > 1);
    }

    planElegido = nuevoPlan;
    ultimoPlan = planElegido;

    // Mostrar el plan
    mostrarPlan(planElegido);

    // Lanzar emojis al generar
    lanzarEmojis(["✨"], 25);
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

// Generar EXTRA
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
