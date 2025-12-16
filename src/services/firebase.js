import { db, auth } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  loginUser,
  registerUser,
  logoutUser,
  saveCartToFirestore,
  getCartFromFirestore,
  addContactMessage,
  getOfertas
} from "./firestoreService";

const findUserDoc = async (userId) => {
  const usersQuery = query(collection(db, "usuario"), where("uid", "==", userId));
  const snapshot = await getDocs(usersQuery);
  return snapshot.empty ? null : snapshot.docs[0];
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userDoc = await findUserDoc(userId);
    if (!userDoc) return { success: false, error: "Usuario no encontrado" };

    await updateDoc(doc(db, "usuario", userDoc.id), {
      ...updates,
      updatedAt: new Date()
    });

    if (auth.currentUser && updates.displayName) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userDoc = await findUserDoc(userId);
    if (!userDoc) return { success: false, error: "Usuario no encontrado" };

    await setDoc(doc(db, "usuario", userDoc.id), { preferences }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, "pedidos"),
      where("usuarioId", "==", userId),
      orderBy("fecha", "desc")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => {
      const raw = d.data();
      return {
        id: d.id,
        ...raw,
        date: raw.fecha || raw.date || null,
        status: raw.estado || raw.status || ""
      };
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const q = query(collection(db, "direcciones"), where("usuarioId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addUserAddress = async (userId, address) => {
  try {
    await addDoc(collection(db, "direcciones"), {
      usuarioId: userId,
      ...address,
      fechaCreacion: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const q = query(collection(db, "wishlist"), where("usuarioId", "==", userId));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await findUserDoc(userId);
    if (!userDoc) return { success: false, error: "Usuario no encontrado" };
    return { success: true, data: userDoc.data() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  saveCartToFirestore,
  getCartFromFirestore,
  addContactMessage,
  getOfertas,
  addUserAddress
};

