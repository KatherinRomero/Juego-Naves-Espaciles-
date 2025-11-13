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
    balas_array: [],
    enemigos_array: [],
    jugador: null,
    x: 0,
    direccion: 1 // 1 = derecha, -1 = izquierda
};


//---------------------- CLASES ----------------------

function bala(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;

    this.dibujar = function () {
        game.ctx.save();
        game.ctx.fillStyle = game.colorBala;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);   
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
    this.h = 30;
    this.vive = true;

    
    this.mover = function (dx, bajar) {
        this.x += dx;
        if (bajar) this.y += 20;
        this.figura=!this.figura;
    }

    this.dibujar = function () {
        if (this.figura) {
            game.ctx.drawImage(game.imagenEnemigo, 0, 0, 40, 30, this.x, this.y, this.w,35,30);
        } else {
            game.ctx.drawImage(game.imagenEnemigo, 50, 0, 35, 30, this.x, this.y, this.w,35,30);
        }
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
    moverEnemigos();
    coliciones()
}
 const coliciones = () => {
    let enemigo, bala;
    
    for(var i=0; i<game.enemigos_array.length; i++){
        for(var j=0; j<game.balas_array.length; j++){
            enemigo = game.enemigos_array[i];
            bala = game.balas_array[j];

            if((enemigo != null) && (bala != null)){

                if((bala.x>enemigo.x) && 
                (bala.x<enemigo.x+enemigo.w) &&
                (bala.y>enemigo.y) && 
                (bala.y<enemigo.y+enemigo.h)){
                    enemigo.vive = false;
                    game.enemigos_array[i] = null;
                    game.balas_array[j] = null;
                    game.disparo=false;
                }
            }
        }
    }
}


const verificar = () => {
    if (game.tecla[KEY_LEFT]) {
        game.x -= 10;
    }
    if (game.tecla[KEY_RIGHT]) {
        game.x += 10;
    }

    if (game.x < 0) game.x = 0;
    if (game.x > game.canvas.width - 30) game.x = game.canvas.width - 30;
}


const pintar = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.jugador.dibujar(game.x);

    if (game.teclaPulada === BARRA) {
        game.balas_array.push(new bala(game.jugador.x + 12, game.jugador.y - 3, 5));
        game.teclaPulada = null;
    }

    for (let i = 0; i < game.balas_array.length; i++) {
        if (game.balas_array[i]) {
            game.balas_array[i].dibujar();
            if (game.balas_array[i].y < 0) game.balas_array[i] = null;
        }
    }

    for (let i = 0; i < game.enemigos_array.length; i++) {
        if (game.enemigos_array[i] != null){
            game.enemigos_array[i].dibujar();
        }
    }
}


//---------------------- MOVIMIENTO GRUPAL ----------------------

let contador = 0;
function moverEnemigos() {
    contador++;
    if (contador < 30) return; // controla la velocidad
    contador = 0;

    let dx = 10 * game.direccion;
    let bajar = false;

    // Filtrar enemigos que existen
    const enemigosVivos = game.enemigos_array.filter(e => e !== null);

    if (enemigosVivos.length === 0) return; // si no quedan enemigos, no hacer nada

    // calcular límites del grupo
    let enemigoDerecha = Math.max(...enemigosVivos.map(e => e.x + e.w));
    let enemigoIzquierda = Math.min(...enemigosVivos.map(e => e.x));

    if (enemigoDerecha + dx >= game.canvas.width) {
        game.direccion = -1;
        bajar = true;
    } else if (enemigoIzquierda + dx <= 0) {
        game.direccion = 1;
        bajar = true;
    }

    for (let enemigo of enemigosVivos) {
        enemigo.mover(dx, bajar);
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

    game.imagenEnemigo = new Image();
    game.imagenEnemigo.src = "imagenes/invader.fw.png";
    game.imagenEnemigo.onload = function() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                game.enemigos_array.push(new enemigo(100 + 40 * j, 30 + 45 * i));
            }
        }
    }

    caratula();
    game.canvas.addEventListener("click", selecionar, false);
}
