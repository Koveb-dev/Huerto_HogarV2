// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
    authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
    projectId: "tiendahuertohogar-2ce3a",
    storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
    messagingSenderId: "857983411223",
    appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
    measurementId: "G-TX342PY82Y"
};

// Inicializar Firebase solo si no está inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Inicializar Firestore
const db = firebase.firestore();

//Validación del correo
function validarCorreo(correo) {
    const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    return regex.test(correo);
}

//Validación del run
function validarRun(run) {
    const regex = /^[0-9]{8}[0-9K]$/;
    return regex.test(run);
}

//Validación de edad minima 18 años
function esMayorEdad(fecha) {
    const hoy = new Date();
    const fechaNacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad >= 18;
}

// Función para verificar si el RUN ya existe en Firestore
async function verificarRunExistente(run) {
    try {
        const usuariosRef = db.collection('usuario'); // Cambiado a 'usuario' (singular)
        const querySnapshot = await usuariosRef.where('run', '==', run).get();
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error verificando RUN:', error);
        return false;
    }
}

// Función para verificar si el correo ya existe en Firestore
async function verificarCorreoExistente(correo) {
    try {
        const usuariosRef = db.collection('usuario'); // Cambiado a 'usuario' (singular)
        const querySnapshot = await usuariosRef.where('correo', '==', correo).get();
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error verificando correo:', error);
        return false;
    }
}

// Función para registrar usuario en Firestore
async function registrarUsuarioEnFirestore(usuario) {
    try {
        // Agregar campos adicionales
        usuario.fechaRegistro = new Date().toISOString();
        usuario.activo = true;

        // Determinar rol basado en correo (como en login.js)
        if (usuario.correo === "admin@tiendahuerto.cl") {
            usuario.rol = "admin";
        } else {
            usuario.rol = "cliente";
        }

        usuario.carrito = [];

        // Guardar en Firestore - usando 'usuario' (singular) para coincidir con login.js
        const docRef = await db.collection('usuario').add(usuario);

        // Devolver el ID del documento creado
        return {
            success: true,
            message: `Usuario registrado exitosamente con ID: ${docRef.id}`,
            id: docRef.id
        };
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return {
            success: false,
            message: `Error al registrar usuario: ${error.message}`
        };
    }
}

// Función para mostrar mensajes estilizados
function mostrarMensaje(mensaje, tipo = 'error') {
    const mensajeDiv = document.getElementById("mensaje");

    if (!mensajeDiv) {
        console.log("Mensaje:", mensaje, "Tipo:", tipo);
        return;
    }

    // Limpiar y estilizar el div
    mensajeDiv.innerText = mensaje;
    mensajeDiv.style.padding = "10px";
    mensajeDiv.style.borderRadius = "5px";
    mensajeDiv.style.marginTop = "10px";
    mensajeDiv.style.textAlign = "center";
    mensajeDiv.style.fontWeight = "600";

    if (tipo === 'success') {
        mensajeDiv.style.backgroundColor = "#d4edda";
        mensajeDiv.style.color = "#155724";
        mensajeDiv.style.border = "1px solid #c3e6cb";
    } else {
        mensajeDiv.style.backgroundColor = "#f8d7da";
        mensajeDiv.style.color = "#721c24";
        mensajeDiv.style.border = "1px solid #f5c6cb";
    }
}

// Función para limpiar formulario
function limpiarFormulario() {
    document.getElementById("run").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("clave").value = "";
    document.getElementById("fecha").value = "";
}

