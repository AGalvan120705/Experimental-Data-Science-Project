import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './screens/Homepage';
import Screen1 from './screens/Dashboard';  // your other screens
import Screen2 from './screens/InteractiveMap';
import Screen5 from './screens/Recommendations';
import Screen3 from './screens/PredictiveModeling';
import Navbar from './components/Navbar';
import { useState } from 'react';

function App() {
  const [navbarHovered, setNavbarHovered] = useState(false);
  const [navbarLocked, setNavbarLocked] = useState(false);
  const navbarExpanded = navbarHovered || navbarLocked;
  const navbarWidth = navbarExpanded ? 280 : 80;

  return (
    <Router>
      <Header navbarWidth={navbarWidth} /> 
        <Navbar
          expanded={navbarExpanded}
          onHoverChange={setNavbarHovered}
          navbarLocked={navbarLocked}
          onToggleNavbar={() => setNavbarLocked((current) => !current)}
        />
      <main className="bg-[#f3f4f6] min-h-screen pt-20 transition-all duration-300" style={{ marginLeft: `${navbarWidth}px` }}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Screen1 />} />
          <Route path="/interactiveMap" element={<Screen2 />} />
          <Route path="/recommendations" element={<Screen5 />} />
          <Route path="/predictive-modeling" element={<Screen3 />} />


        </Routes>
      </main>
    </Router>
  )
}

export default App