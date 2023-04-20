import React, { useState } from 'react';
import { useContext } from 'react';
import SetterContext from '../SetterContext';
import './CSS/BarChart.css';
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
  const[theTime,setTheTime]= useState("Day");

  const rating = useContext(SetterContext);

  function createCharts(){}
  function updateCharts(){}
  const userRating = localStorage.getItem(rating.blockNum);

  const changeTime =()=>{
    if(theTime === 'Day'){
      return day;
    }else if(theTime === 'Week'){
      return week;
    }else{
      return month;
    }

  }
  const day=[  
    {x: 'Monday', y:7.2},
    {x: 'Tuesday', y:3},
    {x: 'Wednesday', y:5},
    {x: 'Thursday', y:6},
    {x: 'Friday', y:5},
    {x: 'Saturday', y:9},
    {x: 'Sunday', y:9.3}
  ]
  const week=[
    {x: 'Week 1', y:7},
    {x: 'Week 2', y:3},
    {x: 'Week 3', y:5},
    {x: 'Week 4', y:5.5},
    {x: 'Sunday', y:10}
    
  ]
  const month=[
    {x: 'Jan', y:10},
    {x: 'Feb', y:9.5},
    {x: 'March', y:3},
    {x: 'April', y:6},
    {x: 'May', y:6.5},
    {x: 'June', y:3},
    {x: 'July', y:3},
    {x: 'August', y:10},
    {x: 'September', y:10},
    {x: 'October', y:5},
    {x: 'November', y:6},
    {x: 'December', y:7.8},
  ]
  const data = {
   
    // labels:['Monday', 'Tuesday', 'Wednesday','Thursday','Friday', 'Saturday', 'Sunday'],
    datasets: [
      
      {
        // label:'Performance Score',
        label:'Productivity avg',
        data:changeTime(),
        backgroundColor: 
        ['rgba(255, 255, 0, 0.723)',
          'rgba(255, 0, 0, 0.733)',
          'rgba(255, 68, 0, 0.733)',
          'rgba(255, 68, 0, 0.733)',
          'rgba(0, 128, 0, 0.743)',
          'rgba(0, 128, 0, 0.743)', 
          'rgba(0, 128, 0, 0.743)', 
        ],
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
        text: theTime,
        
        
      },
      
      responsive: true,
      scales: {
        y:{
          min: 1,
          max: week.max10,
        }
      },
      labels:{font:{
        family:'Kalam',
        size:20,
      }}
    },
  }

  
  return (
    <div className='chart-container' style={{marginTop:'20px',width:'80vmin', height:'65vh', display:'flex', alignItems:'center', justifyContent:'center',flexDirection:'column'}}>
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
        <div>
         <button 
         className={theTime === 'Day'? "timeChart-button + extra ":'timeChart-button'}
         onClick={e=>setTheTime(e.target.value)} 
         value='Day'
          style={{ marginLeft:'10px',borderTopLeftRadius:'7px',borderBottomLeftRadius:'7px'}}
          >Day</button>
        <button  
        className={theTime === 'Week'? "timeChart-button + extra ":'timeChart-button'}
        onClick={e=>setTheTime(e.target.value)} 
        value='Week' 
        >Week</button>
        <button  
        className={theTime === 'Month'? "timeChart-button + extra ":'timeChart-button'}
        onClick={e=>setTheTime(e.target.value)} 
        value='Month' 
        style={{ borderTopRightRadius:'7px',borderBottomRightRadius:'7px'}}
        >Month</button>
     </div>
    </div>
  );
};

export default BarChart