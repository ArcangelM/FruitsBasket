var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1201,
    height: 661,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    } 
};

var puntos = 0;
var puntosText;
var miCanasta;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('fondo', './assets/fondo.png');
    //this.load.image('canasta', './assets/canasta.png');
    this.load.image('manzana', './assets/manzana.png');
    this.load.image('patilla', './assets/patilla.png');
    this.load.image('ciruela', './assets/ciruela.png');
    this.load.image('naranja', './assets/naranja.png');
    this.load.spritesheet('canasta', './assets/caminante1.png', { frameWidth: 158, frameHeight: 276 });
    this.load.spritesheet('canastamanz', './assets/manzanasok.png', { frameWidth: 158, frameHeight: 276 });
    this.load.spritesheet('canastasandi', './assets/sandiasok.png', { frameWidth: 158, frameHeight: 276 });
    this.load.spritesheet('canastauvas', './assets/uvasok.png', { frameWidth: 158, frameHeight: 268 });
}

function create() {

    this.add.image(600, 330, 'fondo');
    
    //this.cami = this.add.sprite(127, 400, 'canasta');
    /* this.anims.create({
        key:"cami_anim",
        frames:this.anims.generateFrameNumbers("canasta"),
        frameRate:8,
        repeat:-1
    }); */

    //this.cami.play("cami_anim");
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
//pendiente de miarar donde se genera la canasta
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayer(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayer(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
        }
        });
    });

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setPosition(playerInfo.x,playerInfo.y);
                //otherPlayer.play("cami_anim");
            }
        });
    });

    this.socket.on('generadorFrutal',function (fruta){
        creaFruta(self, fruta);
    });

    this.socket.on('timed',function(tiempo) {
        aumentaTiempo(tiempo);
    });
    
    this.cursors = this.input.keyboard.createCursorKeys();

    texto = this.add.text(20, 20, 'Tiempo: ' + formatoTiempo(0)); // Se crea el objeto text para mostrar el tiempo en pantalla.
    puntosText = this.add.text(800, 20, 'Puntuación: 0');  //Se crea el objeto puntosText para mostrar la puntuación en pantalla.
}

function update() {

    if (this.canasta) {
        // Emite el movimiento del canasta
        var x = this.canasta.x;
        var y = this.canasta.x;
        if (this.canasta.oldPosition && (x !== this.canasta.oldPosition.x || y !== this.canasta.oldPosition.y )) {
            this.socket.emit('playerMovement', {x: this.canasta.x, y: this.canasta.y});
            this.nombre.x = x - 20;
        }
    
        // Guarda los datos de la antigua posición del canasta.
        this.canasta.oldPosition = {
            x: this.canasta.x
        };
        if (this.cursors.left.isDown) {
            //this.canasta.play("cami_anim");
            this.canasta.flipX=true;
            this.canasta.setVelocityX(-250);
            
        } else if (this.cursors.right.isDown) {
            //this.canasta.play("cami_anim");
            this.canasta.setVelocityX(250);
            this.canasta.flipX=false;
            
        } else {
            this.canasta.setVelocityX(0);
        }
    }
}

