import React from "react";
import { Routes, Route } from "react-router-dom";
import TestPage from "./components/TestPage.jsx";
import ResultPage from "./components/ResultPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TestPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}
