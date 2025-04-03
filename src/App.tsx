import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Addtenant from "./pages/main/Addtenant";
import Viewtenant from "./pages/main/Viewtenant";
import Dashboard from "./mainpage/dashboard";
import Units from "./mainpage/units";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register" element={<Register />} />
          <Route path="/addtenant" element={<Addtenant />} /> 
          <Route path="/viewtenant" element={<Viewtenant />}/>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/units" element={<Units/>} />
      </Routes>
    </Router>
    
  );
};

  export default App;
