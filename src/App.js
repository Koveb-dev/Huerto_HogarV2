import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouterConfig from "./routes/RouterConfig";

function App() {
  return (
    <UserProvider> {/* Agregamos UserProvider para envolver la app y y proporcionar el contexto de usuario*/}
      <Router>
        <RouterConfig />
      </Router>
    </UserProvider>
  );
}

export default App;
