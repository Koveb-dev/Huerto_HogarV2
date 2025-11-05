import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "../components/pages/Home";
import PerfilAdmin from "../components/pages/PerfilAdmin";
import PerfilCliente from "../components/pages/PerfilCliente";



import Catalogo from "../components/pages/Catalogo";
import Carrito from "../components/pages/Carrito";
import Checkout from "../components/pages/Checkout";
import CompraExitosa from "../components/pages/"

const RouterConfig = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/perfil-admin" component={PerfilAdmin} />
            <Route path="/perfil-cliente" component={PerfilCliente} />
        </Switch>
    </Router>
);

export default RouterConfig;
