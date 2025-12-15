import { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext";
import { useHistory } from "react-router-dom";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
                
                // Obtener perfil adicional desde Firestore
                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success) {
                    setUserProfile(profileResult.data);
                    
                    // Redirigir según el rol (admin | vendedor | cliente)
                    const rol = profileResult.data.rol;
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