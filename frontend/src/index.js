import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Modal from "react-modal";
import "modern-normalize";
import "./index.css";
import "antd/dist/antd.min.css";

Modal.setAppElement("#root");

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
