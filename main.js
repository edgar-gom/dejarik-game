import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// AÑADE ESTA LÍNEA NUEVA:
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Importamos la librería principal y los controles de cámara
import * as THREE from 'three';
let modoJuego = '2P'; // Guardará si jugamos contra la máquina o un humano

// 1. CONFIGURACIÓN BÁSICA (Escena, Cámara, Renderizador)
const scene = new THREE.Scene();
const cargadorTexturas = new THREE.TextureLoader();
scene.background = cargadorTexturas.load('assets/espacio2.jpg');

// Cámara (Campo de visión, Proporción pantalla, Cerca, Lejos)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 8); // Posicionamos la cámara (X, Y, Z) mirando hacia abajo
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias quita los bordes de sierra
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activamos sombras
document.body.appendChild(renderer.domElement); // Metemos el canvas 3D al HTML

// 2. CONTROLES DE CÁMARA (Para rotar alrededor del tablero con el ratón)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimiento suave
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Evita que la cámara baje por debajo de la mesa

// 3. ILUMINACIÓN (Mejorada para modelos 3D)
// HemisphereLight da un baño de luz general (Color cielo, Color suelo, Intensidad)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(hemiLight);

// Luz direccional (como un sol) más potente
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// Una lucecita verde desde abajo para simular que la mesa holográfica brilla
const luzMesa = new THREE.PointLight(0x00ffcc, 1.5, 10);
luzMesa.position.set(0, 1, 0);
scene.add(luzMesa);


// 4. TABLERO DEJARIK 
// ==========================================
// 4. TABLERO DEJARIK 
// ==========================================

// A. La base de la mesa (Cilindro grueso)
const baseMesaGeo = new THREE.CylinderGeometry(6, 6, 0.5, 64);
const baseMesaMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
const mesa = new THREE.Mesh(baseMesaGeo, baseMesaMat);
mesa.position.y = -0.25; 
mesa.receiveShadow = true;
scene.add(mesa);

// --- NUEVAS CASILLAS DEL TABLERO ---

// Colores tipo ajedrez (pero sci-fi)
const colorOscuro = 0x1a1a1a;  // Gris casi negro
const colorClaro = 0x2a3b32;   // Verde/Gris alienígena oscuro
const materialNeon = new THREE.LineBasicMaterial({ color: 0x00ffcc }); // Neón de los bordes

// 1. Casilla Central (Un círculo perfecto)
const centroGeo = new THREE.CircleGeometry(1.5, 32);
const centroMat = new THREE.MeshStandardMaterial({ color: colorOscuro, roughness: 0.7 });
const casillaCentro = new THREE.Mesh(centroGeo, centroMat);
casillaCentro.rotation.x = -Math.PI / 2; // Acostarlo sobre la mesa
casillaCentro.position.y = 0.01; 
casillaCentro.receiveShadow = true;

// Añadirle el borde brillante al centro
const bordeCentroGeo = new THREE.EdgesGeometry(centroGeo);
casillaCentro.add(new THREE.LineSegments(bordeCentroGeo, materialNeon));
scene.add(casillaCentro);

// 2. Anillos Medio y Exterior (12 rebanadas cada uno)
const treintaGrados = (30 * Math.PI) / 180;

for (let i = 0; i < 12; i++) {
    const anguloInicio = i * treintaGrados;
    
    // Intercalar colores (si es par usa un color, si es impar usa otro)
    const colorMedio = (i % 2 === 0) ? colorClaro : colorOscuro;
    const colorExterior = (i % 2 === 0) ? colorOscuro : colorClaro; // Invertido para efecto ajedrez

    // CASILLA DEL ANILLO MEDIO (Radio interno 1.5, externo 3.5)
    const geoMedio = new THREE.RingGeometry(1.5, 3.5, 8, 1, anguloInicio, treintaGrados);
    const matMedio = new THREE.MeshStandardMaterial({ color: colorMedio, roughness: 0.7 });
    const casillaMedio = new THREE.Mesh(geoMedio, matMedio);
    casillaMedio.rotation.x = -Math.PI / 2;
    casillaMedio.position.y = 0.01;
    casillaMedio.receiveShadow = true;
    
    // Borde brillante de la casilla
    casillaMedio.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoMedio), materialNeon));
    scene.add(casillaMedio);

    // CASILLA DEL ANILLO EXTERIOR (Radio interno 3.5, externo 5.5)
    const geoExt = new THREE.RingGeometry(3.5, 5.5, 8, 1, anguloInicio, treintaGrados);
    const matExt = new THREE.MeshStandardMaterial({ color: colorExterior, roughness: 0.7 });
    const casillaExt = new THREE.Mesh(geoExt, matExt);
    casillaExt.rotation.x = -Math.PI / 2;
    casillaExt.position.y = 0.01;
    casillaExt.receiveShadow = true;
    
    // Borde brillante de la casilla
    casillaExt.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoExt), materialNeon));
    scene.add(casillaExt);
}

// --- FIN DE LAS CASILLAS ---

// E. El "Cristal Invisible" para que los clics sigan funcionando
const planoClicGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.1, 64);
const planoClicMat = new THREE.MeshBasicMaterial({ visible: false });
const planoClic = new THREE.Mesh(planoClicGeo, planoClicMat);
planoClic.position.y = 0.05; 
scene.add(planoClic);

