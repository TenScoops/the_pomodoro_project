import React, { useState } from "react";
import "./BarChart.css";
import "chartjs-plugin-datalabels";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartData, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { buildDummyMonthBarDataset, buildDummyYearBarDataset, type ChartPoint } from "./dummyData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeRange = "Month" | "Year";

const BarChart = () => {
  const [theTime, setTheTime] = useState<TimeRange>("Month");

  const getChartData = (): { datasets: ReturnType<typeof buildDummyMonthBarDataset>[]; options: ChartOptions<"bar"> } => {
    const datasets = [];

    if (theTime === "Month") {
      datasets.push(buildDummyMonthBarDataset());
    } else if (theTime === "Year") {
      datasets.push(buildDummyYearBarDataset());
    }

    return {
      datasets,
      options: {
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataset = context.dataset;
                const dataItem = dataset.data[context.dataIndex] as unknown as ChartPoint;
                return [
                  `Productivity avg: ${dataItem.y}`,
                  `Total time worked: ${dataItem.length} hours`,
                  `Number of sessions completed: ${dataItem.sessions}`,
                  `Number of blocks completed: 4`,
                ];
              },
            },
            titleFont: {
              family: "roboto",
              size: 14,
            },
            bodyFont: {
              family: "kalam",
              size: 13,
            },
          },
        },
        scales: {
          y: {
            suggestedMin: 1,
            suggestedMax: 10,
            ticks: {
              stepSize: 0.5,
              color: "black",
            },
          },
          x: {
            ticks: {
              color: "black",
            },
          },
        },
      },
    };
  };

  const chartPayload = getChartData();
  const barData = {
    datasets: chartPayload.datasets,
  } as unknown as ChartData<"bar">;

  return (
    <div
      className="chart-container"
      style={{ marginTop: "12px", width: "100vmin", height: "65vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
    >
      <div style={{ marginTop: "80px", marginLeft: "40px", marginBottom: "10px", padding: "0", display: "flex", flexDirection: "row" }}>
        <button style={{ width: "5.3vmin", height: "25px", marginRight: "0", backgroundColor: "white", color: "black", borderRight: "transparent" }} type="button">
          {"<"}
        </button>
        <div style={{ backgroundColor: "black", color: "white", fontSize: "13px", paddingLeft: "10px", paddingRight: "10px", border: "solid 2px black" }}>
          This {theTime}
        </div>
        <button style={{ width: "5.3vmin", height: "25px", backgroundColor: "white", color: "black", borderLeft: "transparent" }} type="button">
          {">"}
        </button>
      </div>

      <Bar style={{ marginTop: "0px" }} data={barData} options={chartPayload.options} />

      <div>
        <button
          className={theTime === "Month" ? "timeChart-button + extra " : "timeChart-button"}
          onClick={(event) => setTheTime(event.currentTarget.value as TimeRange)}
          value="Month"
          type="button"
          style={{ marginLeft: "10px", borderTopLeftRadius: "7px", borderBottomLeftRadius: "7px", borderRight: "transparent" }}
        >
          by Month
        </button>

        <Tippy delay={10} placement="top" content="coming soon">
          <button
            className={theTime === "Year" ? "timeChart-button + extra " : "timeChart-button"}
            type="button"
            style={{ borderTopRightRadius: "7px", borderBottomRightRadius: "7px", borderLeft: "transparent" }}
          >
            by Year
          </button>
        </Tippy>
      </div>
    </div>
  );
};

export default BarChart;
