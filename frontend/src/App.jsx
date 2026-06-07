import { useState } from "react";

import Navbar from "./components/Navbar.jsx"
import LiveView from './views/LiveView.jsx';
import SessionsView from "./views/SessionsView.jsx";

function App() {
  const [activeTab, setActiveTab] = useState("Live"); // Options: "Live" or "Sessions"
  const [capturing, setCapturing] = useState(false); 

  return (
    <>
      <Navbar activeTab={activeTab} switchTab={setActiveTab} capturing={capturing}/>
      {activeTab === "Live" ? (
        <LiveView capturing={capturing} setCapturing={setCapturing}></LiveView>
      ) : (
        <SessionsView/>
      )}
    </>
  )
}

export default App