// --- NUEVO: CRISTAL DE VICTORIA (CORONA CENTRAL) ---
const coronaGeo = new THREE.OctahedronGeometry(0.4);
const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true }); // Amarillo Oro
const coronaDiamante = new THREE.Mesh(coronaGeo, coronaMat);
coronaDiamante.position.set(0, 1, 0); // Flotando a 1 metro de altura en el centro
scene.add(coronaDiamante);


// ==========================================
// 5. CARGADOR DE MONSTRUOS (Con Auto-Escalado Mágico)
// ==========================================

// 5. 1 ESTADO DEL JUEGO Y REGLAS (Game Design)
// ==========================================
let turnoActual = 1; // Empieza el Equipo 1 (Azul)
let accionesRestantes = 2; // NUEVO: Contador de acciones
let turnosEnCentro = { equipo1: 0, equipo2: 0 }; // Contador para ganar por dominio del centro
const efectosActivos = []; // NUEVO: Guarda las animaciones de ataque

// --- AJUSTE DE VOLÚMENES ---
// Bajamos la música para que los SFX (efectos) destaquen más
document.getElementById('bgm-menu').volume = 0.7;    // % de volumen (70%)
document.getElementById('bgm-batalla').volume = 0.4; // % de volumen (40%)
document.getElementById('bgm-victoria').volume = 0.7; // % de volumen (70%)

// CLASES DE CRIATURAS (Tus 4 tipos)
const CLASES = {
    'tanque':    { maxHp: 20, atk: 8, def: 3, rango: 1, tiempoAnim: 4500  }, // Mucha vida, pega normal
    'asesino':   { maxHp: 10,  atk: 12, def: 1, rango: 2, tiempoAnim: 1500 }, // Pega durísimo, muere rápido <- ¡Este ahora dispara de lejos!
    'guerrero':  { maxHp: 15, atk: 9, def: 2, rango: 1, tiempoAnim: 4000  }, // Equilibrado
    'defensor':  { maxHp: 18, atk: 5, def: 4, rango: 1, tiempoAnim: 5500  }  // Aguanta golpes en el centro
};

// HELPER 1: Convierte Casilla Lógica (Anillo, Segmento) a Coordenadas 3D (X, Z)
function obtenerCoordenadas(anillo, segmento) {
    if (anillo === 0) return { x: 0, z: 0 };
    const radioMedio = anillo === 1 ? 2.5 : 4.5;
    const angulo = (segmento * 30 + 15) * (Math.PI / 180);
    return { x: Math.cos(angulo) * radioMedio, z: Math.sin(angulo) * radioMedio };
}

// HELPER 2: Revisa si dos casillas están pegadas (Para que camine de 1 en 1)
function esAdyacente(a1, s1, a2, s2) {
    if (a1 === 0 && a2 === 1) return true; // Centro conecta con todo el Anillo 1
    if (a1 === 1 && a2 === 0) return true;
    if (a1 === a2 && a1 !== 0) { // Mismo anillo, segmento de al lado
        let diff = Math.abs(s1 - s2);
        if (diff === 1 || diff === 11) return true; // 11 y 0 se tocan
    }
    if (Math.abs(a1 - a2) === 1 && s1 === s2 && a1 !== 0 && a2 !== 0) return true; // Avanzar/Retroceder de anillo
    return false;
}

// HELPER 3: Revisa si hay una pieza ocupando una casilla (Para que no se superpongan)
function obtenerPiezaEnCasilla(anillo, segmento) {
    return piezasArray.find(p => p.userData.anillo === anillo && p.userData.segmento === segmento);
}
//--------------------------------------------------

// HELPER 4: Calcula a cuántas casillas de distancia están dos piezas
function calcularDistanciaGrid(a1, s1, a2, s2) {
    if (a1 === a2 && s1 === s2) return 0;
    if (esAdyacente(a1, s1, a2, s2)) return 1;
    
    // Para rango 2: revisamos si comparten una casilla vecina
    for (let a = 0; a <= 2; a++) {
        let maxS = (a === 0) ? 0 : 11; // Si es el centro, solo evaluamos segmento 0
        for (let s = 0; s <= maxS; s++) {
            if (esAdyacente(a1, s1, a, s) && esAdyacente(a, s, a2, s2)) return 2;
        }
    }
    return 3; // Está a 3 o más casillas de distancia
}

// HELPER 5: Reproductor de Audio Seguro
function reproducirSonido(idSonido) {
    const sonido = document.getElementById(idSonido);
    if (sonido) {
        sonido.currentTime = 0; // Lo regresa a 0 por si se reproduce muy rápido (ametralladora)
        // El catch evita que el juego se congele si el archivo no existe o el navegador lo bloquea
        sonido.play().catch(e => console.warn(`No se pudo reproducir ${idSonido}:`, e));
    }
}
window.entrarAlMenu = function() {
    document.getElementById('pantalla-splash').classList.remove('activa');
    document.getElementById('pantalla-menu').classList.add('activa');
    
    reproducirSonido('bgm-menu'); // Empieza la música del menú
    reproducirSonido('sfx-clic');
}

