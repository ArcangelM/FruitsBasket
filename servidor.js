var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var usuario = 0;
var tiempo = 0;
var tiempito = 0;
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    usuario += 1;
    console.log('a user connected');
    // Crea un nuevo jugador y lo agrega a nuestro objeto de jugadores.
    players[socket.id] = {
        x: Math.floor(Math.random() * 900),
        y: 450,
        playerId: socket.id,
        playerPuntos:0,
        tipoCanasta: usuario % 4 //se quita el %4 para cuando ya este fija la partida de 4 jugadores.
    };
    
    socket.emit('currentPlayers', players); // Envía el objeto de jugadores al nuevo jugador.
    
    socket.broadcast.emit('newPlayer', players[socket.id]); // Actualiza a todos los jugadores el nuevo jugador.

    socket.on('disconnect', function () {
        console.log('user disconnected');
        
        delete players[socket.id];  // Remueve al jugador del objeto jugadores.
        io.emit('disconnect', socket.id);   // Envía un mensaje a todos los jugadores para remover a éste jugador.
    });

    // Cuando un jugador se mueve, actualiza a información del jugador.
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        
        // Emite un mensaje a todos los jugadores sobre el movimiento del jugador.
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    if(tiempo == 0 && usuario == 2){
        var myInt = setInterval(function () {
            io.emit('timed',tiempo += 1);
        }, 1000);
    };

    if(tiempito == 0 && usuario == 2){
        var myGeneradorDeFruta = setInterval(function () {
            io.emit('generadorFrutal', Math.floor(Math.random() * 4));
        }, 100);
        tiempito += 1;
    };
});

// Dejamos al servidor escuchando.
server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});