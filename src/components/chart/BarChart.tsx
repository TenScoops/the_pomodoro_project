import React, { useEffect, useMemo, useRef } from "react";
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
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const shineStartedAtRef = useRef<number>(0);
  const shineActiveRef = useRef<boolean>(false);
  const shineDurationMs = 1200;

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

  const barData = useMemo(
    () =>
      chartPayload
        ? ({
            datasets: chartPayload.datasets,
          } as unknown as ChartData<"bar">)
        : null,
    [chartPayload]
  );

  const showLoadingOnly = hasUser && loading;

  const highScoreBarShinePlugin = useMemo(
    () => ({
      id: "highScoreBarShine",
      afterDatasetsDraw(chart: ChartJS<"bar">) {
        if (!shineActiveRef.current) {
          return;
        }

        const elapsed = performance.now() - shineStartedAtRef.current;
        const progress = Math.min(1, elapsed / shineDurationMs);
        if (progress >= 1) {
          return;
        }

        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);
        if (!dataset || !meta?.data?.length) {
          return;
        }

        const { ctx } = chart;
        meta.data.forEach((barElement, index) => {
          const row = dataset.data[index] as unknown as ChartPoint | undefined;
          const score = Number(row?.y);
          if (!Number.isFinite(score) || score < 9 || score > 10) {
            return;
          }

          const { x, y, base, width } = barElement.getProps(["x", "y", "base", "width"], true);
          const left = x - width / 2;
          const top = Math.min(y, base);
          const height = Math.abs(base - y);

          if (height <= 0 || width <= 0) {
            return;
          }

          const travel = height * 1.9;
          const shineCenterY = top - height * 0.85 + progress * (height + travel);
          const shineHalfHeight = height * 0.1;
          const shineTop = shineCenterY - shineHalfHeight;
          const shineBottom = shineCenterY + shineHalfHeight;

          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.beginPath();
          ctx.rect(left, top, width, height);
          ctx.clip();

          const sweepGradient = ctx.createLinearGradient(left, shineTop, left, shineBottom);
          sweepGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
          sweepGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.58)");
          sweepGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = sweepGradient;
          ctx.fillRect(left, shineTop, width, shineBottom - shineTop);
          ctx.restore();
        });
      },
    }),
    []
  );

  useEffect(() => {
    let frameId = 0;
    if (!barData) {
      return;
    }

    shineStartedAtRef.current = performance.now();
    shineActiveRef.current = true;

    const animate = () => {
      if (!shineActiveRef.current) {
        return;
      }

      const elapsed = performance.now() - shineStartedAtRef.current;
      if (elapsed >= shineDurationMs) {
        shineActiveRef.current = false;
        chartRef.current?.draw();
        return;
      }

      chartRef.current?.draw();
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => {
      shineActiveRef.current = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [barData]);

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
            <p className="chart-status chart-status--empty">No ratings for this period yet. Rate a block while signed in to see real bars.</p>
          ) : null}

          {barData && chartPayload ? (
            <Bar
              ref={chartRef}
              style={{ marginTop: "0px" }}
              data={barData}
              options={chartPayload.options}
              plugins={[highScoreBarShinePlugin]}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

export default BarChart;