const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader); // Conectamos Draco a nuestro GLTF

// 2. Decodificador de texturas (KTX2) - REQUIERE EL RENDERER
const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
ktx2Loader.detectSupport(renderer); // Aquí conecta con tu tarjeta gráfica
gltfLoader.setKTX2Loader(ktx2Loader);

// 3. Decodificador Meshopt (NUEVO)
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const piezasArray = []; 

/// ==========================================
// 5.2 CARGADOR DE MONSTRUOS (Con Tamaños Corregidos y Mirando al Centro)
// ==========================================
function cargarPieza(ruta, anillo, segmento, equipo, tipoClase) {
    gltfLoader.load(ruta, (gltf) => {
            const modelo = gltf.scene;
            
            const caja = new THREE.Box3().setFromObject(modelo);
            const tamaño = new THREE.Vector3();
            caja.getSize(tamaño);
            const maxDimension = Math.max(tamaño.x, tamaño.y, tamaño.z);
            
            // ESCALADO DEL MODELO
            // --- NUEVA LÓGICA DE ESCALA MANUAL ---
            const itemInv = INVENTARIO.find(i => i.ruta === ruta);
            const multi = (itemInv && itemInv.escalaExtra) ? itemInv.escalaExtra : 1;
            const escalaFinal = (1.5 / maxDimension) * multi;
            modelo.scale.setScalar(escalaFinal);
            
            // LA MAGIA: Calculamos la escala inversa para UI (Anillos y Barras)
            const escalaInversa = 1 / escalaFinal; 

            // POSICIÓN Y ROTACIÓN
            const pos = obtenerCoordenadas(anillo, segmento);
            modelo.position.set(pos.x, 0, pos.z);
            
            // ¡HACER QUE MIREN AL CENTRO DEL TABLERO!
            modelo.lookAt(0, 0, 0);

            // STATS
            const stats = CLASES[tipoClase];
            modelo.userData = {
                esPieza: true, equipo: equipo, clase: tipoClase,
                hp: stats.maxHp, atk: stats.atk, def: stats.def,
                anillo: anillo, segmento: segmento,
                destinoX: pos.x, destinoZ: pos.z
            };

            // --- BARRA DE VIDA (Corregida con escala inversa) ---
            const hpFondoGeo = new THREE.PlaneGeometry(1, 0.15);
            const hpFondoMat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
            const hpFondo = new THREE.Mesh(hpFondoGeo, hpFondoMat);
            
            // Usamos la escala inversa para que la barra mantenga tamaño normal
            hpFondo.scale.setScalar(escalaInversa * 0.8); 
            // Calculamos la altura de su cabeza para que no flote demasiado alto ni muy bajo
            hpFondo.position.y = (tamaño.y * escalaFinal) * escalaInversa + (0.5 * escalaInversa); 

            const hpVerdeGeo = new THREE.PlaneGeometry(1, 0.15);
            hpVerdeGeo.translate(0.5, 0, 0); 
            const hpVerdeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, depthTest: false });
            const hpVerde = new THREE.Mesh(hpVerdeGeo, hpVerdeMat);
            hpVerde.position.set(-0.5, 0, 0.01); 
            
            hpFondo.add(hpVerde); 
            modelo.add(hpFondo);  
            
            modelo.userData.hpBarraVerde = hpVerde;
            modelo.userData.hpContenedor = hpFondo; 

            // SOMBRAS
            modelo.traverse((nodo) => {
                if (nodo.isMesh) {
                    nodo.castShadow = true;
                    nodo.receiveShadow = true;
                    nodo.userData = { esPieza: true, objetoRaiz: modelo };
                }
            });

            // --- ARO DE EQUIPO (Corregido con escala inversa) ---
            const colorEquipo = equipo === 1 ? 0x00aaff : 0xff3300;
          //  const aroGeo = new THREE.RingGeometry(0.5, 0.6, 32); 
            const circuloGeo = new THREE.CircleGeometry(0.6, 32); // Cambiado a CircleGeometry con radio 0.6
            const aroMat = new THREE.MeshBasicMaterial({ color: colorEquipo, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
            const aroEquipo = new THREE.Mesh(circuloGeo, aroMat);
            
            aroEquipo.rotation.x = -Math.PI / 2;
            
            // Usamos la escala inversa para el aro
            aroEquipo.scale.setScalar(escalaInversa);
            aroEquipo.position.y = 0.02 * escalaInversa; 
            
            modelo.add(aroEquipo); 
            // --- NUEVO: HITBOX INVISIBLE ---
            // Creamos un cilindro transparente que envuelve al modelo
            const hitboxGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisible
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
            // Lo levantamos para que coincida con el cuerpo
            hitbox.position.y = 1.5; 
            
            // Le damos la misma metadata para que el click lo detecte como si fuera el robot
            hitbox.userData = { esPieza: true, objetoRaiz: modelo };
            modelo.add(hitbox); // Lo pegamos al personaje

            scene.add(modelo);
            piezasArray.push(modelo); 
        }, undefined, (error) => console.error(error)
    );
}

