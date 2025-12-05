import { db, auth } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

const coleccionOfertasRef = collection(db, 'ofertas');
// Función existente - mantener
export async function addUser(user) {
  try {
    const docRef = await addDoc(collection(db, "usuario"), {
      ...user,
      createdAt: new Date(),
    });
    console.log("Usuario registrado con ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al registrar usuario: ", error);
    return error;
  }
}

// NUEVAS FUNCIONALIDADES

// Gestión de Autenticación
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Guardar en la colección 'usuario' (tu estructura actual)
    await addDoc(collection(db, "usuario"), {
      uid: userCredential.user.uid,
      email: email,
      displayName: userData.displayName,
      ...userData,
      createdAt: new Date(),
    });

    // Actualizar perfil de autenticación
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = () => signOut(auth);

// Gestión de Perfil
export const updateUserProfile = async (userId, updates) => {
  try {
    // Buscar el documento del usuario por uid
    const usersQuery = query(collection(db, "usuario"), where("uid", "==", userId));
    const querySnapshot = await getDocs(usersQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "usuario", userDoc.id), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } else {
      return { success: false, error: "Usuario no encontrado" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const usersQuery = query(collection(db, "usuario"), where("uid", "==", userId));
    const querySnapshot = await getDocs(usersQuery);

    if (!querySnapshot.empty) {
      return { success: true, data: querySnapshot.docs[0].data() };
    } else {
      return { success: false, error: "Usuario no encontrado" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Gestión de Carrito
export const saveCartToFirestore = async (userId, cart) => {
  try {
    await setDoc(doc(db, "carts", userId), {
      items: cart,
      updatedAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCartFromFirestore = async (userId) => {
  try {
    const cartDoc = await getDoc(doc(db, "carts", userId));
    if (cartDoc.exists()) {
      return { success: true, data: cartDoc.data().items || [] };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Gestión de Contacto
export const addContactMessage = async (contactData) => {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...contactData,
      createdAt: new Date(),
      status: 'nuevo'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener Ofertas
export const getOfertas = async () => {
  try {
    const q = query(collection(db, "products"), where("onSale", "==", true));
    const querySnapshot = await getDocs(q);
    const ofertas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: ofertas };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const crearOferta = async (datosOferta, idProducto) => {
  try {
    // 1. Verificar si el producto existe
    const docProductoRef = doc(coleccionProductosRef, idProducto); // Usando coleccionProductosRef
    const snapshotProducto = await getDoc(docProductoRef);

    if (!snapshotProducto.exists()) {
      return { exito: false, error: `El producto con ID ${idProducto} no existe.` };
    }

    // 2. Crear el objeto de la oferta con la referencia al producto
    const nuevaOferta = {
      ...datosOferta,
      referenciaProducto: docProductoRef // Guarda la referencia al documento del producto
    };

    // 3. Añadir la oferta a la colección 'ofertas'
    const referenciaDoc = await addDoc(coleccionOfertasRef, nuevaOferta); // Usando coleccionOfertasRef
    console.log("Oferta creada con ID: ", referenciaDoc.id);
    return { exito: true, id: referenciaDoc.id };
  } catch (error) {
    console.error("Error al crear la oferta: ", error);
    return { exito: false, error: error.message };
  }
};

/**
 * Obtiene una oferta específica por su ID, incluyendo los detalles del producto asociado.
 * @param {string} idOferta - ID de la oferta a buscar.
 * @returns {Object} { exito: boolean, datos?: Object, error?: string }
 */
export const obtenerOfertaConDetallesProducto = async (idOferta) => {
  try {
    const docOfertaRef = doc(coleccionOfertasRef, idOferta); // Usando coleccionOfertasRef
    const snapshotOferta = await getDoc(docOfertaRef);

    if (!snapshotOferta.exists()) {
      return { exito: false, error: "Oferta no encontrada." };
    }

    const datosOferta = snapshotOferta.data();
    const ofertaCompleta = { id: snapshotOferta.id, ...datosOferta };

    // 2. Resolver la referencia al producto
    if (datosOferta.referenciaProducto && datosOferta.referenciaProducto.path) { // Asegurarse que es una referencia válida
      const snapshotProducto = await getDoc(datosOferta.referenciaProducto);
      if (snapshotProducto.exists()) {
        ofertaCompleta.producto = { id: snapshotProducto.id, ...snapshotProducto.data() };
      } else {
        ofertaCompleta.producto = null; // Producto asociado no encontrado
        console.warn(`Producto con referencia ${datosOferta.referenciaProducto.path} no encontrado para la oferta ${idOferta}`);
      }
    } else {
      ofertaCompleta.producto = null; // No hay referencia de producto válida
    }

    return { exito: true, datos: ofertaCompleta };
  } catch (error) {
    console.error("Error al obtener detalles de la oferta: ", error);
    return { exito: false, error: error.message };
  }
};

/**
 * Obtiene todas las ofertas activas de la colección 'ofertas', incluyendo los detalles de sus productos asociados.
 * @returns {Object} { exito: boolean, datos?: Array<Object>, error?: string }
 */
export const obtenerOfertas = async () => { // Función que reemplaza tu 'getOfertas' anterior
  try {
    // Consulta las ofertas activas. Si no tienes el campo 'activo', puedes omitir el where.
    const consulta = query(coleccionOfertasRef, where("activo", "==", true)); // Usando coleccionOfertasRef
    const snapshotConsulta = await getDocs(consulta);
    const listaOfertas = [];

    for (const snapshotDoc of snapshotConsulta.docs) {
      const datosOferta = snapshotDoc.data();
      const ofertaCompleta = { id: snapshotDoc.id, ...datosOferta };

      // 2. Resolver la referencia al producto para cada oferta
      if (datosOferta.referenciaProducto && datosOferta.referenciaProducto.path) {
        const snapshotProducto = await getDoc(datosOferta.referenciaProducto);
        if (snapshotProducto.exists()) {
          ofertaCompleta.producto = { id: snapshotProducto.id, ...snapshotProducto.data() };
        } else {
          ofertaCompleta.producto = null; // Producto asociado no encontrado
          console.warn(`Producto con referencia ${datosOferta.referenciaProducto.path} no encontrado para la oferta ${snapshotDoc.id}`);
        }
      } else {
        ofertaCompleta.producto = null; // No hay referencia de producto válida
      }
      listaOfertas.push(ofertaCompleta);
    }
    return { exito: true, datos: listaOfertas };
  } catch (error) {
    console.error("Error al obtener ofertas: ", error);
    return { exito: false, error: error.message };
  }
};
