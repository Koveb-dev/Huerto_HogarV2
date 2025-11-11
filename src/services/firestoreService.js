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