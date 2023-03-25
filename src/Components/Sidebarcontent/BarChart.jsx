import React from 'react';
import { useContext } from 'react';
import SetterContext from '../SetterContext';
import {
  collection,
  query,
  onSnapshot,
  doc
} from "firebase/firestore";
import { dataBase } from '../../Firebase';

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
//-------------------------------------------------------------------------------------------------
const BarChart = () => {
  // function width() {
  //   if (typeof window !== 'undefined') {
  //        if(window.innerWidth < 700 ){
  //          return 200;
  //         } 
  //   }
  //   return 400;
  // }
  // function height() {
  //   if (typeof window !== 'undefined') {
  //        if(window.innerHeight < 700 ){
  //          return 500;
  //         } 
  //   }
  //   return 700;
  // }
  const rating = useContext(SetterContext);

  function createCharts(){}
  function updateCharts(){}
  const userRating = localStorage.getItem(rating.blockNum);
  const data = {
    font:{family:'Kalam'},
    labels:['Monday', 'Tuesday', 'Wednesday','Thursday','Friday', 'Saturday', 'Sunday'],
    datasets: [
      
      {
        // label:'Performance Score',
        label:'Productivity avg',
        data:[userRating,9.2,3,5,7,2,1],
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
        font:{
          family:'Kalam',
          size:20,
        }
      },
      responsive: true,
      scales: {
        y:{
          min: 0,
          max: 10,
        }
      }
    },
  }

  return (
    <div className='chart-container' style={{position:'relative',width:'80vmin', height:'65vh'}}>
      {/* {console.log(localStorage.getItem(rating.blockNum))} */}
         <Bar 
          style={
            { marginTop:'30px'}
          }
          data = {data}
          options = {options}
          // height='400px'
          // width='0px'
        />
        {/* <button style={{marginTop:'20px', marginLeft:'20px'}}>Weekly</button>
        <button style={{marginTop:'20px', marginLeft:'20px'}}>Monthly</button>
        <button style={{marginTop:'20px', marginLeft:'20px'}}>Yearly</button> */}
    </div>
  );
};

export default BarChart