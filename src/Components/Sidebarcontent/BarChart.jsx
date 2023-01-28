import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
//
const data = {
  labels:['Monday', 'Tuesday', 'Wednesday','Thursday','Friday', 'Saturday', 'Sunday'],
  datasets: [
    {
      label:'Performance Score',
      data:[10,9.2,3,5,7,2,1],
      backgroundColor: 
      ['rgba(0, 128, 0, 0.743)', 
      'rgba(0, 128, 0, 0.743)',
      'rgba(255, 0, 0, 0.733)', 
      'rgba(255, 68, 0, 0.733)',
      'rgba(255, 255, 0, 0.723)',
      'rgba(255, 0, 0, 0.733)',
      'rgba(255, 0, 0, 0.733)'],
      borderColor: 'black',
      borderWidth: 3.5,
    }
  ]
}

const options = {
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Week of 1/21-1/27',
    },
    scales: {
      y:{
        min: 0,
        max: 10,
      }
    }
  },
}
  

const BarChart = () => {
  return (
    <div >
         <Bar 
          style={
            {paddingTop:'50px'}
          }
          data = {data}
          options = {options}
          height={700}
          width={400}
        />
    </div>
  );
};

export default BarChart