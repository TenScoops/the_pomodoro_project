import React, { useMemo } from "react";
import "./BarChart/BarChart.css";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartPeriodRange } from "./chartLabels";
import {
  getMonthDayMetas,
  getCurrentYearMonthLabels,
  monthLineChartShowAllDaysTicks,
  monthLineChartXAxisGrid,
  monthLineChartYearXAxisTicks,
} from "./chartLabels";
import { useHoursWorkedChartData } from "../../hooks/useHoursWorkedChartData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HOURS_WORKED_LINE_STROKE = "#1e212d";
const HOURS_WORKED_AREA_FILL = "rgba(186, 230, 253, 0.55)";

function buildGuestPlaceholderSeries(
  timeRange: ChartPeriodRange,
  year: number,
  monthIndex0: number
): {
  labels: string[];
  hoursSeries: number[];
  daysWorkedSeries: number[];
} {
  if (timeRange === "Month") {
    const dayMetas = getMonthDayMetas(year, monthIndex0, "full");
    return {
      labels: dayMetas.map((meta) => meta.label),
      hoursSeries: dayMetas.map(() => 0),
      daysWorkedSeries: dayMetas.map(() => 0),
    };
  }
  const labels = getCurrentYearMonthLabels();
  return {
    labels,
    hoursSeries: labels.map(() => 0),
    daysWorkedSeries: labels.map(() => 0),
  };
}

function buildHoursWorkedLineOptions(
  timeRange: ChartPeriodRange,
  maxHours: number,
  yearAverageHoursPerDaySeries: number[],
  yearTotalWorkingDaysSeries: number[]
): ChartOptions<"line"> {
  const paddedMax = Math.max(1, maxHours * 1.15);
  const isMonth = timeRange === "Month";
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = typeof context.parsed.y === "number" ? context.parsed.y : 0;
            const isWorkingDay = value >= 1;
            if (isMonth) {
              return [`Hours worked: ${value.toFixed(2)}`, `Working day: ${isWorkingDay}`];
            }
            const avgHoursPerDay = yearAverageHoursPerDaySeries[context.dataIndex] ?? 0;
            const totalWorkingDays = yearTotalWorkingDaysSeries[context.dataIndex] ?? 0;
            return [
              `Hours worked: ${value.toFixed(2)}`,
              `Avg hours worked: ${avgHoursPerDay.toFixed(2)}`,
              `Total working days: ${totalWorkingDays}`,
            ];
          },
        },
        titleFont: { family: "Roboto", size: 13 },
        bodyFont: { family: "Kalam", size: 14 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: isMonth ? "Date" : "Month",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        grid: {
          ...monthLineChartXAxisGrid,
        },
        ticks: {
          ...(isMonth ? monthLineChartShowAllDaysTicks : monthLineChartYearXAxisTicks),
        },
      },
      y: {
        min: 0,
        suggestedMax: paddedMax,
        title: {
          display: true,
          text: "Hours worked",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        ticks: {
          color: "#111",
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
      },
    },
  };
}

export type HoursWorkedChartProps = {
  timeRange: ChartPeriodRange;
  year: number;
  monthIndex0: number;
};

const HoursWorkedChart = ({ timeRange, year, monthIndex0 }: HoursWorkedChartProps) => {
  const { loading, errorMessage, series, hasUser } = useHoursWorkedChartData(timeRange, year, monthIndex0);
  const guestSeries = useMemo(
    () => buildGuestPlaceholderSeries(timeRange, year, monthIndex0),
    [timeRange, year, monthIndex0]
  );

  const displaySeries = hasUser ? series : guestSeries;
  const { labels, hoursSeries, daysWorkedSeries } = displaySeries;

  const maxHours = useMemo(() => {
    if (hoursSeries.length === 0) {
      return 0;
    }
    return Math.max(...hoursSeries, 0);
  }, [hoursSeries]);

  const yearAverageHoursPerDaySeries = useMemo(() => {
    return hoursSeries.map((hours, monthIndex0) => {
      const workedDays = daysWorkedSeries[monthIndex0] ?? 0;
      if (workedDays <= 0) {
        return 0;
      }
      return hours / workedDays;
    });
  }, [hoursSeries, daysWorkedSeries]);

  const yearTotalWorkingDaysSeries = useMemo(() => {
    return daysWorkedSeries.map((workedDays) => Math.max(0, Math.floor(workedDays)));
  }, [daysWorkedSeries]);

  const options = useMemo(
    () =>
      buildHoursWorkedLineOptions(
        timeRange,
        maxHours,
        yearAverageHoursPerDaySeries,
        yearTotalWorkingDaysSeries
      ),
    [timeRange, maxHours, yearAverageHoursPerDaySeries, yearTotalWorkingDaysSeries]
  );

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Hours worked",
          data: hoursSeries,
          borderColor: HOURS_WORKED_LINE_STROKE,
          backgroundColor: HOURS_WORKED_AREA_FILL,
          fill: true,
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: false,
        },
      ],
    }),
    [labels, hoursSeries]
  );

  const showLoadingOnly = hasUser && loading;

  return (
    <div
      className="chart-container hours-worked-chart"
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
          {hasUser && errorMessage ? (
            <p className="chart-status chart-status--error">{errorMessage}</p>
          ) : null}

          <div style={{ flex: 1, width: "100%", minHeight: "48vh", position: "relative", marginTop: "8px" }}>
            {labels.length > 0 ? <Line data={lineData} options={options} /> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default HoursWorkedChart;