// ==========================================
//6. SISTEMA DE VICTORIA
// ==========================================
function mostrarVictoria(mensaje) {
    document.getElementById('bgm-batalla').pause(); // Apaga la música de batalla
    reproducirSonido('bgm-victoria');               // Toca fanfarria de victoria
    document.getElementById('texto-victoria').innerText = mensaje;
    document.getElementById('pantalla-victoria').classList.add('activa');
}

function verificarVictoria() {
    // Revisamos si quedan piezas del Equipo 1 y Equipo 2
    let equipo1Vivos = piezasArray.some(p => p.userData.equipo === 1);
    let equipo2Vivos = piezasArray.some(p => p.userData.equipo === 2);
    
    if (!equipo1Vivos) mostrarVictoria("¡EL EQUIPO ROJO GANA POR ELIMINACIÓN!");
    if (!equipo2Vivos) mostrarVictoria("¡EL EQUIPO AZUL GANA POR ELIMINACIÓN!");
}

// ==========================================
// 7. LÓGICA DE INTERFAZ (MENÚS Y SELECCIÓN)
// ==========================================

// Diccionario de tus 12 modelos (Asegúrate de poner las rutas reales que tienes)
// Diccionario de tus 12 modelos (Con las rutas exactas de tu carpeta)
const INVENTARIO = [
    { nombre: "Robot Alfa",  ruta: "assets/robot1.glb", clase: "guerrero" },
    { nombre: "Robot Beta",  ruta: "assets/robot2.glb", clase: "tanque" },
    { nombre: "Robot Gamma", ruta: "assets/robot3.glb", clase: "asesino" },
    { nombre: "Robot Delta", ruta: "assets/robot4.glb", clase: "defensor" },
    
    { nombre: "Mecha Uno",   ruta: "assets/mecha1.glb", clase: "guerrero" },
    { nombre: "Mecha Dos",   ruta: "assets/mecha2.glb", clase: "tanque" },
    { nombre: "Mecha Tres",  ruta: "assets/mecha3.glb", clase: "asesino" },
    { nombre: "Mecha Cuatro",ruta: "assets/mecha4.glb", clase: "defensor" },
    
    { nombre: "George",      ruta: "assets/1George.glb", clase: "guerrero", escalaExtra: 0.5 },
    { nombre: "Leela",       ruta: "assets/2Leela.glb",  clase: "tanque", escalaExtra: 0.5 },
    { nombre: "Mike",        ruta: "assets/3Mike.glb",   clase: "asesino", escalaExtra: 0.5 },
    { nombre: "Stan",        ruta: "assets/4Stan.glb",   clase: "defensor", escalaExtra: 0.5 }
];

let equipo1Elegido = [];

// Animación del Splash Screen
//setTimeout(() => {
  //  document.getElementById('pantalla-splash').classList.remove('activa');
  //  document.getElementById('pantalla-menu').classList.add('activa');
//}, 3000); // El título desaparece tras 3 segundos

// Botón "Jugar" del menú
window.irASeleccion = function(modo) {
    modoJuego = modo; // Guardamos lo que el jugador eligió
    document.getElementById('pantalla-menu').classList.remove('activa');
    document.getElementById('pantalla-seleccion').classList.add('activa');
    generarGridSeleccion(); 
}

// Crear los 12 botones// Variable global para el modelo que gira en el menú
let modeloPreview = null; 
let previewActual = null; // NUEVO: Controla qué modelo estamos intentando cargar

function generarGridSeleccion() {
    const grid = document.getElementById('grid-monstruos');
    grid.innerHTML = "";
    
    INVENTARIO.forEach((monstruo) => {
        let div = document.createElement('div');
        div.className = "carta-monstruo";
        div.innerHTML = `<h4>${monstruo.nombre}</h4><small>Clase: ${monstruo.clase}</small>`;
        
        // ¡LA MAGIA DEL PREVIEW 3D! Al poner el ratón encima de la carta:
        div.onmouseenter = () => {
            previewActual = monstruo.nombre; // Marcamos qué estamos intentando cargar
            

            // Borramos el modelo anterior directamente de la escena
            if (modeloPreview) {
                scene.remove(modeloPreview);
                modeloPreview = null;
            }
            
            gltfLoader.load(monstruo.ruta, (gltf) => {
                // Si cuando termina de cargar, ya moviste el ratón a otro lado, abortamos.
                if(previewActual !== monstruo.nombre) return; 
                
                 modeloPreview = gltf.scene;
                const caja = new THREE.Box3().setFromObject(modeloPreview);
                const tamaño = new THREE.Vector3(); caja.getSize(tamaño);
                
                const multi = monstruo.escalaExtra ? monstruo.escalaExtra : 1;
                modeloPreview.scale.setScalar((3 / Math.max(tamaño.x, tamaño.y, tamaño.z)) * multi);
                
                // Lo ponemos a la derecha y un poco más arriba para que la UI no lo tape
                modeloPreview.position.set(3, 0, 0); 
                
                scene.add(modeloPreview); // Lo metemos a la escena principal
            });
        };

        div.onclick = () => {
            if (div.classList.contains('seleccionado')) {
                div.classList.remove('seleccionado');
                equipo1Elegido = equipo1Elegido.filter(m => m !== monstruo);
            } else {
                if (equipo1Elegido.length < 4) {
                    div.classList.add('seleccionado');
                    equipo1Elegido.push(monstruo);
                }
            }
            document.getElementById('contador-seleccion').innerText = `Seleccionados: ${equipo1Elegido.length} / 4`;
            document.getElementById('btn-iniciar').style.display = (equipo1Elegido.length === 4) ? 'block' : 'none';
        };
        grid.appendChild(div);
    });
}

