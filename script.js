
// ELEMENTOS DEL HTML
const masa = document.getElementById("masa");
const altura = document.getElementById("altura");
const gravedad = document.getElementById("gravedad");
const friccion = document.getElementById("friccion");

const pelota = document.getElementById("pelota");
const escenario = document.querySelector(".escenario");

const tiempoTexto = document.getElementById("tiempo");
const alturaTexto = document.getElementById("alturaActual");
const velocidadTexto = document.getElementById("velocidad");
const aceleracionTexto = document.getElementById("aceleracion");

const epTexto = document.getElementById("ep");
const ecTexto = document.getElementById("ec");
const emTexto = document.getElementById("em");

const tabla = document.getElementById("tabla");
const grafica = document.getElementById("grafica");
const ctx = grafica.getContext("2d");

const iniciar = document.getElementById("iniciar");
const pausar = document.getElementById("pausar");
const reiniciar = document.getElementById("reiniciar");

const tiempoFinal = document.getElementById("tiempoFinal");
const velocidadFinal = document.getElementById("velocidadFinal");
const distancia = document.getElementById("distancia");
const conclusion = document.getElementById("conclusion");

// VARIABLES DE LA SIMULACIÓN
let t = 0;
let h = 20;
let v = 0;
let a = 9.8;

let m = 2;
let g = 9.8;
let resistencia = 0;

let intervalo = null;
let activo = false;
let siguienteRegistro = 1;

let datosGrafica = [];

// ACTUALIZAR LOS DATOS EN PANTALLA
function actualizar() {
    const potencial = m * g * h;
    const cinetica = 0.5 * m * v * v;
    const mecanica = potencial + cinetica;

    tiempoTexto.textContent = t.toFixed(2) + " s";
    alturaTexto.textContent = h.toFixed(2) + " m";
    velocidadTexto.textContent = v.toFixed(2) + " m/s";
    aceleracionTexto.textContent = a.toFixed(2) + " m/s²";

    epTexto.textContent = potencial.toFixed(2) + " J";
    ecTexto.textContent = cinetica.toFixed(2) + " J";
    emTexto.textContent = mecanica.toFixed(2) + " J";

    // MOVER LA PELOTA
    const espacio = escenario.clientHeight - 52;
    const posicion = ((alturaInicial - h) / alturaInicial) * espacio;

    pelota.style.top = (10 + posicion) + "px";
    
    return { potencial, cinetica, mecanica };
}

// REGISTRAR LOS RESULTADOS
function registrar(datos) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${t.toFixed(2)}</td>
        <td>${h.toFixed(2)}</td>
        <td>${v.toFixed(2)}</td>
        <td>${datos.potencial.toFixed(2)}</td>
        <td>${datos.cinetica.toFixed(2)}</td>
        <td>${datos.mecanica.toFixed(2)}</td>
    `;

    tabla.appendChild(fila);

    datosGrafica.push({
        tiempo: t,
        ep: datos.potencial,
        ec: datos.cinetica,
        em: datos.mecanica
    });

    dibujarGrafica();
}

// DIBUJAR LAS GRÁFICAS
function dibujarGrafica() {
    const ancho = grafica.width;
    const alto = grafica.height;

    ctx.clearRect(0, 0, ancho, alto);

    const maxEnergia = Math.max(
        1,
        ...datosGrafica.map(d => Math.max(d.ep, d.ec, d.em))
    );

    const maxTiempo = Math.max(
        1,
        datosGrafica[datosGrafica.length - 1].tiempo
    );

    // EJES
    ctx.strokeStyle = "#718096";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 15);
    ctx.lineTo(50, alto - 35);
    ctx.lineTo(ancho - 15, alto - 35);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.fillText("Energía (J)", 10, 15);
    ctx.fillText("Tiempo (s)", ancho - 80, alto - 10);

    // DIBUJAR CADA ENERGÍA
    function linea(tipo, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        datosGrafica.forEach((d, i) => {
            const x = 50 + (d.tiempo / maxTiempo) * (ancho - 75);
            const y = alto - 35 - (d[tipo] / maxEnergia) * (alto - 60);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    linea("ep", "#42a5ff");
    linea("ec", "#36c77b");
    linea("em", "#ffad42");

    // LEYENDA
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = "#42a5ff";
    ctx.fillText("Potencial", 80, 25);

    ctx.fillStyle = "#36c77b";
    ctx.fillText("Cinética", 190, 25);

    ctx.fillStyle = "#ffad42";
    ctx.fillText("Mecánica", 290, 25);
}

// INICIAR LA SIMULACIÓN
let alturaInicial = 20;

function comenzar() {
    if (activo) return;

    if (t === 0) {
        m = Number(masa.value);
        alturaInicial = Number(altura.value);
        g = Number(gravedad.value);
        resistencia = Number(friccion.value);

        if (
            !Number.isFinite(m) || m <= 0 ||
            !Number.isFinite(alturaInicial) || alturaInicial <= 0 ||
            !Number.isFinite(g) || g <= 0 ||
            !Number.isFinite(resistencia) ||
            resistencia < 0 || resistencia > 100
        ) {
            alert("Por favor, introduce valores válidos.");
            return;
        }

        h = alturaInicial;
        v = 0;
        a = g;

        tabla.innerHTML = "";
        datosGrafica = [];
        t = 0;
        siguienteRegistro = 1;

        registrar(actualizar());

        tiempoFinal.textContent = "--";
        velocidadFinal.textContent = "--";
        distancia.textContent = "--";
        conclusion.textContent = "Simulación en curso...";
    }

    activo = true;
    iniciar.textContent = "Continuar";

    intervalo = setInterval(() => {
        const dt = 0.05;

        // Resistencia del aire proporcional a la velocidad
        const k = resistencia / 100 * 1.5;

        a = Math.max(0, g - k * v);

        v += a * dt;
        h -= v * dt;
        t += dt;

        if (h <= 0) {
            h = 0;
        }

        const datos = actualizar();

        if (t >= siguienteRegistro || h === 0) {
            registrar(datos);
            siguienteRegistro = Math.floor(t) + 1;
        }

        if (h === 0) {
            finalizar();
        }

    }, 50);
}

// PAUSAR
function detener() {
    clearInterval(intervalo);
    activo = false;
}

// FINALIZAR
function finalizar() {
    detener();

    tiempoFinal.textContent = t.toFixed(2) + " s";
    velocidadFinal.textContent = v.toFixed(2) + " m/s";
    distancia.textContent = alturaInicial.toFixed(2) + " m";

    if (resistencia === 0) {
        conclusion.textContent =
            "La energía mecánica se conserva durante la caída.";
    } else {
        conclusion.textContent =
            "La resistencia del aire reduce la energía mecánica.";
    }

    iniciar.textContent = "Iniciar";
}

// REINICIAR
function resetear() {
    detener();

    t = 0;
    h = Number(altura.value) || 20;
    alturaInicial = h;
    v = 0;
    g = Number(gravedad.value) || 9.8;
    a = g;

    iniciar.textContent = "Iniciar";

    tabla.innerHTML = "";
    datosGrafica = [];

    tiempoFinal.textContent = "--";
    velocidadFinal.textContent = "--";
    distancia.textContent = "--";
    conclusion.textContent = "Esperando simulación...";

    actualizar();
    dibujarGrafica();
}

// BOTONES
iniciar.addEventListener("click", comenzar);
pausar.addEventListener("click", detener);
reiniciar.addEventListener("click", resetear);

// ESTADO INICIAL
resetear();
