"use strict";

/* Selecccionamos la caja */
const caja = document.querySelector(".caja");

/* Guardar la puntuacion */
let puntuacionActual = 0;

/* Llamar a la velocidad desde el JSON */
let velNiv = modos["niveles"][0]["velocidad"]; // Velocidad del primer nivel por defecto
const resultadoPntalla = document.querySelector(".resultado");

/* Altura por la que multiplicamos para generar los divs que haran los cuadrados dentro de la caja */
const width = 15;

/* Array de invasores eliminados */
const invasoresEliminados = [];

/* Indice de la nave */
let indiceNaveActual = 202;

/* Indice de los invasores */
let invasoresIndice;

/* Variable movimiento a la derecha */
let movDerecho = true;

let direccion = 1;

/* Puntuacion del jugador */
let resultado = 0;

/* Indicador para finalizar el juego */
let juegoFinalizado = false;

/* Llevar el control del disparo */
let disparoActivo = false;

/* Para que desaparezca el boton */
let nivelActualBoton = 0;

/* Sonidos de laser, explosion, game over y victoria */
const laserAudio = document.getElementById("laser");
const explosionAudio = document.getElementById("explosion");
const game_over_audio = document.getElementById("game_over");
const victoria_audio = document.getElementById("victoria");
const laserEnemigoAudio = document.getElementById("laser_enemigo");

/* Boton de volver a jugar */
const volver = document.querySelector(".volver");
const siguiente = document.querySelector(".siguiente");
siguiente.classList.add("siguiente_oculto");

/* Disminuye el volumen de la explosion */
explosionAudio.volume = 0.3;
laserEnemigoAudio.volume = 0.3;

/* Creamos un for para añadir divs dentro de la caja donde estos se moveran */
for (let i = 0; i < width * width; i++) {
    const cuadrado = document.createElement("div");
    cuadrado.id = i;
    caja.appendChild(cuadrado);
}

/* Variable para seleccionar todos los cuadrados que hay dentro de la caja */
const cuadrados = Array.from(document.querySelectorAll(".caja div"));

/* Array de los aliens */
const aliens = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39
]

/* Añadir alien a los cuadrados si no esta dentro del array de eliminados */
function dibujar() {
    for (let i = 0; i < aliens.length; i++) {
        if (!invasoresEliminados.includes(i)) {
            cuadrados[aliens[i]].classList.add("invasor");
        }
    }
}


/* Llamar a la funcion para dibujar los invasores */
dibujar();

/* Añadir inicio de la nave */
cuadrados[indiceNaveActual].classList.add("nave");

/* Funcion para eliminar el id invasores de los cuadrados */
function eliminar() {
    for (let i = 0; i < aliens.length; i++) {
        cuadrados[aliens[i]].classList.remove("invasor");
    }
}

/* Función para verificar si los invasores han alcanzado el fondo del área de juego */

function invasoresAlFinal() {
    for (let i = 0; i < aliens.length; i++) {
        // Si el índice del invasor está dentro del rango de 195 a 204 y aún no ha sido eliminado, finaliza el juego
        if (aliens[i] >= 195 && aliens[i] <= 204 && !invasoresEliminados.includes(i)) {
            return true;
        }
    }
    return false;
}

/* Funcion de movimiento de los invasores */
function moverInvasores() {
    const bordeIzquierdo = aliens[0] % width === 0;
    const bordeDerecho = aliens[aliens.length - 1] % width === width - 1;
    eliminar();

    if (bordeDerecho && movDerecho) {
        for (let i = 0; i < aliens.length; i++) {
            aliens[i] += width + 1;
            direccion = -1;
            movDerecho = false;
        }
    }

    if (bordeIzquierdo && !movDerecho) {
        for (let i = 0; i < aliens.length; i++) {
            aliens[i] += width - 1;
            direccion = 1;
            movDerecho = true;
        }
    }
    for (let i = 0; i < aliens.length; i++) {
        aliens[i] += direccion;
    }

    dibujar();

    /* Disparo aleatorio de los invasores */
    if (Math.random() < 0.45) {
        disparoInvasor();
    }

    /* Detiene el juego y muestra "GAME OVER" si al menos un invasor llega al fondo del área de juego,  un invasor toca la nave  o un invasor llega a la zona donde esta la nave*/
    if (invasoresAlFinal() || cuadrados[indiceNaveActual].classList.contains("invasor")) {
        juegoFinalizado = true;
        clearInterval(invasoresIndice);
        explosionAudio.play();
        game_over_audio.play();

        /* Añadir animacion de explosion de la nave, con un temporizador */
        cuadrados[indiceNaveActual].classList.add("explosion");
        setTimeout(() => cuadrados[indiceNaveActual].classList.remove("explosion"), 300);

        /* Si queremos que el invasor muera al chocar con la nave, desaparecen los dos */
        cuadrados[indiceNaveActual].classList.remove("invasor");
        cuadrados[indiceNaveActual].classList.remove("nave");

        /* Añadimos pantalla de GAME OVER */
        const imagenGameOver = document.getElementById('perdiste');
        imagenGameOver.classList.remove('oculto');
        imagenGameOver.classList.add('derrota');
        volver.classList.remove("volver");
        volver.classList.add("boton");
    }

    /* Si todos los invasores son eliminados, se genera el "HAS GANADO" */
    if (invasoresEliminados.length === aliens.length) {
        resultadoPntalla.innerHTML = "HAS GANADO";
        juegoFinalizado = true;
        clearInterval(invasoresIndice);
        victoria_audio.play();

        siguiente.classList.remove("volver");
        siguiente.classList.add("boton");
        siguiente.classList.remove("siguiente_oculto");

        //Comprobamos si hemos pasado de nivel y si es asi ocultanmos el boton de siguiente nivel
        if (nivelActualBoton === 20) {
            siguiente.classList.add("siguiente_oculto");
        }
        puntuacionActual = resultado;

        /* Añadimos pantalla de victoria */
        const imagenWinner = document.getElementById('ganaste');
        imagenWinner.classList.remove('oculto');
        imagenWinner.classList.add('victoria');
    }
}

