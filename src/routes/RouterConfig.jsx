import { Route, Switch } from "react-router-dom";
import Home from "../components/pages/Home";
import PerfilAdmin from "../components/pages/PerfilAdmin";
import PerfilCliente from "../components/pages/PerfilCliente";
import Header from "../components/organisms/Header";
import Catalogo from "../components/pages/Catalogo";
import Carrito from "../components/pages/Carrito";
import Checkout from "../components/pages/Checkout";
import Exito from "../components/pages/Exito";
import ErrorPago from "../components/pages/ErrorPago";
import Nosotros from "../components/pages/Nosotros";
import Contacto from "../components/pages/Contacto";
import Login from "../components/pages/Login";
import LoginWrapper from "../components/pages/LoginWrapper";
import Oferta from "../components/pages/Ofertas";

const RouterConfig = () => (
    <>
        <LoginWrapper /> {/* ✅ Agregar LoginWrapper aquí */}
        <Header />
        <Switch>
            <Route exact path="/" component={Home} />
            
            {/* Rutas de Autenticación */}
            <Route path="/login" component={Login} />
            <Route path="/registro" component={() => {
                window.location.href = '/assets/page/registro.html';
                return null;
            }} />

            {/* Rutas de Perfil */}
            <Route path="/perfil-admin" component={PerfilAdmin} />
            <Route path="/perfil-cliente" component={PerfilCliente} />

            {/* Rutas del Sistema */}
            <Route path="/catalogo" component={Catalogo} />
            <Route path="/carrito" component={Carrito} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/exito" component={Exito} />
            <Route path="/error" component={ErrorPago} />
            <Route path="/nosotros" component={Nosotros} />
            <Route path="/contacto" component={Contacto} />
            <Route path="/ofertas" component={Oferta} />
        </Switch>
    </>
);

export default RouterConfig;