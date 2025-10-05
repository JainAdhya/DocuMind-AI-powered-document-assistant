import "./App.css";
import SummarizeText from "./components/SummarizeText";
import HomePage from "./components/HomePage";
import ChatWithPdf from "./components/ChatWithPdf";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/summarize" element={<SummarizeText />} />
        <Route exact path="/chatwithpdf" element={<ChatWithPdf />} />
      </Routes>
    </Router>
  );
}

export default App;