/* Intervalo de movimiento de los invasores */
invasoresIndice = setInterval(moverInvasores, velNiv);

/* Funcion para crear el disparo */
function disparo(e) {
    /* Verificar si el juego ha finalizado */
    if (juegoFinalizado || disparoActivo) return;

    let laserId;
    let laserIndiceActual = indiceNaveActual;

    /* Funcion para dar movimiento al disparo */
    function moverDisparo() {
        cuadrados[laserIndiceActual].classList.remove("laser");

        /* Verificar si laserIndiceActual esta dentro de los limites del juego */
        if (laserIndiceActual - width >= 0) {
            laserIndiceActual -= width;
            cuadrados[laserIndiceActual].classList.add("laser");

            /* Hacer que se elimine la clase invasor si coincide con laser y que aparezca la clase explosion */
            if (cuadrados[laserIndiceActual]) {
                if (cuadrados[laserIndiceActual].classList.contains("invasor")) {
                    cuadrados[laserIndiceActual].classList.remove("invasor");
                    cuadrados[laserIndiceActual].classList.remove("laser");
                    cuadrados[laserIndiceActual].classList.add("explosion");

                    /* Añadir un intervalo de aparicion de la explosion */
                    setTimeout(() => cuadrados[laserIndiceActual].classList.remove("explosion"), 300);
                    clearInterval(laserId);
                    explosionAudio.play();

                    const invasorEliminado = aliens.indexOf(laserIndiceActual);
                    invasoresEliminados.push(invasorEliminado);
                    resultado++;
                    resultadoPntalla.innerHTML = 'PUNTUACIÓN: ' + resultado;
                    console.log(invasoresEliminados);
                    /* Reestablece el disparo */
                    disparoActivo = false;
                }
            } else {
                /* Eliminar el intervalo si el disparo sale del área del juego */
                clearInterval(laserId);
                disparoActivo = false;
            }
            /* Else para establecerlo a false de nuevo para disparar cuando no hay colision */
        } else {
            clearInterval(laserId);
            disparoActivo = false;
        }
    }
    /* Si la tecla pulsada es espacio, empieza el intervalo del disparo */
    if (e.key === " ") {
        disparoActivo = true;
        laserId = setInterval(moverDisparo, 50);
        laserAudio.play();
    }
}

/* Función para que los invasores disparen aleatoriamente */
function disparoInvasor() {
    // Elegir un invasor aleatorio que no esté eliminado
    const invasorIndex = Math.floor(Math.random() * aliens.length);
    if (!invasoresEliminados.includes(invasorIndex)) {
        let disparoIndiceActual = aliens[invasorIndex];
        let disparoId;


        function moverDisparo() {
            cuadrados[disparoIndiceActual].classList.remove("laser_enemigo");

            // Verificar si el disparo está dentro de los límites del juego
            if (disparoIndiceActual + width < width * width) {
                disparoIndiceActual += width;
                cuadrados[disparoIndiceActual].classList.add("laser_enemigo");

                // Si el disparo alcanza la nave del jugador
                if (cuadrados[disparoIndiceActual].classList.contains("nave")) {
                    clearInterval(invasoresIndice);
                    juegoFinalizado = true;
                    clearInterval(disparoId);
                    explosionAudio.play();
                    game_over_audio.play();

                    // Mostrar animación de explosión
                    cuadrados[indiceNaveActual].classList.add("explosion");
                    setTimeout(() => cuadrados[indiceNaveActual].classList.remove("explosion"), 300);

                    // Eliminar la nave y mostrar GAME OVER
                    cuadrados[indiceNaveActual].classList.remove("nave");
                    const imagenGameOver = document.getElementById('perdiste');
                    imagenGameOver.classList.remove('oculto');
                    imagenGameOver.classList.add('derrota');
                    volver.classList.remove("volver");
                    volver.classList.add("boton");

                }
            } else {
                // Eliminar el intervalo si el disparo sale del área del juego
                clearInterval(disparoId);
            }
        }

        // Crear un nuevo elemento de audio para el sonido del disparo enemigo
        const nuevoAudio = new Audio(laserEnemigoAudio.src);
        nuevoAudio.play();
        // Iniciar el intervalo de disparo
        disparoId = setInterval(moverDisparo, 100);


    }
}

