import { useState } from "react";
import Navbar from "./components/Navbar.jsx"

function App() {
  const [activeTab, setActiveTab] = useState("Live"); // Options: "Live" or "Sessions"

  return (
    <>
      <Navbar activeTab={activeTab} switchTab={setActiveTab}/>
    </>
  )
}

export default App
