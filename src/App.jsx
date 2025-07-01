import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Add from "./pages/Add";
import Edit from "./pages/Edit";
function App() {
  return (
    <Router>
      <nav className="p-4 bg-blue-100 flex gap-4">
        <p className="font-bold text-base">Groove-Log</p>
        <Link to="/react-app/">一覧</Link>
        <Link to="react-app/add">追加</Link>
      </nav>
      <Routes>
        <Route path="/react-app/" element={<Home />} />
        <Route path="react-app/add" element={<Add />} />
        <Route path="react-app/edit" element={<Edit />} />
      </Routes>
    </Router>
  );
}

export default App;