// Botón "Comenzar Batalla"
window.iniciarJuego = function() {
    document.getElementById('bgm-menu').pause(); // Apaga la música del menú
    reproducirSonido('bgm-batalla');             // Enciende la música épica
    reproducirSonido('sfx-clic');
    document.getElementById('pantalla-seleccion').classList.remove('activa');
    // AÑADE ESTA LÍNEA PARA BORRAR EL HOLOGRAMA DEL MENÚ:
    if(modeloPreview) scene.remove(modeloPreview);
    // Desplegar Equipo 1 (Los que tú elegiste)
    equipo1Elegido.forEach((monstruo, i) => {
        cargarPieza(monstruo.ruta, 2, i, 1, monstruo.clase);
    });

    // Desplegar Equipo 2 (Elegidos al azar para la computadora/jugador 2)
    let inventarioRandom = [...INVENTARIO].sort(() => 0.5 - Math.random());
    for(let i = 0; i < 4; i++) {
        // Los ponemos en los segmentos del otro lado (6, 7, 8, 9)
        cargarPieza(inventarioRandom[i].ruta, 2, i + 6, 2, inventarioRandom[i].clase);
    }
}

// 7.1 REDIMENSIONAR PANTALLA (Si el usuario cambia el tamaño de la ventana)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// ==========================================
// 8. EL CEREBRO DEL JUEGO (Raycaster)
// ==========================================
// ==========================================
const raycaster = new THREE.Raycaster();
const raton = new THREE.Vector2();
let piezaSeleccionada = null; 
//
//Funcion de efectos
function reproducirEfectoAtaque(atacante, defensor, clase, tiempoAnim) {
    const posA = atacante.position.clone().setY(1.5); // Altura del pecho
    const posD = defensor.position.clone().setY(1.5);

    // 1. EL LÁSER BASE (Todos lo tienen)
    const matLaser = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    const geoLaser = new THREE.BufferGeometry().setFromPoints([posA, posD]);
    const laser = new THREE.Line(geoLaser, matLaser);
    scene.add(laser);

    let vfxObj = null;

    // 2. EFECTOS POR CLASE
    if (clase === 'tanque') {
        // CILINDRO (Golpe contundente desde arriba)
        reproducirSonido('sfx-ataque-tanque'); // <--- AÑADIDO
        const geo = new THREE.CylinderGeometry(0.6, 0.6, 2, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.8 });
        vfxObj = new THREE.Mesh(geo, mat);
        vfxObj.position.copy(posD).setY(4); // Empieza muy alto
        scene.add(vfxObj);
    } 
    else if (clase === 'guerrero') {
        // CORTE (Un arco que gira)
        reproducirSonido('sfx-ataque-guerrero'); // <--- AÑADIDO
        const geo = new THREE.PlaneGeometry(2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
        vfxObj = new THREE.Mesh(geo, mat);
        vfxObj.position.copy(posD);
        vfxObj.lookAt(posA); // Mira al atacante para hacer el tajo
        scene.add(vfxObj);
    }
    else if (clase === 'defensor') {
        // DESTELLO (Explosión esférica)
        reproducirSonido('sfx-ataque-defensor'); // <--- AÑADIDO
        const geo = new THREE.SphereGeometry(1, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, wireframe: true });
        vfxObj = new THREE.Mesh(geo, mat);
        vfxObj.position.copy(posD);
        scene.add(vfxObj);
    }
    else if (clase === 'asesino') {
        // FLECHA (Proyectil a distancia)
        reproducirSonido('sfx-ataque-asesino'); // <--- AÑADIDO
        const geo = new THREE.ConeGeometry(0.3, 1, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff003c });
        vfxObj = new THREE.Mesh(geo, mat);
        vfxObj.position.copy(posA); // Sale del atacante
        vfxObj.lookAt(posD); // Apunta al objetivo
        vfxObj.rotateX(Math.PI / 2); // Acostamos el cono para que sea una flecha
        scene.add(vfxObj);
    }

