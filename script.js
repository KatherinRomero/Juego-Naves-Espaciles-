var x = 100, y = 100;

const KEY_ENTER = 13;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const BARRA = 32; 

game = {
    canvas: null,
    ctx: null,
    imagen: null,
    caratula: null,
    imagenEnemigo: null,
    teclaPulada: null,
    tecla: [],
    colorBala: "red",
    balas_array: new Array(),
    enemigos_array: new Array(),
    jugador: null,
    x: 0
};


//---------------------- CLASES ----------------------

function bala(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;

    this.dibujar = function () {
        // Dibujar bala
        game.ctx.save();
        game.ctx.fillStyle = game.colorBala;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);   // ✅ corregido
        this.y -= 4;
        game.ctx.restore();
    }
}

function jugador(x) {
    this.x = x;
    this.y = 450;

    this.dibujar = function (x) {
        this.x = x;
        game.ctx.drawImage(game.imagen, this.x, this.y, 30, 15);
    }
}

function enemigo(x, y) {
    this.x = x;
    this.y = y;
    this.w = 35;
    this.veces = 0;
    this.dx = 5;
    this.ciclos = 0;
    this.num = 14;
    this.fugura = true;
    this.vive = true;
    this.dibujar = function () {
        game.ctx.drawImage(game.imagenEnemigo,0,0,40,30,this.x,this.y,35,30);
    }
}


//---------------------- FUNCIONES ----------------------

const caratula = () => {
    let imagen = new Image();
    imagen.src = "imagenes/cara.webp";

    imagen.onload = function () {
        game.caratula = true;
        game.ctx.drawImage(imagen, 0, 0, game.canvas.width, game.canvas.height);
    }
}

const selecionar = () => {
    if (game.caratula) {
        inicio();
    }
}

const inicio = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.caratula = false;

    game.jugador = new jugador(0);
    game.x = game.canvas.width / 2;

    game.jugador.dibujar(game.x);

    animar();
}


const animar = () => {
    requestAnimationFrame(animar);
    verificar();
    pintar();
}


const verificar = () => {
    if (game.tecla[KEY_LEFT]) {
        game.x -= 10;
    }
    if (game.tecla[KEY_RIGHT]) {
        game.x += 10;
    }

    // Limites
    if (game.x < 0) game.x = 0;
    if (game.x > game.canvas.width - 30) game.x = game.canvas.width - 30;

    // ✅ Actualizar posición real del jugador
    game.jugador.x = game.x;
}


const pintar = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.jugador.dibujar(game.x);

    // disparo ✅
    if (game.teclaPulada === BARRA) {
        game.balas_array.push(new bala(game.jugador.x + 12, game.jugador.y - 3, 5));
        game.teclaPulada = null;
    }

    for (var i = 0; i < game.balas_array.length; i++) {
        if (game.balas_array[i] != null) {
            game.balas_array[i].dibujar();
            if (game.balas_array[i].y < 0) game.balas_array[i] = null;
        }
    }

    // enemigos
    for(var i=0;i<game.enemigos_array.length;i++){
        game.enemigos_array[i].dibujar();
    }
}


//---------------------- LISTENERS ----------------------

window.addEventListener("keydown", function (e) {
    game.teclaPulada = e.keyCode;
    game.tecla[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
    game.tecla[e.keyCode] = false;
});

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) { window.setTimeout(callback, 17); }
})();


//---------------------- INICIO ----------------------

window.onload = function () {
    game.canvas = document.getElementById("canvas");
    game.ctx = game.canvas.getContext("2d");

    game.imagen = new Image();
    game.imagen.src = "imagenes/torre.png";

    //enemigos
    game.imagenEnemigo = new Image();
    game.imagenEnemigo.src = "imagenes/invader.fw.png";
    game.imagenEnemigo.onload = function () {
        for (var i = 0; i < 5; i++) {
            for(var j=0;j<10;j++){
                game.enemigos_array.push(new enemigo(40*j, 30 + 42*i));
            }
        }
    }

    caratula();

    game.canvas.addEventListener("click", selecionar, false);
}
