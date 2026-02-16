const todasLasFotos = Array.from(document.querySelectorAll(".menu-photo"));
const menu = document.querySelector(".menu-container");

/* CONFIGURACIÓN DE LAS IMÁGENES */
let FOTO_SIZE = Math.min(window.innerWidth * 0.13, 500); // 15% ancho ventana, máximo 160px
const DISTANCIA_MIN = FOTO_SIZE + 50; // Evitar solapamiento
const FOTOS_VISIBLES = 6;
const INTERVALO = 3000;
const TRANSICION = 1000;
const TIEMPO_MIN_VISIBLE = 6000;


/* ESTADO DE LAS IMÁGENES */
let visibles = [];
let ocultas = [];

// Actualizar FOTO_SIZE al redimensionar
window.addEventListener("resize", () => {
    FOTO_SIZE = Math.min(window.innerWidth * 0.15, 160);
});

function getMenuRect() {
    return menu.getBoundingClientRect();
}

function solapaMenu(x, y, menuRect) {
    return !(
        x + FOTO_SIZE < menuRect.left ||
        x > menuRect.right ||
        y + FOTO_SIZE < menuRect.top ||
        y > menuRect.bottom
    );
}

function distanciaValida(x, y, posiciones) {
    return posiciones.every(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) >= DISTANCIA_MIN;
    });
}

function generarPosicion(posiciones, menuRect) {
    const margen = 20;
    let intentos = 0;

    while (intentos < 150) {
        const x = Math.random() * (window.innerWidth - FOTO_SIZE - margen * 2) + margen;
        const y = Math.random() * (window.innerHeight - FOTO_SIZE - margen * 2) + margen;

        if (!solapaMenu(x, y, menuRect) && distanciaValida(x, y, posiciones)) {
            return { x, y };
        }
        intentos++;
    }
    return null;
}

/* INICIALIZAR FOTOS */
function iniciar() {
    const menuRect = getMenuRect();
    const posiciones = [];

    visibles = [...todasLasFotos]
        .sort(() => Math.random() - 0.5)
        .slice(0, FOTOS_VISIBLES);

    ocultas = todasLasFotos.filter(f => !visibles.includes(f));

    visibles.forEach(foto => {
        const pos = generarPosicion(posiciones, menuRect);
        if (!pos) return;

        posiciones.push(pos);
        foto.dataset.x = pos.x;
        foto.dataset.y = pos.y;
        foto.dataset.visibleDesde = Date.now();

        foto.style.width = FOTO_SIZE + "px";
        foto.style.height = FOTO_SIZE + "px";
        foto.style.left = `${pos.x}px`;
        foto.style.top = `${pos.y}px`;
        foto.style.opacity = 1;
    });
}

/* ROTAR FOTOS */
function rotarImagen() {
    const ahora = Date.now();
    const candidatas = visibles.filter(f => ahora - Number(f.dataset.visibleDesde) > TIEMPO_MIN_VISIBLE);

    if (candidatas.length === 0 || ocultas.length === 0) return;

    const fotoSalir = candidatas[Math.floor(Math.random() * candidatas.length)];
    fotoSalir.style.opacity = 0;

    setTimeout(() => {
        visibles = visibles.filter(f => f !== fotoSalir);
        ocultas.push(fotoSalir);

        const fotoEntrar = ocultas.splice(Math.floor(Math.random() * ocultas.length), 1)[0];

        const menuRect = getMenuRect();
        const posiciones = visibles.map(f => ({ x: +f.dataset.x, y: +f.dataset.y }));

        const pos = generarPosicion(posiciones, menuRect);
        if (!pos) return;

        fotoEntrar.dataset.x = pos.x;
        fotoEntrar.dataset.y = pos.y;
        fotoEntrar.dataset.visibleDesde = Date.now();

        fotoEntrar.style.width = FOTO_SIZE + "px";
        fotoEntrar.style.height = FOTO_SIZE + "px";
        fotoEntrar.style.left = `${pos.x}px`;
        fotoEntrar.style.top = `${pos.y}px`;
        fotoEntrar.style.opacity = 1;

        visibles.push(fotoEntrar);
    }, TRANSICION);
}

/* EJECUCIÓN */
iniciar();
setInterval(rotarImagen, INTERVALO);