// Función para crear usuario también en Firebase Auth (opcional, pero recomendado)
async function crearUsuarioAuth(correo, clave) {
    try {
        await firebase.auth().createUserWithEmailAndPassword(correo, clave);
        return { success: true };
    } catch (error) {
        console.error("Error creando usuario en Auth:", error);
        return {
            success: false,
            message: error.message
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js cargado");

    // Verificar si estamos en la página de registro (tiene el formulario)
    const formUsuario = document.getElementById("formUsuario");
    if (!formUsuario) {
        console.log("No se encontró formUsuario, probablemente no estamos en la página de registro");
        return;
    }

    console.log("Formulario de registro encontrado");

    const runInput = document.getElementById("run");
    const nombreInput = document.getElementById("nombre");
    const correoInput = document.getElementById("correo");
    const claveInput = document.getElementById("clave");
    const fechaInput = document.getElementById("fecha");
    const mensaje = document.getElementById("mensaje");

    // Limpiar los input y mensajes flotantes automáticamente
    [runInput, nombreInput, correoInput, fechaInput, claveInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                input.setCustomValidity("");
                if (mensaje) mensaje.innerText = "";
            });
        }
    });

    // Manejar el envío del formulario
    formUsuario.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Formulario enviado");

        // Limpiar mensajes previos
        if (mensaje) mensaje.innerText = "";

        // La validación correcta del run
        runInput.value = runInput.value.trim().toUpperCase();

        // Guardar los valores de los input
        const run = runInput.value;
        const nombre = nombreInput.value.trim();
        const correo = correoInput.value.trim();
        const clave = claveInput ? claveInput.value : "";
        const fecha = fechaInput.value;

        console.log("Datos capturados:", { run, nombre, correo, fecha });

        // Validación Run
        if (!validarRun(run)) {
            runInput.setCustomValidity("El RUN es incorrecto. Debe tener 8 dígitos + número o K verificador");
            runInput.reportValidity();
            return;
        }

        // Validación Nombre
        if (nombre === "") {
            nombreInput.setCustomValidity("El nombre es obligatorio");
            nombreInput.reportValidity();
            return;
        }

        // Validación correo - Actualizado para coincidir con login.js
        const correoValido = correo === "admin@tiendahuerto.cl" || validarCorreo(correo);
        if (!correoValido) {
            correoInput.setCustomValidity("El correo debe ser '@duoc.cl', '@profesor.duoc.cl', '@gmail.com' o 'admin@tiendahuerto.cl'");
            correoInput.reportValidity();
            return;
        }

        // Validación de Clave (si existe)
        if (claveInput && clave.length < 4) {
            claveInput.setCustomValidity("La clave debe tener al menos 4 caracteres");
            claveInput.reportValidity();
            return;
        }

        // Validación de Edad
        if (!esMayorEdad(fecha)) {
            fechaInput.setCustomValidity("Debe ser mayor a 18 años para registrarse");
            fechaInput.reportValidity();
            return;
        }

        // Mostrar indicador de carga
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Registrando...';
        submitBtn.disabled = true;

        try {
            console.log("Verificando RUN existente...");
            // Verificar si el RUN ya existe
            const runExiste = await verificarRunExistente(run);
            if (runExiste) {
                runInput.setCustomValidity("Este RUN ya está registrado");
                runInput.reportValidity();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            console.log("Verificando correo existente...");
            // Verificar si el correo ya existe
            const correoExiste = await verificarCorreoExistente(correo);
            if (correoExiste) {
                correoInput.setCustomValidity("Este correo ya está registrado");
                correoInput.reportValidity();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Crear objeto usuario (sin el campo 'clave' si es admin@tiendahuerto.cl)
            const usuario = {
                run: run,
                nombre: nombre,
                correo: correo,
                fechaNacimiento: fecha
            };

            // Solo agregar clave si no es el admin (porque admin usa Firebase Auth)
            if (correo !== "admin@tiendahuerto.cl") {
                usuario.clave = clave;
            }

            console.log("Registrando usuario en Firestore...");
            // Registrar en Firestore
            const resultado = await registrarUsuarioEnFirestore(usuario);

            if (resultado.success) {
                console.log("Usuario registrado exitosamente en Firestore");
                mostrarMensaje("✅ Usuario registrado exitosamente", "success");

                // Si es el admin, también crearlo en Firebase Auth
                if (correo === "admin@tiendahuerto.cl") {
                    console.log("Creando usuario admin en Firebase Auth...");
                    const authResult = await crearUsuarioAuth(correo, clave);
                    if (!authResult.success) {
                        mostrarMensaje(` Usuario creado en Firestore pero error en Auth: ${authResult.message}`, "error");
                    }
                }

                // Limpiar formulario después de éxito
                limpiarFormulario();

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    // Determinar destino según el rol
                    let destino = "";
                    if (correo === "admin@tiendahuerto.cl") {
                        destino = `assets/page/perfilAdmin.html?nombre=${encodeURIComponent(nombre)}&id=${resultado.id}`;
                    } else {
                        destino = `assets/page/perfilCliente.html?nombre=${encodeURIComponent(nombre)}&id=${resultado.id}`;
                    }
                    console.log("Redirigiendo a:", destino);
                    window.location.href = destino;
                }, 2000);
            } else {
                mostrarMensaje(` Error: ${resultado.message}`, "error");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }

        } catch (error) {
            console.error("Error en el proceso de registro:", error);
            mostrarMensaje(` Error: ${error.message}`, "error");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Verificar conexión a Firebase
    verificarConexionFirebase();
});

// Función para verificar conexión a Firebase
async function verificarConexionFirebase() {
    try {
        await db.collection('usuario').get();
        console.log(' Conexión a Firebase establecida correctamente');
        return true;
    } catch (error) {
        console.error(' Error de conexión a Firebase:', error);
        return false;
    }
}

// Función para obtener todos los usuarios (útil para debugging)
async function obtenerTodosUsuarios() {
    try {
        const querySnapshot = await db.collection('usuario').get();
        const usuarios = [];
        querySnapshot.forEach(doc => {
            usuarios.push({ id: doc.id, ...doc.data() });
        });
        console.log('Usuarios registrados:', usuarios);
        return usuarios;
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
    }
}

// Función para verificar si la colección 'usuario' existe y crear un documento de prueba
async function verificarColeccionUsuario() {
    try {
        console.log("Verificando colección 'usuario'...");

        // Intentar agregar un documento de prueba
        const testRef = db.collection('usuario').doc('test_connection');
        await testRef.set({
            test: true,
            timestamp: new Date().toISOString(),
            mensaje: "Conexión exitosa"
        });
        console.log(" Documento de prueba creado en colección 'usuario'");

        // Eliminar el documento de prueba
        await testRef.delete();
        console.log(" Documento de prueba eliminado");

        return true;
    } catch (error) {
        console.error(" Error con colección 'usuario':", error);
        return false;
    }
}

// Para debugging: ejecutar cuando la página cargue
window.onload = async function () {
    console.log("=== DEBUGGING FIREBASE ===");

    // Verificar Firebase inicializado
    if (firebase.apps.length > 0) {
        console.log(" Firebase está inicializado");
    } else {
        console.error(" Firebase NO está inicializado");
    }

    // Verificar conexión
    await verificarConexionFirebase();

    // Verificar colección
    await verificarColeccionUsuario();

    // Mostrar usuarios existentes
    await obtenerTodosUsuarios();

    console.log("=== FIN DEBUGGING ===");
};