import { HashRouter, Routes, Route } from "react-router";
import { Link } from "react-router-dom";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import Weather from "./components/Weather";

function App() {
  return (
    <>
      <HashRouter>
        <nav className="p-4 space-x-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/weather">Weather</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/about" element={<AboutMe />}></Route>
          <Route path="/weather" element={<Weather />}></Route>
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
