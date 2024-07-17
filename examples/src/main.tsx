import React from "react";
import { ReactDOM } from "../which-react.ts";
import App from "./App.tsx";
import "./index.css";

function App1() {
  return <div>1</div>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  (<App1 />) as any
);
