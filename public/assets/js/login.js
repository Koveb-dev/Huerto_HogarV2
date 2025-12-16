document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");
    const correoInput = document.getElementById("correoLogin");
    const claveInput = document.getElementById("claveLogin");
    const mensaje = document.getElementById("mensajeLogin");
    const loginCard = document.querySelector('.login-card');

    if (!form) return console.error("No se encontró #formLogin");

    // Aplicar animación al cargar
    setTimeout(() => {
        if (loginCard) loginCard.classList.add('animate');
    }, 100);

    // Inicializar Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
        authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
        projectId: "tiendahuertohogar-2ce3a",
        storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
        messagingSenderId: "857983411223",
        appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
        measurementId: "G-TX342PY82Y"
    };
    if (!firebase.apps?.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.innerText = "";
        mensaje.classList.add("d-none");

        const correo = correoInput.value.trim().toLowerCase();
        const clave = claveInput.value;

        if (!correo || !clave) {
            mensaje.classList.remove("d-none");
            mensaje.classList.remove("alert-success");
            mensaje.classList.add("alert-danger");
            mensaje.innerText = "Debes completar correo y clave";
            return;
        }

        // Admin: autenticar con Firebase Auth
        if (correo === "admin@tiendahuerto.cl") {
            try {
                await auth.signInWithEmailAndPassword(correo, clave);
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                mensaje.classList.remove("d-none", "alert-danger");
                mensaje.classList.add("alert-success");
                mensaje.innerText = "Bienvenido Administrador, redirigiendo...";
                setTimeout(() => window.location.href = `perfilAdmin.html`, 1000);
            } catch (error) {
                console.error("Error login admin:", error);
                mensaje.classList.remove("d-none", "alert-success");
                mensaje.classList.add("alert-danger");
                mensaje.innerText = "Credenciales incorrectas para administrador";
            }
            return;
        }

        // Intentar autenticación con Firebase Auth (para vendedores y clientes registrados en Auth)
        let credential = null;
        try {
            credential = await auth.signInWithEmailAndPassword(correo, clave);
        } catch (error) {
            console.warn("No se pudo autenticar en Firebase Auth, se probará el método legacy de clientes", error);
        }

        if (credential?.user) {
            const user = credential.user;
            const baseUsuario = {
                uid: user.uid,
                nombre: user.displayName || correo,
                correo
            };

            // 1) ¿Es vendedor?
            try {
                const vendedorDoc = await db.collection("vendedores").doc(user.uid).get();
                if (vendedorDoc.exists) {
                    const data = vendedorDoc.data();
                    const usuario = {
                        ...baseUsuario,
                        nombre: data.nombre || baseUsuario.nombre,
                        rol: "vendedor"
                    };
                    localStorage.setItem("usuario", JSON.stringify(usuario));

                    mensaje.classList.remove("d-none", "alert-danger");
                    mensaje.classList.add("alert-success");
                    mensaje.innerText = "Bienvenido Vendedor, redirigiendo...";
                    setTimeout(() => window.location.href = `perfilVendedor.html`, 1000);
                    return;
                }
            } catch (error) {
                console.error("Error verificando rol vendedor:", error);
            }

            // 2) ¿Tiene perfil en colección usuario?
            try {
                const querySnapshot = await db.collection("usuario")
                    .where("uid", "==", user.uid)
                    .limit(1)
                    .get();

                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    const rol = userData.rol || "cliente";
                    const usuario = {
                        ...baseUsuario,
                        nombre: userData.nombre || baseUsuario.nombre,
                        rol
                    };
                    localStorage.setItem("usuario", JSON.stringify(usuario));

                    const destino =
                        rol === "admin"
                            ? "perfilAdmin"
                            : rol === "vendedor"
                                ? "perfilVendedor"
                                : "perfilCliente";

                    mensaje.classList.remove("d-none", "alert-danger");
                    mensaje.classList.add("alert-success");
                    mensaje.innerText = `Bienvenido ${rol === "admin" ? "Administrador" : rol === "vendedor" ? "Vendedor" : "Cliente"}, redirigiendo...`;
                    setTimeout(() => window.location.href = `${destino}.html`, 1000);
                    return;
                }
            } catch (error) {
                console.error("Error obteniendo perfil de usuario:", error);
            }

            // Si llegó aquí es porque inició sesión en Auth pero no tiene rol asignado
            mensaje.classList.remove("d-none", "alert-success");
            mensaje.classList.add("alert-danger");
            mensaje.innerText = "No se encontró un perfil asociado a tu cuenta. Contacta a soporte.";
            return;
        }

        // LEGACY: Cliente validado directamente en Firestore (sin Auth)
        try {
            const query = await db.collection("usuario")
                .where("correo", "==", correo)
                .where("clave", "==", clave)
                .limit(1)
                .get();

            if (!query.empty) {
                const userData = query.docs[0].data();
                const nombre = userData.nombre || correo;
                const rol = userData.rol || "cliente";

                const usuario = { nombre, correo, rol, uid: userData.uid || null };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                const destino =
                    rol === "admin"
                        ? "perfilAdmin"
                        : rol === "vendedor"
                            ? "perfilVendedor"
                            : "perfilCliente";

                mensaje.classList.remove("d-none", "alert-danger");
                mensaje.classList.add("alert-success");
                mensaje.innerText = `Bienvenido ${rol === "admin" ? "Administrador" : rol === "vendedor" ? "Vendedor" : "Cliente"}, redirigiendo...`;
                setTimeout(() => window.location.href = `${destino}.html`, 1000);
            } else {
                mensaje.classList.remove("d-none", "alert-success");
                mensaje.classList.add("alert-danger");
                mensaje.innerText = "Correo o clave incorrectos";
            }
        } catch (error) {
            console.error("Error login cliente:", error);
            mensaje.classList.remove("d-none", "alert-success");
            mensaje.classList.add("alert-danger");
            mensaje.innerText = "Error al verificar usuario";
        }
    });
});