//Función que maneja las particularidades iniciales de cada canasta que se crea.
function addPlayer(self, playerInfo) {
    

    if (playerInfo.tipoCanasta == 0) {
        self.canasta = self.physics.add.sprite(playerInfo.x,playerInfo.y, 'canastamanz');
        self.nombre = self.add.text(playerInfo.x - 20, playerInfo.y + 35, 'Manzana', {color: '#000'});
       // self.canasta.setTint(0xff0000);

       self.anims.create({
        key:"cami_anim",
        frames:self.anims.generateFrameNumbers("canastamanz"),
        frameRate:8,
        repeat:-1
    });
    self.canasta.play("cami_anim")
    }else if(playerInfo.tipoCanasta == 1 ){
        self.canasta = self.physics.add.sprite(playerInfo.x,playerInfo.y, 'canastasandi');
        self.nombre = self.add.text(playerInfo.x - 20, playerInfo.y + 35, 'Sandía', {color: '#000'});
       //self.canasta.setTint(0x006600);
       self.anims.create({
        key:"cami_anim",
        frames:self.anims.generateFrameNumbers("canastasandi"),
        frameRate:8,
        repeat:-1
    });
    self.canasta.play("cami_anim")
    }else if(playerInfo.tipoCanasta == 2 ){
        self.canasta = self.physics.add.sprite(playerInfo.x,playerInfo.y, 'canastauvas');
       self.nombre = self.add.text(playerInfo.x - 20, playerInfo.y + 35, 'Ciruela', {color: '#000'});
        
       self.anims.create({
        key:"cami_anim",
        frames:self.anims.generateFrameNumbers("canastauvas"),
        frameRate:8,
        repeat:-1
    });
    self.canasta.play("cami_anim")

    }else{
        self.canasta = self.physics.add.sprite(playerInfo.x,playerInfo.y, 'canasta');
        self.nombre = self.add.text(playerInfo.x - 25, playerInfo.y + 35, 'Naranja', {color: '#000'});
        //self.canasta.setTint(0xff6600);
        self.anims.create({
            key:"cami_anim",
            frames:self.anims.generateFrameNumbers("canasta"),
            frameRate:8,
            repeat:-1
        });
        self.canasta.play("cami_anim")

    }

    self.canasta.setScale(0.8);
    setCanasta(playerInfo.tipoCanasta);
    self.canasta.setCollideWorldBounds(true);
}

function addOtherPlayer(self, playerInfo) {
    //self.otherPlayer = self.physics.add.sprite(127, 400, 'canasta');
    if (playerInfo.tipoCanasta == 0) {
        self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'canastamanz');
    }else if(playerInfo.tipoCanasta == 1 ){
        self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'canastasandi');
    }else if(playerInfo.tipoCanasta == 2 ){
        self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'canastauvas');
        
    }else{
       self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'canasta');
    }

    self.otherPlayer.setScale(0.8);
    self.otherPlayer.setCollideWorldBounds(true);
    self.otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(self.otherPlayer);
}

function creaFruta(self, frutaId){
    if (frutaId == 0) {
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'manzana').setScale(0.3);
    }else if(frutaId == 1 ){
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'patilla').setScale(0.3);
    }else if(frutaId == 2 ){
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'ciruela').setScale(0.3);
    }else{
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'naranja').setScale(0.3);
    }/*else if(frutaId == 4){
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'fruta5');
    }else{
        self.fruta = self.physics.add.image(Math.floor(Math.random() * 1200), 50, 'fruta6');
    }*/

    self.fruta.body.gravity.y = 100;
    self.physics.add.overlap(self.fruta, self.canasta, recogeFruta, null, this);

}

// Función para darle el formato al reloj.
function formatoTiempo(seconds){
    // Minutes
    var minutes = Math.floor(seconds/60);
    // Seconds
    var partInSeconds = seconds%60;
    // Adds left zeros to seconds
    partInSeconds = partInSeconds.toString().padStart(2,'0');
    // Returns formated time
    return `${minutes}:${partInSeconds}`;
}

function aumentaTiempo (tiempo){
    texto.setText('Tiempo: ' + formatoTiempo(tiempo));
}

function recogeFruta (fruta){
    
    if(getCanasta() == 0 && fruta.texture.key == "manzana"){
        puntos += 5;    //Aumento el valor de la puntuación.
    }else if(getCanasta() == 1 && fruta.texture.key == "patilla"){
        puntos += 5;    //Aumento el valor de la puntuación.
    }else if(getCanasta() == 2 && fruta.texture.key == "ciruela"){
        puntos += 5;    //Aumento el valor de la puntuación.
    }else if(getCanasta() == 3 && fruta.texture.key == "naranja"){
        puntos += 5;    //Aumento el valor de la puntuación.
    }else{
        //puntos -= 10;    //Reduce el valor de la puntuación.
    }
    fruta.disableBody(true, true);   //Elimina visualmente la fruta.
    puntosText.setText('Puntuación: ' + puntos);
}

function setCanasta(laCanasta){
    this.miCanasta = laCanasta;
}

function getCanasta(){
    return miCanasta;
}