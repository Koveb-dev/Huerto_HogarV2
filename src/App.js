import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouterConfig from "./routes/RouterConfig";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <RouterConfig />
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;