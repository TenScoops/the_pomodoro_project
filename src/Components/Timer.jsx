import React from 'react'
import {useState, useEffect, useContext, useRef} from "react"; //hooks
import Pause from './Buttons/Pause';
import Play from './Buttons/Play';
import './CSS/Timer.css';
import SetterContext from './SetterContext';
import Rating from './Rating';
import Skip from './Buttons/Skip';

const Timer = () => {
    const setterInfo = useContext(SetterContext);

    const[isPaused, setIsPaused] = useState(true);
    const[timeLeft, setTimeLeft] = useState(0);
    const[mode, setMode] = useState(0);
   
    const timeLeftRef = useRef(timeLeft);
    const isPausedRef = useRef(isPaused);
    const modeRef = useRef(mode);

    const totalBreakTime = setterInfo.numOfBreaks*setterInfo.breakMinutes;
    const numOfblocks = setterInfo.numOfBreaks+1; // change block number
    const totalWorkTime = ( ((setterInfo.workMinutes*60))-totalBreakTime);

    //  let block = 0;
     
    function tick(){
        timeLeftRef.current--;
        setTimeLeft(timeLeftRef.current);
    }

    function initiateTimer(){
        if(mode==='work'){
            setTimeLeft( ( ( (setterInfo.workMinutes*60)-totalBreakTime ) / numOfblocks)*60);
        }else if(mode==='break'){
            setTimeLeft(setterInfo.breakMinutes*60);
        }else{
            setTimeLeft( ( ( (setterInfo.workMinutes*60)-totalBreakTime ) / numOfblocks)*60);
        }

    }
   
    function switchMode(){
        const nextMode = modeRef.current === 'work' ? 'break' : 'work';
        const nextTime = 60* (nextMode === 'work'? ( (60*setterInfo.workMinutes) - totalBreakTime ) / numOfblocks : setterInfo.breakMinutes);

        setMode(nextMode);
        modeRef.current = nextMode;

        setTimeLeft(nextTime);
        timeLeftRef.current = nextTime;

    }

 useEffect(() => {

    initiateTimer();

   const interval = setInterval(()=>{
   
        if(isPausedRef.current){
            return;
        }
        if(timeLeftRef.current === 0){
            return switchMode();
        }

       
        tick();
    }, 1);

        return ()=>clearInterval(interval);

    }, [setterInfo])
    
    const minutes = Math.floor(timeLeft / 60); // 44.8 -> 45
    const seconds = Math.floor(timeLeft % 60);
    

    const addZero = (number) =>{
       return number < 10 ? "0"+number :number;
    }

    const showTheButtons =()=>{
        if(setterInfo.showButtons === true){
            return <div style={{display:'flex', justifyCotent:'center', alignItems:'center'}}>
                
                <Play className="play" onClick={() => { setIsPaused(false); isPausedRef.current = false; }}/>
                <Pause className="pause" onClick={() => { setIsPaused(true); isPausedRef.current = true; }}/>
                
                <div style={{marginLeft:'30px'}} >
                    {mode==='break'?<Skip onClick={()=>{timeLeftRef.current = 0; setMode('work')}}/>:null}
                </div>
            </div>
        }
    }

    const [blockNum, setBlockNum] = useState(1);
    const blockNumRef = useRef(blockNum);

    const[block, setBlock] = useState(0);
    const blockRef = useRef(block);

    // let block = 1;

     useEffect(() =>{
        const timeout =  setTimeout(()=>{

            console.log("yes")

            function pause(){
                setIsPaused(true);
                isPausedRef.current = true;
            }

            if(mode === 'break' && setterInfo.hasUserRated===false){
                return pause();
            }else if(mode === 'work' && setterInfo.hasUserRated===true){
                setterInfo.setHasUserRated(false);
                blockRef.current = blockRef.current + 1;
                blockNumRef.current = blockNumRef.current + blockRef.current;
                blockRef.current = 0;
            }
                // else if(mode === 'break' && setterInfo.hasUserRated === true){
                //     setIsPaused(false);
                //     isPausedRef.current = false;
                // }
        });
            
        return ()=>clearTimeout(timeout);
        
    },[isPaused,mode, setterInfo, block])

    const showRating =()=>{
        if(mode === 'break'){
            return <Rating/>
        }
    }

    return (
        
        <div className='timer'>

            {totalWorkTime <= totalBreakTime?setterInfo.setIsWorkGreater(false):setterInfo.setIsWorkGreater(true)}

            {setterInfo.showData?<div className='blockdiv'><p>Your session </p></div>:null}
            {setterInfo.showData?<div className='blockdiv'><p>will have {totalWorkTime} minutes of work time</p></div>:null}
            {setterInfo.showData?<div className='blockdiv'><p>and {totalBreakTime} minutes of break time</p></div>:null}
            {setterInfo.showData?<div className='blockdiv'><p>Session Will be completed in {numOfblocks} block(s)</p></div>:null}

            <div style={{borderRadius:'10px'}} className='blockdiv'><p>You are currently: {mode === 'work'?"working...":"on break..."}</p></div>
            {mode==="work"?<div style={{borderRadius:'10px'}} className='blockdiv'><p>Block #{blockNumRef.current}/{numOfblocks}</p></div>:null}

            <div className='time'>
                <p>{totalWorkTime <= totalBreakTime?"00" :addZero(minutes)}</p>
                <p className='semicolon'>:</p>
                <p>{totalWorkTime <= totalBreakTime?"00" :addZero(seconds)}</p>
            </div>
            
            <div className='timerbuttons'>
                {setterInfo.showButtons?showTheButtons():null}
               
            </div> 

            {totalWorkTime <= totalBreakTime? 
            <div className='blockdiv'>
                <p>Your work time cannot be less than or equal to your break time.</p>
                <p>For the sake of productivity.</p>
            </div>:null}

            {showRating()}
            {/* {mode === 'break'? <Rating/>:null} */}
            {/* {isWorkTimeUp} */}
            {/* {showThisRating? <Rating/> : null} */}
            {/* {isBlockOver && isPaused === true?<Rating/>:null} */}

        </div>
    )
}

export default Timer