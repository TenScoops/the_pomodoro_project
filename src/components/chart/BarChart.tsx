import React, { useMemo, useState } from "react";
import "./BarChart.css";
import "chartjs-plugin-datalabels";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartData, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { buildDummyMonthBarDataset, buildDummyYearBarDataset, type ChartPoint } from "./dummyData";
import { useChartBarData } from "../../hooks/useChartBarData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeRange = "Month" | "Year";

function buildBarChartOptions(): ChartOptions<"bar"> {
  return {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataset = context.dataset;
            const dataItem = dataset.data[context.dataIndex] as unknown as ChartPoint;
            const blocksLabel =
              typeof dataItem.blocksCompleted === "number" ? String(dataItem.blocksCompleted) : "—";
            return [
              `Productivity avg: ${dataItem.y}`,
              `Total time worked: ${dataItem.length} hours`,
              `Sessions completed: ${dataItem.sessions}`,
              `Blocks completed: ${blocksLabel}`,
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
        suggestedMin: 0,
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
  };
}

const BarChart = () => {
  const [theTime, setTheTime] = useState<TimeRange>("Month");
  const { loading, errorMessage, liveDataset, hasUser } = useChartBarData(theTime);

  const barDataset = useMemo(() => {
    if (!hasUser) {
      return theTime === "Month" ? buildDummyMonthBarDataset() : buildDummyYearBarDataset();
    }
    if (loading || errorMessage) {
      return null;
    }
    return liveDataset;
  }, [hasUser, theTime, loading, errorMessage, liveDataset]);

  const showEmptyHint =
    hasUser &&
    Boolean(liveDataset) &&
    !loading &&
    !errorMessage &&
    (liveDataset?.data.every((point) => Number(point.y) === 0) ?? false);

  const chartOptions = useMemo(() => buildBarChartOptions(), []);

  const chartPayload = useMemo(() => {
    if (!barDataset) {
      return null;
    }
    return {
      datasets: [barDataset],
      options: chartOptions,
    };
  }, [barDataset, chartOptions]);

  const barData = chartPayload
    ? ({
        datasets: chartPayload.datasets,
      } as unknown as ChartData<"bar">)
    : null;

  const showLoadingOnly = hasUser && loading;

  return (
    <div
      className="chart-container"
      style={{
        marginTop: "12px",
        width: "100vmin",
        height: "65vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {showLoadingOnly ? (
        <div className="chart-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="chart-spinner" />
          <p className="chart-loading-text">loading</p>
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: "80px",
              marginLeft: "40px",
              marginBottom: "10px",
              padding: "0",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <button
              style={{ width: "5.3vmin", height: "25px", marginRight: "0", backgroundColor: "white", color: "black", borderRight: "transparent" }}
              type="button"
            >
              {"<"}
            </button>
            <div
              style={{
                backgroundColor: "black",
                color: "white",
                fontSize: "13px",
                paddingLeft: "10px",
                paddingRight: "10px",
                border: "solid 2px black",
              }}
            >
              This {theTime}
            </div>
            <button
              style={{ width: "5.3vmin", height: "25px", backgroundColor: "white", color: "black", borderLeft: "transparent" }}
              type="button"
            >
              {">"}
            </button>
          </div>

          {hasUser && errorMessage ? <p className="chart-status chart-status--error">{errorMessage}</p> : null}
          {showEmptyHint ? (
            <p className="chart-status chart-status--empty">No sessions saved for this period yet. Complete a session while signed in to see real bars.</p>
          ) : null}

          {barData && chartPayload ? <Bar style={{ marginTop: "0px" }} data={barData} options={chartPayload.options} /> : null}

          <div>
            <button
              className={theTime === "Month" ? "timeChart-button + extra " : "timeChart-button"}
              onClick={(event) => setTheTime(event.currentTarget.value as TimeRange)}
              value="Month"
              type="button"
              style={{
                marginLeft: "10px",
                borderTopLeftRadius: "7px",
                borderBottomLeftRadius: "7px",
                borderRight: "transparent",
              }}
            >
              by Month
            </button>

            <Tippy delay={10} placement="top" content="Current calendar year">
              <button
                className={theTime === "Year" ? "timeChart-button + extra " : "timeChart-button"}
                onClick={(event) => setTheTime(event.currentTarget.value as TimeRange)}
                value="Year"
                type="button"
                style={{
                  borderTopRightRadius: "7px",
                  borderBottomRightRadius: "7px",
                  borderLeft: "transparent",
                }}
              >
                by Year
              </button>
            </Tippy>
          </div>
        </>
      )}
    </div>
  );
};

export default BarChart;
