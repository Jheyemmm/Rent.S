  import React from "react";
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import Addtenant from "./pages/main/Addtenant";
  import Viewtenant from "./pages/main/Viewtenant";

  const App: React.FC = () => {
    return (
      <Router>  
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/addtenant" element={<Addtenant />} /> 
          <Route path="/viewtenant" element={<Viewtenant />}/>
        </Routes>
      </Router>
      
    );
  };

  export default App;
