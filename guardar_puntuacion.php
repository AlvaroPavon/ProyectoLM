<?php
// Recibir los datos del jugador enviados por AJAX
$data = json_decode(file_get_contents('php://input'), true);

// Guardar los datos en un archivo de texto
$archivo = 'datos_jugadores.txt';
file_put_contents($archivo, "Nombre: " . $data['nombre'] . ", Puntuación: " . $data['puntuacion'] . ", Nivel: " . $data['nivel'] . PHP_EOL, FILE_APPEND);

// Responder a la solicitud AJAX
http_response_code(200);
?>