// 3. LA ANIMACIÓN BASADA EN TIEMPO (0% a 100%)
    let tiempoInicio = Date.now(); // Guardamos el milisegundo exacto en que empezó

    const animarVFX = () => {
        if (!vfxObj) return;
        
        // Calculamos qué porcentaje de la animación llevamos (de 0.0 a 1.0)
        let progreso = (Date.now() - tiempoInicio) / tiempoAnim;
        if (progreso > 1) progreso = 1; // Tope máximo del 100%

        if (clase === 'tanque') {
            // Cae suavemente desde Y=5 hasta el pecho del enemigo (Y=1.5)
            vfxObj.position.y = THREE.MathUtils.lerp(posD.y + 4, posD.y, progreso);
        } 
        else if (clase === 'guerrero') {
            // El tajo crece de tamaño 1 a 4, y da exactamente 1 vuelta completa (Math.PI * 2)
            let escala = THREE.MathUtils.lerp(1, 4, progreso);
            vfxObj.scale.set(escala, escala, escala);
            vfxObj.rotation.z = progreso * Math.PI * 2; 
        }
        else if (clase === 'defensor') {
            // La esfera crece de 1 a 3 y se desvanece de opacidad 1 a 0
            let escala = THREE.MathUtils.lerp(1, 3, progreso);
            vfxObj.scale.set(escala, escala, escala);
            vfxObj.material.opacity = 1 - progreso; 
        }
        else if (clase === 'asesino') {
            // lerpVectors mueve el objeto desde el punto A al punto D exactamente según el % de progreso
            vfxObj.position.lerpVectors(posA, posD, progreso);
        }
    };
    
    efectosActivos.push(animarVFX);

    // 4. LIMPIAR BASURA TRAS 400ms
    setTimeout(() => {
        scene.remove(laser);
        geoLaser.dispose();
        if (vfxObj) {
            scene.remove(vfxObj);
            vfxObj.geometry.dispose();
        }
        // Lo sacamos de la lista de animaciones
        const index = efectosActivos.indexOf(animarVFX);
        if (index > -1) efectosActivos.splice(index, 1);
    }, tiempoAnim);
}

