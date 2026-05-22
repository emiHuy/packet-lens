import { useState } from "react";
import Navbar from "./components/Navbar.jsx"
import LiveView from './views/LiveView.jsx';

function App() {
  const [activeTab, setActiveTab] = useState("Live"); // Options: "Live" or "Sessions"
  const [capturing, setCapturing] = useState(false); 
  const [session, setSession] = useState({});

  return (
    <>
      <Navbar activeTab={activeTab} switchTab={setActiveTab}/>
      <LiveView capturing={capturing} setCapturing={setCapturing} session={session}></LiveView>
    </>
  )
}

export default App
