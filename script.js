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
    colorBala2: "yellow",
    balas_array: [],
    balasEnemigas_array: [], // ✅ Faltaba inicializar
    enemigos_array: [],
    jugador: null,
    x: 0,
    direccion: 1,
    disparo: false
};

//---------------------- CLASES ----------------------

function bala(x, y, w, velocidad = 4, color = game.colorBala) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.velocidad = velocidad;
    this.color = color;

    this.dibujar = function () {
        game.ctx.save();
        game.ctx.fillStyle = this.color;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);
        this.y -= this.velocidad;
        game.ctx.restore();
    };

    // ✅ método para las balas enemigas
    this.disparar = function () {
        game.ctx.save();
        game.ctx.fillStyle = game.colorBala2;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);
        this.y += this.velocidad;
        game.ctx.restore();
    };
}

function jugador(x) {
    this.x = x;
    this.y = 450;

    this.dibujar = function (x) {
        this.x = x;
        game.ctx.drawImage(game.imagen, this.x, this.y, 30, 15);
    };
}

function enemigo(x, y) {
    this.x = x;
    this.y = y;
    this.w = 35;
    this.h = 30;
    this.vive = true;
    this.figura = false;

    this.mover = function (dx, bajar) {
        this.x += dx;
        if (bajar) this.y += 20;
        this.figura = !this.figura;
    };

    this.dibujar = function () {
        if (this.figura) {
            game.ctx.drawImage(game.imagenEnemigo, 0, 0, 40, 30, this.x, this.y, this.w, this.h);
        } else {
            game.ctx.drawImage(game.imagenEnemigo, 50, 0, 35, 30, this.x, this.y, this.w, this.h);
        }
    };
}

//---------------------- FUNCIONES ----------------------

const caratula = () => {
    let imagen = new Image();
    imagen.src = "imagenes/cara.webp";

    imagen.onload = function () {
        game.caratula = true;
        game.ctx.drawImage(imagen, 0, 0, game.canvas.width, game.canvas.height);
    };
};

const selecionar = () => {
    if (game.caratula) inicio();
};

const inicio = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.caratula = false;
    game.jugador = new jugador(0);
    game.x = game.canvas.width / 2;
    game.jugador.dibujar(game.x);
    animar();
};

const animar = () => {
    requestAnimationFrame(animar);
    verificar();
    pintar();
    moverEnemigos();
    colisiones();
};

const colisiones = () => {
    for (let i = 0; i < game.enemigos_array.length; i++) {
        let enemigo = game.enemigos_array[i];
        if (!enemigo) continue;

        for (let j = 0; j < game.balas_array.length; j++) {
            let bala = game.balas_array[j];
            if (!bala) continue;

            if (
                bala.x > enemigo.x &&
                bala.x < enemigo.x + enemigo.w &&
                bala.y > enemigo.y &&
                bala.y < enemigo.y + enemigo.h
            ) {
                game.enemigos_array[i] = null;
                game.balas_array[j] = null;
                game.disparo = false;
            }
        }
    }

    // ✅ Limpiar arrays de null
    game.enemigos_array = game.enemigos_array.filter(e => e !== null);
    game.balas_array = game.balas_array.filter(b => b !== null);
    game.balasEnemigas_array = game.balasEnemigas_array.filter(b => b !== null);
};

const verificar = () => {
    if (game.tecla[KEY_LEFT]) game.x -= 10;
    if (game.tecla[KEY_RIGHT]) game.x += 10;

    if (game.x < 0) game.x = 0;
    if (game.x > game.canvas.width - 30) game.x = game.canvas.width - 30;

    // disparos aleatorios enemigos
    if (Math.random() > 0.98) dispararEnemigos();
};

const dispararEnemigos = () => {
    let ultimos = [];
    for (let i = game.enemigos_array.length - 1; i >= 0; i--) {
        if (game.enemigos_array[i] != null) ultimos.push(i);
        if (ultimos.length === 10) break;
    }

    if (ultimos.length > 0) {
        let d = ultimos[Math.floor(Math.random() * ultimos.length)];
        game.balasEnemigas_array.push(
            new bala(game.enemigos_array[d].x + game.enemigos_array[d].w / 2, game.enemigos_array[d].y, 5, 4, game.colorBala2)
        );
    }
};

const pintar = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.jugador.dibujar(game.x);

    if (game.teclaPulada === BARRA && !game.disparo) {
        game.balas_array.push(new bala(game.jugador.x + 12, game.jugador.y - 3, 5));
        game.teclaPulada = null;
        game.disparo = true;
    }

    for (let b of game.balas_array) b.dibujar();
    for (let b of game.balasEnemigas_array) b.disparar();
    for (let e of game.enemigos_array) e.dibujar();
};

//---------------------- MOVIMIENTO GRUPAL ----------------------

let contador = 0;
function moverEnemigos() {
    contador++;
    if (contador < 30) return;
    contador = 0;

    let enemigosVivos = game.enemigos_array.filter(e => e !== null);
    if (enemigosVivos.length === 0) return;

    let dx = 10 * game.direccion;
    let bajar = false;

    let enemigoDerecha = Math.max(...enemigosVivos.map(e => e.x + e.w));
    let enemigoIzquierda = Math.min(...enemigosVivos.map(e => e.x));

    if (enemigoDerecha + dx >= game.canvas.width) {
        game.direccion = -1;
        bajar = true;
    } else if (enemigoIzquierda + dx <= 0) {
        game.direccion = 1;
        bajar = true;
    }

    for (let enemigo of enemigosVivos) enemigo.mover(dx, bajar);
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
        function (callback) { window.setTimeout(callback, 17); };
})();

//---------------------- INICIO ----------------------

window.onload = function () {
    game.canvas = document.getElementById("canvas");
    game.ctx = game.canvas.getContext("2d");

    game.imagen = new Image();
    game.imagen.src = "imagenes/torre.png";

    game.imagenEnemigo = new Image();
    game.imagenEnemigo.src = "imagenes/invader.fw.png";
    game.imagenEnemigo.onload = function () {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                game.enemigos_array.push(new enemigo(100 + 40 * j, 30 + 45 * i));
            }
        }
    };

    caratula();
    game.canvas.addEventListener("click", selecionar, false);
};
