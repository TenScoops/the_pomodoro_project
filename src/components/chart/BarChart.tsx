import React, { useState } from "react";
import { useSessionStore } from "../../store/sessionStore";
import "./BarChart.css";
import "chartjs-plugin-datalabels";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartData, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeRange = "Month" | "Year";

type ChartPoint = {
  x: string;
  y: string | number;
  length: number;
  sessions: number;
  backgroundColor: string;
};

const BarChart = () => {
  const [theTime, setTheTime] = useState<TimeRange>("Month");
  const blockNum = useSessionStore((s) => s.blockNum);

  const getMonthDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const datesInMonth: string[] = [];

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      datesInMonth.push(formatDate(new Date(day)));
    }

    return datesInMonth;
  };

  const getYearMonths = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthsInYear: string[] = [];

    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      monthsInYear.push(formatMonth(date));
    }

    return monthsInYear;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatMonth = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "short" };
    return date.toLocaleDateString(undefined, options);
  };

  const getBackgroundColor = (productivityAvg: number) => {
    if (productivityAvg >= 0 && productivityAvg < 1.5) {
      return "rgb(170, 0, 0)";
    } else if (productivityAvg >= 1.5 && productivityAvg < 2.5) {
      return "rgb(205, 0, 0)";
    } else if (productivityAvg >= 2.5 && productivityAvg < 3.5) {
      return "rgb(255, 34, 0)";
    } else if (productivityAvg >= 3.5 && productivityAvg < 4.5) {
      return "orangered";
    } else if (productivityAvg >= 4.5 && productivityAvg < 5.5) {
      return "rgb(255, 136, 0)";
    } else if (productivityAvg >= 5.5 && productivityAvg < 6.5) {
      return "rgb(255, 191, 0)";
    } else if (productivityAvg >= 6.5 && productivityAvg < 7.5) {
      return "yellow";
    } else if (productivityAvg >= 7.5 && productivityAvg < 8.3) {
      return "rgb(184, 255, 18)";
    } else if (productivityAvg >= 8.3 && productivityAvg < 9) {
      return "rgb(2, 188, 5)";
    } else if (productivityAvg >= 9 && productivityAvg <= 10) {
      return "rgb(0, 228, 4)";
    }
    return "";
  };

  const generateMonthData = () => {
    const monthLabels = getMonthDates();

    const monthData: ChartPoint[] = Array.from({ length: monthLabels.length }, (_, index) => {
      const productivityAvg = Number((Math.random() * 10).toFixed(2));
      const length = Math.floor(Math.random() * 100) + 1;
      const sessions = Math.floor(Math.random() * 10) + 1;
      const backgroundColor = getBackgroundColor(productivityAvg);

      return {
        x: monthLabels[index],
        y: productivityAvg,
        length,
        sessions,
        backgroundColor,
      };
    });

    return {
      label: "Productivity avg",
      data: monthData,
      backgroundColor: monthData.map((dataPoint) => dataPoint.backgroundColor),
      borderColor: "black",
      borderWidth: 3.5,
    };
  };

  const generateYearData = () => {
    const yearLabels = getYearMonths();

    const yearData: ChartPoint[] = yearLabels.map((month) => {
      const stored = localStorage.getItem(String(blockNum));
      const productivityAvg = stored ? Number(stored) : 0;
      const length = Math.floor(Math.random() * 100) + 1;
      const sessions = Math.floor(Math.random() * 10) + 1;
      const backgroundColor = getBackgroundColor(productivityAvg);

      return {
        x: month,
        y: productivityAvg,
        length,
        sessions,
        backgroundColor,
      };
    });

    return {
      label: "Productivity avg",
      data: yearData,
      backgroundColor: yearData.map((dataPoint) => dataPoint.backgroundColor),
      borderColor: "black",
      borderWidth: 3.5,
    };
  };

  const getChartData = (): { datasets: ReturnType<typeof generateMonthData>[]; options: ChartOptions<"bar"> } => {
    const datasets = [];

    if (theTime === "Month") {
      datasets.push(generateMonthData());
    } else if (theTime === "Year") {
      datasets.push(generateYearData());
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
