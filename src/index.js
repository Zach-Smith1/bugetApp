const React = require("react");
const ReactDOM = require("react-dom");
const { createRoot } = require("react-dom/client");
const App = require("./App");

var mountNode = document.getElementById("app");
const root=createRoot(mountNode);
root.render(<App/>)