/* Al presionar la tecla se llama a la funcion disparo */
document.addEventListener("keydown", disparo);

/* Funcion para mover la nave */
function moverNave(e) {

    /* Verificar si el juego a terminado */
    if (juegoFinalizado) return;

    /* Eliminamos la nave del valor actual */
    cuadrados[indiceNaveActual].classList.remove("nave");
    switch (e.key) {
        case "ArrowLeft":
            if (indiceNaveActual % width !== 0) {
                indiceNaveActual -= 1;
            }
            break;
        case "ArrowRight":
            if (indiceNaveActual % width < width - 1) {
                indiceNaveActual += 1;
            }
            break;
    }
    /* Añadimos la nave al nuevo valor */
    cuadrados[indiceNaveActual].classList.add("nave");
}
/* Al presionar la tecla se llama la funcion mover nave */
document.addEventListener("keydown", moverNave);

volver.addEventListener('click', () => {
    location.reload();
});

function siguienteNivel() {
    siguiente.classList.add("siguiente_oculto");
    // Incrementar el nivel
    let nivelActual = modos["niveles"].findIndex(nivel => nivel.velocidad === velNiv);

    //ocultar la imagen de has ganado
    const imagenWinner = document.getElementById('ganaste');
    imagenWinner.classList.add('oculto');

    // Si alcanzas el segundo nivel, oculta el botón de siguiente nivel
    if (nivelActual === 20) {
        siguiente.classList.add('siguiente_oculto');
    }


    nivelActual++; // Incrementamos al siguiente nivel

    nivelActualBoton++; //Incrementamos la varibale global para ocultar el boton

    velNiv = modos["niveles"][nivelActual]["velocidad"];

    /* Reiniciar el juego */
    reiniciarJuego();

    game_over_audio.pause(); // Para pausar la reproducción
    game_over_audio.currentTime = 0; // Para reiniciar el tiempo de reproducción

    victoria_audio.pause(); // Para pausar la reproducción
    victoria_audio.currentTime = 0; // Para reiniciar el tiempo de reproducción
}

function reiniciarJuego() {
    victoria_audio.currentTime = 0; // Reinicia la música al principio
    victoria_audio.pause();

    /* Reiniciar la puntuacion */
    resultado = puntuacionActual;
    resultadoPntalla.innerHTML = "Puntuacion: " + resultado;

    /* Limpiar los invasores eliminados y reiniciar el juego */
    invasoresEliminados.length = 0;
    juegoFinalizado = false;
    disparoActivo = false;

    /* Eliminar los cuadrados de la nave y los invasores */
    cuadrados[indiceNaveActual].classList.remove("nave");
    aliens.forEach(alien => {
        cuadrados[alien].classList.remove("invasor");
    });

    // Reiniciar la posición de la nave
    indiceNaveActual = 202;


    // Reiniciar la posición de los invasores a las posiciones originales
    aliens.splice(0, aliens.length); // Vaciar el arreglo
    for (let i = 0; i < 9; i++) { // Colocar 9 invasores en las tres primeras filas
        aliens.push(i);
        aliens.push(i + width);
        aliens.push(i + width * 2);
    }


    cuadrados[indiceNaveActual].classList.add("nave");

    /* Reiniciar el intervalo de movimiento de los invasores */
    clearInterval(invasoresIndice);
    invasoresIndice = setInterval(moverInvasores, velNiv);

    for (let i = 0; i < aliens.length; i++) {
        // Si el índice del invasor está dentro del rango de 195 a 204 y aún no ha sido eliminado, finaliza el juego
        if (aliens[i] >= 195 && aliens[i] <= 204 && !invasoresEliminados.includes(i)) {
            return true;
        }
    }
 //recolectar loa datos del jugador
 const nombreJugador= document.getElementById("nombre").value;
    const jugador = {
        nombre: nombreJugador,
        puntuacion: resultado,
        nivel: nivelActualBoton
    };

    // Enviar los datos del jugador al servidor usando AJAX
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "guardar_puntuacion.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Datos del jugador guardados exitosamente.");
        }
    };
    xhr.send(JSON.stringify(jugador));
}
siguiente.addEventListener('click', siguienteNivel);