//
window.addEventListener('click', (evento) => {
    // Bloquear los clics humanos si estamos en modo 1P y es el turno del robot
    if (modoJuego === '1P' && turnoActual === 2) return;
    raton.x = (evento.clientX / window.innerWidth) * 2 - 1;
    raton.y = -(evento.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(raton, camera);

    const intersecciones = raycaster.intersectObjects([...piezasArray, planoClic], true);

    if (intersecciones.length > 0) {
        const objetoTocado = intersecciones[0].object;

        // ---------------------------------------------------------
        // CASO A: HACEMOS CLIC EN UNA PIEZA (Para Seleccionar o Atacar)
        // ---------------------------------------------------------
        if (objetoTocado.userData.esPieza || (objetoTocado.parent && objetoTocado.parent.userData.esPieza)) {
            let modeloClickeado = objetoTocado.userData.esPieza ? objetoTocado.userData.objetoRaiz : objetoTocado.parent.userData.objetoRaiz;
            
            // Si no tenemos nada seleccionado, intentamos SELECCIONARLA
            if (!piezaSeleccionada) {
                // REGLA: Solo puedes seleccionar piezas de tu turno
                if (modeloClickeado.userData.equipo === turnoActual) {
                    piezaSeleccionada = modeloClickeado;
                    modeloClickeado.position.y += 0.5; // Saltito
                    setTimeout(() => { modeloClickeado.position.y -= 0.5; }, 150);
                    console.log(`Seleccionado: ${modeloClickeado.userData.clase} (Equipo ${turnoActual})`);
                } else {
                    console.log("No es tu turno.");
                }
                return;
            } 
            
            // Si YA tenemos una pieza seleccionada y clickeamos OTRA pieza
            if (piezaSeleccionada) {
                // --- NUEVA LÓGICA: Si hacemos clic en un ALIADO, cambiamos la selección ---
                if (modeloClickeado.userData.equipo === piezaSeleccionada.userData.equipo) {
                    piezaSeleccionada = modeloClickeado; // Cambiamos el foco
                    modeloClickeado.position.y += 0.5; // Saltito del nuevo elegido
                    setTimeout(() => { modeloClickeado.position.y -= 0.5; }, 150);
                    console.log(`Cambio de selección a: ${modeloClickeado.userData.clase}`);
                    return; 
                }

                // Si es un enemigo (Equipo diferente) procedemos al ATAQUE
                if (modeloClickeado.userData.equipo !== piezaSeleccionada.userData.equipo) {
                    
                    // REGLA: Solo atacar si está ADYACENTE
                    // --- NUEVA LÓGICA DE RANGO ---
                    let rangoMaximo = CLASES[piezaSeleccionada.userData.clase].rango;
                    let tiempoDeAtaque = CLASES[piezaSeleccionada.userData.clase].tiempoAnim; // <-- Extraemos el tiempo
                    let distancia = calcularDistanciaGrid(piezaSeleccionada.userData.anillo, piezaSeleccionada.userData.segmento, modeloClickeado.userData.anillo, modeloClickeado.userData.segmento);

                    if (distancia <= rangoMaximo) {
                ejecutarAtaque(piezaSeleccionada, modeloClickeado);
            }else {
                        console.log(`El enemigo está fuera de rango. Rango del atacante: ${rangoMaximo}`);
                    }
                }
                piezaSeleccionada = null; // Deseleccionamos tras la acción
                return;
            }
        }

        // ---------------------------------------------------------
        // CASO B: HACEMOS CLIC EN LA MESA (Para Mover)
        // ---------------------------------------------------------
        // ---------------------------------------------------------
        // CASO B: HACEMOS CLIC EN LA MESA (Para Mover)
        // ---------------------------------------------------------
        // Buscamos si el rayo atravesó la mesa, sin importar si chocó con hitboxes invisibles antes
        const toqueMesa = intersecciones.find(i => i.object === planoClic);

        if (toqueMesa && piezaSeleccionada) {
            
            const p = toqueMesa.point;
            const distancia = Math.hypot(p.x, p.z);
            if (distancia > 5.5) { piezaSeleccionada = null; return; }

            let nuevoAnillo = (distancia < 1.5) ? 0 : (distancia < 3.5) ? 1 : 2;
            let angulo = Math.atan2(p.z, p.x); 
            if (angulo < 0) angulo += 2 * Math.PI; 
            let nuevoSegmento = Math.floor(angulo / (Math.PI / 6)); 

            if (nuevoAnillo === 0) nuevoSegmento = 0; 

            // REGLAS
            if (!esAdyacente(piezaSeleccionada.userData.anillo, piezaSeleccionada.userData.segmento, nuevoAnillo, nuevoSegmento)) {
                console.log("Solo puedes mover 1 casilla a la vez.");
                piezaSeleccionada = null;
                return;

            }
            if (obtenerPiezaEnCasilla(nuevoAnillo, nuevoSegmento)) {
                console.log("Casilla ocupada.");
                piezaSeleccionada = null;
                return;
            }

            // <-- AHORA USAREMOS LA NUEVA FUNCIÓN QUE CREAREMOS EN EL PASO 3 -->
            ejecutarMovimiento(piezaSeleccionada, nuevoAnillo, nuevoSegmento);
        }
    }
});


// --- FUNCIONES CORE DEL JUEGO ---

function ejecutarMovimiento(pieza, nuevoAnillo, nuevoSegmento) {
    const destinoCoords = obtenerCoordenadas(nuevoAnillo, nuevoSegmento);
    pieza.userData.destinoX = destinoCoords.x;
    pieza.userData.destinoZ = destinoCoords.z;
    pieza.userData.anillo = nuevoAnillo;
    pieza.userData.segmento = nuevoSegmento;
    pieza.lookAt(destinoCoords.x, 0, destinoCoords.z);
    
    consumirAccion(500); // 500ms de retraso para que el muñeco alcance a llegar visualmente
}

function ejecutarAtaque(atacante, defensor) {
    let tiempoDeAtaque = CLASES[atacante.userData.clase].tiempoAnim; 
    let daño = Math.max(1, atacante.userData.atk - defensor.userData.def);
    defensor.userData.hp -= daño;
    
    let maxHp = CLASES[defensor.userData.clase].maxHp;
    let porcentaje = Math.max(0, defensor.userData.hp / maxHp);
    defensor.userData.hpBarraVerde.scale.x = Math.max(0.01, porcentaje); 

    reproducirEfectoAtaque(atacante, defensor, atacante.userData.clase, tiempoDeAtaque);

    defensor.traverse((nodo) => {
        if (nodo.isMesh && nodo.material) {
            if(!nodo.userData.colorOriginal) nodo.userData.colorOriginal = nodo.material.color.getHex();
            nodo.material.color.setHex(0xff0000); 
        }
    });

    setTimeout(() => {
        if (defensor.userData.hp > 0) {
            defensor.traverse((nodo) => {
                if (nodo.isMesh && nodo.material && nodo.userData.colorOriginal) {
                    nodo.material.color.setHex(nodo.userData.colorOriginal);
                }
            });
        } else {
            reproducirSonido('sfx-muerte');
            scene.remove(defensor);
            if (defensor.parent) scene.remove(defensor.parent);
            piezasArray.splice(piezasArray.indexOf(defensor), 1);
            verificarVictoria();
        }
    }, tiempoDeAtaque);

    consumirAccion(tiempoDeAtaque); // Espera a que termine la animación antes de seguir el turno
}

// Nueva versión de consumir Acción que permite retrasos (tiempoEspera)
function consumirAccion(tiempoEspera = 0) {
    setTimeout(() => {
        accionesRestantes--;
        piezaSeleccionada = null; 
        
        if (accionesRestantes <= 0) {
            finalizarTurno();
        } else if (modoJuego === '1P' && turnoActual === 2) {
            IA_jugarTurno(); // Si le queda 1 acción a la CPU, que la ejecute
        }
    }, tiempoEspera);
}

// --- EL CEREBRO DE LA CPU ---
function IA_jugarTurno() {
    if (accionesRestantes <= 0 || piezasArray.length === 0) return;

    // Pequeña pausa para que parezca que está "pensando"
    setTimeout(() => {
        let equipoCPU = piezasArray.filter(p => p.userData.equipo === 2);
        let equipoJugador = piezasArray.filter(p => p.userData.equipo === 1 && p.userData.hp > 0);

        if (equipoCPU.length === 0 || equipoJugador.length === 0) return;

        // 1. ¿PUEDO ATACAR A ALGUIEN?
        let ataco = false;
        // Mezclamos a la CPU para que no ataque siempre con el mismo
        equipoCPU.sort(() => 0.5 - Math.random()); 

        for (let atacante of equipoCPU) {
            for (let victima of equipoJugador) {
                let dist = calcularDistanciaGrid(atacante.userData.anillo, atacante.userData.segmento, victima.userData.anillo, victima.userData.segmento);
                if (dist <= CLASES[atacante.userData.clase].rango) {
                    piezaSeleccionada = atacante; // Visulamente se selecciona
                    console.log("IA decide ATACAR");
                    ejecutarAtaque(atacante, victima);
                    ataco = true;
                    break;
                }
            }
            if (ataco) break;
        }

        // 2. SI NO PUEDE ATACAR, SE MUEVE
        if (!ataco) {
            let piezaMóvil = equipoCPU[0]; // Como lo mezclamos arriba, es al azar
            piezaSeleccionada = piezaMóvil;
            
            // Buscamos a dónde puede ir
            let movimientosPosibles = [];
            for(let a=0; a<=2; a++) {
                let maxS = (a===0) ? 0 : 11;
                for(let s=0; s<=maxS; s++) {
                    if (esAdyacente(piezaMóvil.userData.anillo, piezaMóvil.userData.segmento, a, s) && !obtenerPiezaEnCasilla(a, s)) {
                        movimientosPosibles.push({anillo: a, segmento: s});
                    }
                }
            }

            if (movimientosPosibles.length > 0) {
                // Ordenamos los movimientos para preferir acercarse al centro
                movimientosPosibles.sort((m1, m2) => {
                    let distA = calcularDistanciaGrid(m1.anillo, m1.segmento, 0, 0);
                    let distB = calcularDistanciaGrid(m2.anillo, m2.segmento, 0, 0);
                    return distA - distB;
                });
                
                console.log("IA decide MOVER");
                ejecutarMovimiento(piezaMóvil, movimientosPosibles[0].anillo, movimientosPosibles[0].segmento);
            } else {
                // Si está atrapada, pierde la acción
                consumirAccion(500); 
            }
        }
    }, 800); // 0.8 seg de "pensamiento"
}

// Función que cambia de equipo realmente
function finalizarTurno() {
    accionesRestantes = 2; // Reseteamos las acciones para el siguiente jugador
    turnoActual = turnoActual === 1 ? 2 : 1;
    console.log(`--- TURNO DEL EQUIPO ${turnoActual} ---`);
    
    // --- NUEVO: SISTEMA DE DOMINIO CONTINUO ---
    const piezaEnCentro = obtenerPiezaEnCasilla(0, 0); // Revisamos si hay alguien en el centro
    
    if (piezaEnCentro) {
        // Si hay una pieza, sumamos 1 punto a su equipo
        let equipoStr = piezaEnCentro.userData.equipo === 1 ? 'equipo1' : 'equipo2';
        turnosEnCentro[equipoStr]++;
        console.log(`Dominio: El Equipo ${piezaEnCentro.userData.equipo} lleva ${turnosEnCentro[equipoStr]} / 12 turnos`);
        //Contador de turnos de dominio
        if (turnosEnCentro[equipoStr] >= 12) {
            mostrarVictoria(`¡EL EQUIPO ${piezaEnCentro.userData.equipo === 1 ? 'AZUL' : 'ROJO'} GANA POR DOMINIO!`);
        }
    } else {
        // Si el centro está vacío (nadie entró, o la pieza salió/murió), el contador se resetea a 0
        turnosEnCentro = { equipo1: 0, equipo2: 0 };
    }
    // Si estamos en 1 Jugador y le toca al Rojo (CPU)
    if (modoJuego === '1P' && turnoActual === 2) {
        IA_jugarTurno(); // Despertar al cerebro de la CPU
    }
}
// Función para restar acciones y chequear si el turno termina
//function consumirAccion() {
//    accionesRestantes--;
//    piezaSeleccionada = null; // Deseleccionamos para obligar a elegir de nuevo (o la misma)
//    console.log(`Acciones restantes: ${accionesRestantes}`);
//    
//    if (accionesRestantes <= 0) {
//        finalizarTurno();
//    }
//}

// ==========================================
// 9. BUCLE DE ANIMACIÓN
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
        // Girar la corona central
    if (typeof coronaDiamante !== 'undefined') {
        coronaDiamante.rotation.y += 0.01;
        coronaDiamante.rotation.x += 0.01;
    }
    //modelo gira
    if (modeloPreview) {
        modeloPreview.rotation.y += 0.02; // Hace girar el modelo del menú
    }


    // --- MOTOR DE MOVIMIENTO SUAVE ---
    piezasArray.forEach(pieza => {
        if(pieza.userData.destinoX !== undefined) {
            // Se desliza un 10% de la distancia en cada frame
            pieza.position.x = THREE.MathUtils.lerp(pieza.position.x, pieza.userData.destinoX, 0.1);
            pieza.position.z = THREE.MathUtils.lerp(pieza.position.z, pieza.userData.destinoZ, 0.1);
        }
        // Hacer que la barra de vida siempre mire a tu pantalla (Billboard)
        if(pieza.userData.hpContenedor) {
            pieza.userData.hpContenedor.lookAt(camera.position);
        }
    });
    efectosActivos.forEach(efecto => efecto());
    controls.update(); 
    renderer.render(scene, camera); 
}
animate();
// Iniciar!
//animate();