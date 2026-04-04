import React from "react";
import ReactDOM from "react-dom/client";
import Modal from "react-modal";
import App from "./App";

Modal.setAppElement("#root");

if (process.env.NODE_ENV === "development") {
  void import("./services/pomoprogressService").then((mod) => {
    type WindowWithClear = Window & {
      __pomoprogressClearTodaysRatings?: () => ReturnType<typeof mod.clearTodaysRatingData>;
    };
    (window as WindowWithClear).__pomoprogressClearTodaysRatings = () => mod.clearTodaysRatingData();
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
