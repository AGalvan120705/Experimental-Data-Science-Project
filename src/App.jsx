import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './screens/Homepage';
import Screen1 from './screens/Dashboard';  // your other screens
import Screen2 from './screens/InteractiveMap';

function App() {
  return (
    <Router>
      <div className="bg-[#f3f4f6] min-h-screen w-screen">
        <Header/>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/screen1" element={<Screen1 />} />
          <Route path="/screen2" element={<Screen2 />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App