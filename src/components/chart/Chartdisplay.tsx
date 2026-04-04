import React, { useState } from "react";
import Modal from "react-modal";
import "./Chartdisplay.css";
import { useSessionStore } from "../../store/sessionStore";
import BarChart from "./BarChart";
import HoursWorkedChart from "./HoursWorkedChart";
import MoodTrackerChart from "./MoodTrackerChart";

type ChartView = "productivity" | "mood" | "hoursWorked";

const Chartdisplay = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [chartView, setChartView] = useState<ChartView>("productivity");
  const setData = useSessionStore((s) => s.setData);

  const customStyles = {
    overlay: {
      backgroundColor: "transparent",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "rgba(255, 255, 255)",
      height: "78vh",
      width: "101vmin",
      borderRadius: "20px",
      padding: "0",
      border: "solid 3px black",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setData(false);
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
      <button type="button" onClick={() => closeModal()} className="Chart-close-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path
            fillRule="evenodd"
            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="chart-modal-inner">
        <div className="chart-toolbar">
          <label className="chart-view-label" htmlFor="chart-view-select">
            View
          </label>
          <select
            id="chart-view-select"
            className="chart-view-select"
            value={chartView}
            onChange={(event) => setChartView(event.target.value as ChartView)}
            aria-label="Choose chart: productivity, mood tracker, or hours worked"
          >
            <option value="productivity">Productivity</option>
            <option value="mood">Mood Tracker</option>
            <option value="hoursWorked">Hours worked</option>
          </select>
        </div>
        <div className="chart-view-area">
          {chartView === "productivity" ? (
            <BarChart />
          ) : chartView === "mood" ? (
            <MoodTrackerChart />
          ) : (
            <HoursWorkedChart />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Chartdisplay;
