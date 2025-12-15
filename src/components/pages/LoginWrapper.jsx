import { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext";
import { useHistory } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getUserProfile } from "../../services/firebase";

// Componente que revisa la autenticación de Firebase y actualiza el contexto
const LoginWrapper = () => {
    const { setUser, setUserProfile } = useContext(UserContext);
    const history = useHistory();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuario autenticado con Firebase
                setUser(user);
                
                // Obtener perfil adicional desde Firestore (colección usuario)
                const profileResult = await getUserProfile(user.uid);
                let finalProfile = profileResult.success ? profileResult.data : null;

                // Fallback: verificar colección vendedores (id = uid o campo uid) para rol vendedor
                if (!finalProfile || !finalProfile.rol) {
                    try {
                        const vendSnap = await getDoc(doc(db, "vendedores", user.uid));
                        if (vendSnap.exists()) {
                            finalProfile = { ...vendSnap.data(), rol: "vendedor", uid: user.uid };
                        } else {
                            const q = query(
                                collection(db, "vendedores"),
                                where("uid", "==", user.uid),
                                limit(1)
                            );
                            const snap = await getDocs(q);
                            if (!snap.empty) {
                                const data = snap.docs[0].data();
                                finalProfile = { ...data, rol: "vendedor", uid: user.uid };
                            }
                        }
                    } catch (e) {
                        // ignorar y seguir
                    }
                }

                if (finalProfile) {
                    setUserProfile(finalProfile);
                    
                    // Redirigir según el rol (admin | vendedor | cliente)
                    const rol = finalProfile.rol;
                    if (rol === "admin") {
                        history.push("/perfil-admin");
                    } else if (rol === "vendedor") {
                        history.push("/perfil-vendedor");
                    } else {
                        history.push("/perfil-cliente");
                    }
                } else {
                    // Si no hay perfil, redirigir a perfil-cliente por defecto
                    history.push("/perfil-cliente");
                }
            } else {
                // No hay usuario autenticado
                setUser(null);
                setUserProfile(null);
                
                // Opcional: Redirigir al login si no está autenticado
                // history.push("/login");
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [setUser, setUserProfile, history]);

    return null; // No renderiza nada
};

export default LoginWrapper;