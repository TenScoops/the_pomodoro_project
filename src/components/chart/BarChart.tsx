import React, { useMemo } from "react";
import "./BarChart.css";
import "chartjs-plugin-datalabels";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartData, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ChartPeriodRange } from "./chartLabels";
import { buildDummyMonthBarDataset, buildDummyYearBarDataset, type ChartPoint } from "./dummyData";
import { useChartBarData } from "../../hooks/useChartBarData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export type BarChartProps = {
  timeRange: ChartPeriodRange;
};

const BarChart = ({ timeRange }: BarChartProps) => {
  const { loading, errorMessage, liveDataset, hasUser } = useChartBarData(timeRange);

  const barDataset = useMemo(() => {
    if (!hasUser) {
      return timeRange === "Month" ? buildDummyMonthBarDataset() : buildDummyYearBarDataset();
    }
    if (loading || errorMessage) {
      return null;
    }
    return liveDataset;
  }, [hasUser, timeRange, loading, errorMessage, liveDataset]);

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
        marginTop: "8px",
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
          {hasUser && errorMessage ? <p className="chart-status chart-status--error">{errorMessage}</p> : null}
          {showEmptyHint ? (
            <p className="chart-status chart-status--empty">No sessions saved for this period yet. Complete a session while signed in to see real bars.</p>
          ) : null}

          {barData && chartPayload ? <Bar style={{ marginTop: "0px" }} data={barData} options={chartPayload.options} /> : null}
        </>
      )}
    </div>
  );
};

export default BarChart;
