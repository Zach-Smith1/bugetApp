import React from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";

const mountNode = document.getElementById("app");
const root = createRoot(mountNode);
root.render(<App/>);
