import { HashRouter, Routes, Route } from "react-router";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import Weather from "./components/Weather";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<AboutMe />}></Route>
        <Route path="/weather" element={<Weather />}></Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
