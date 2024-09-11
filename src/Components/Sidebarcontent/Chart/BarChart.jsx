import React, { useContext, useState } from 'react';
import SetterContext from '../../SetterContext';
import './BarChart.css';
// import { UserAuth } from '../../../FirebaseAuth/AuthContext';
// import { db } from '../../../Firebase';
import 'chartjs-plugin-datalabels';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional for styling

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// ----------------------------------------------------------------------------------
const BarChart = () => {
  const [theTime, setTheTime] = useState('Month');
  const rating = useContext(SetterContext);

  // const { user } = UserAuth();
  
  const getMonthDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const datesInMonth = [];
  
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
    for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
      datesInMonth.push(formatDate(day));
    }
  
    return datesInMonth;
  };
  
  const getYearMonths = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthsInYear = [];
  
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      monthsInYear.push(formatMonth(date));
    }
  
    return monthsInYear;
  };
  
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  const formatMonth = (date) => {
    const options = { month: 'short' };
    return date.toLocaleDateString(undefined, options);
  };
  
  //get corresponding color to productiviy avg
  const getBackgroundColor = (productivityAvg) => {
    if (productivityAvg >= 0 && productivityAvg < 1.5) {
      return 'rgb(170, 0, 0)'; // Dark red
    } else if (productivityAvg >= 1.5 && productivityAvg < 2.5) {
      return 'rgb(205, 0, 0)'; // Red
    } else if (productivityAvg >= 2.5 && productivityAvg < 3.5) {
      return 'rgb(255, 34, 0)'; // Orangish red
    } else if (productivityAvg >= 3.5 && productivityAvg < 4.5) {
      return 'orangered'; // Orangered
    } else if (productivityAvg >= 4.5 && productivityAvg < 5.5) {
      return 'rgb(255, 136, 0)'; // Orange
    } else if (productivityAvg >= 5.5 && productivityAvg < 6.5) {
      return 'rgb(255, 191, 0)'; // Yellowish orange
    } else if (productivityAvg >= 6.5 && productivityAvg < 7.5) {
      return 'yellow'; // Yellow
    } else if (productivityAvg >= 7.5 && productivityAvg < 8.3) {
      return 'rgb(184, 255, 18)'; // Lime green
    } else if (productivityAvg >= 8.3 && productivityAvg < 9) {
      return 'rgb(2, 188, 5)'; // Greenish lime
    } else if (productivityAvg >= 9 && productivityAvg <= 10) {
      return 'rgb(0, 228, 4)'; // Green'
    } else {
      return ''; // Default empty color
    }
  };
  

  const generateMonthData = () => {
    const monthLabels = getMonthDates();

    // Generate dummy data for the year
    const monthData = Array.from({ length: monthLabels.length }, (_, i) => {
      const productivityAvg = (Math.random() * 10).toFixed(2);
      const length = Math.floor(Math.random() * 100) + 1; // Random length between 1 and 100
      const sessions = Math.floor(Math.random() * 10) + 1; // Random number of sessions between 1 and 10
      const backgroundColor = getBackgroundColor(productivityAvg);

      return {
        x: monthLabels[i],
        y: productivityAvg,
        length,
        sessions,
        backgroundColor,
      };
    });

    return {
      label: 'Productivity avg',
      data: monthData,
      backgroundColor: monthData.map((dataPoint) => dataPoint.backgroundColor),
      borderColor: 'black',
      borderWidth: 3.5,
    };
  };
  
  let ratings = localStorage.getItem(rating.blockNum);
  let officialRating = ratings;


  const generateYearData = () => {
    const yearLabels = getYearMonths();

    // Retrieve data from localStorage
    const yearData = yearLabels.map((month) => {
      const productivityAvg = localStorage.getItem(rating.blockNum);
      const length = Math.floor(Math.random() * 100) + 1; // Random length between 1 and 100
      const sessions = Math.floor(Math.random() * 10) + 1; // Random number of sessions between 1 and 10
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
      label: 'Productivity avg',
      data: yearData,
      backgroundColor: yearData.map((dataPoint) => dataPoint.backgroundColor),
      borderColor: 'black',
      borderWidth: 3.5,
    };
};
  

  
  const getChartData = () => {
    const datasets = [];
  
    if (theTime === 'Month') {
      datasets.push(generateMonthData());
    } else if (theTime === 'Year') {
      datasets.push(generateYearData());
    }
  
    return {
      datasets,
      options: {
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            // backgroundColor: 'black',
            callbacks: {
              label: (context) => {
                const dataset = context.dataset;
                const dataItem = dataset.data[context.dataIndex];
                return [
                  `Productivity avg: ${dataItem.y}`,
                  `Total time worked: ${dataItem.length} hours`,
                  `Number of sessions completed: ${dataItem.sessions}`,
                  `Number of blocks completed: 4`,
                 
                ];
              },
            },
            titleFont: {
              family: 'roboto', // Specify the font family for the tooltip title
              size: 14, // Specify the font size for the tooltip title
            },
            bodyFont: {
              family: 'kalam', // Specify the font family for the tooltip content
              size: 13, // Specify the font size for the tooltip content
            },
          },
        },
        scales: {
          y: {
            suggestedMin: 1,
            suggestedMax: 10,
            ticks: {
              stepSize: 0.5,
              color:'black'
            },
           
          },
           x:{
              ticks: {
                color:'black'
              }
            },
        },
      },
    };
  };
  

 

  const data = getChartData();

  // const options = {
  //   maintainAspectRatio: false,
  //   plugins: {
  //     tooltip: {
  //       backgroundColor:"black",
  //       callbacks: {
  //         label: (context) => {
  //           const dataset = context.dataset;
  //           const dataItem = dataset.data[context.dataIndex];
  //           return [
  //             `Productivity avg: ${dataItem.y}`,
  //             `Length of session: ${dataItem.length} mins`,
  //             `Sessions: ${dataItem.sessions}`
  //           ];
  //         },
  //       },
  //     },
  //     title: {
  //       display: true,
  //       // text: theTime,
  //     },
  //     responsive: true,
  //     scales: {
  //       yAxes: [{
  //         min: 0,
  //         max: 10,
  //         ticks: {
  //           beginAtZero: false,
  //           stepSize: 1,
  //         },
  //       }],
       
  //     },
  //   },
  // };



  return (
    <div className='chart-container' style={{ marginTop: '12px', width: '100vmin', height: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Tippy
          delay={10}
          placement="top"
          content="coming soon">
        <div style={{ marginTop: '80px', marginLeft: '40px', marginBottom: '10px', padding: '0', display: 'flex', flexDirection: 'row' }}>
          <button style={{ width: '5.3vmin', height: '25px', marginRight: '0', backgroundColor: 'white', color: 'black', borderRight: 'transparent' }}>
            {'<'}
          </button>
          <div style={{ backgroundColor: 'black', color: 'white', fontSize: '13px', paddingLeft: '10px', paddingRight: '10px', border: 'solid 2px black' }}>
            This {theTime}
          </div>
          <button style={{ width: '5.3vmin', height: '25px', backgroundColor: 'white', color: 'black', borderLeft: 'transparent' }}>
            {'>'}
          </button>
        </div>
      </Tippy>
      <Bar
        style={{ marginTop: '0px', }}
        data={ data}
        options={data.options} // Pass the options object directly
      />
      <div>
        <button
          className={theTime === 'Month' ? 'timeChart-button + extra ' : 'timeChart-button'}
          onClick={(e) => setTheTime(e.target.value)}
          value='Month'
          style={{ marginLeft: '10px', borderTopLeftRadius: '7px', borderBottomLeftRadius: '7px', borderRight: 'transparent' }}
        >
          by Month
        </button>

        <Tippy
          delay={10}
          placement="top"
          content="coming soon">
          <button
            className={theTime === 'Year' ? 'timeChart-button + extra ' : 'timeChart-button'}
            // onClick={(e) => setTheTime(e.target.value)}
            // value='Year'
            style={{ borderTopRightRadius: '7px', borderBottomRightRadius: '7px', borderLeft: 'transparent' }}
          >
            by Year
          </button>
        </Tippy>
      </div>
    </div>
  );
};

export default BarChart;
