import React from 'react'
import {useState, useEffect, useContext, useRef} from "react"; //hooks
import Pause from './Buttons/Pause';
import Play from './Buttons/Play';
import './CSS/Timer.css';
import SetterContext from './SetterContext';
import Rating from './Rating';
import Skip from './Buttons/Skip';
import Areyousure from './Areyousure';

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
     
    // const cancelSession = () =>{
    //     setterInfo.setShowParagraph(true)
    //     setterInfo.setShowTimerPage(false);
    //     setterInfo.setShowButtons(false);
    //     setterInfo.setShowData(true);
    //     setterInfo.setShowSetterPage(false);
    //   }

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
    }, 1000);

        return ()=>clearInterval(interval);

    }, [setterInfo])
    
    const minutes = Math.floor(timeLeft / 60); // 44.8 -> 45
    const seconds = Math.floor(timeLeft % 60);
    

    const addZero = (number) =>{
       return number < 10 ? "0"+number :number;
    }

    // function areYouSure(){
    //     return <div>
    //         <Areyousure/>
    //     </div>
    // }

    const showTheButtons =()=>{
        if(setterInfo.showButtons === true){
            return <div style={{display:'flex', justifyCotent:'center', alignItems:'center', flexDirection:'column'}}>
                <div style={{marginBottom:'60px'}}>
                    <Play title="Play" className="play" onClick={() => { setIsPaused(false); isPausedRef.current = false; }}/>
                    <Pause title="Pause" className="pause" onClick={() => { setIsPaused(true); isPausedRef.current = true; }}/>
                    {mode==='break'?<Skip title="Skip Break" onClick={()=>{timeLeftRef.current = 0; setMode('work')}}/>:null}
                    
                </div>

                <div>
                    <button className ='cancel' onClick={() =>{setterInfo.setCancelTheSession(true)}}
                    style={{width:'150px', marginLeft:'20px',  borderRadius:'15px', fontSize:'15px'}}>Cancel Session</button>
                </div>
                    
            </div>
        }
    }

    // const [blockNum, setBlockNum] = useState(1);
    const blockNumRef = useRef(setterInfo.blockNum);

    const[block, setBlock] = useState(0);
    const blockRef = useRef(block);

    // let block = 1;

     useEffect(() =>{
        const timeout =  setTimeout(()=>{

            console.log("yes")

            function pause(){
                setIsPaused(true);
                isPausedRef.current = true;
                // if(setterInfo.showParagraph === true){
                //     setterInfo.blockNum = 0;
                //     setterInfo.setBlockNum(setterInfo.blockNum);
                // }
            }

            if(mode === 'break' && setterInfo.hasUserRated===false){
                
                return pause();
            }else if(mode === 'work' && setterInfo.hasUserRated===true){
                setterInfo.setHasUserRated(false);
                blockRef.current = blockRef.current + 1;
                blockNumRef.current = blockNumRef.current + blockRef.current;

                setterInfo.blockNum = setterInfo.blockNum+ blockRef.current;
                setterInfo.setBlockNum(setterInfo.blockNum);

                blockRef.current = 0;
            }

            if(setterInfo.blockNum === numOfblocks && mode === 'break' ){//when session is complete
                setterInfo.setSessionComplete(true);
                setterInfo.blockNum = 0;
                setterInfo.setBlockNum(setterInfo.blockNum);
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
            {setterInfo.showData?<div className='blockdiv'><p style={{color:'black', backgroundColor:'white'}}>Session will be completed in {numOfblocks} block(s)</p></div>:null}

            {setterInfo.showData?null:<div style={{borderRadius:'10px',marginTop:'60px'}} className='blockdiv'><p>You are currently: {mode === 'work'?"working..":"on break."}</p></div>}
            {mode==="work"?<div style={{borderRadius:'10px'}} className='blockdiv'><p>Block #{blockNumRef.current}/{numOfblocks}</p></div>:null}

            <div className='time'>
                <p className='minutes'>{totalWorkTime <= totalBreakTime?"00" :addZero(minutes)}</p>
                <p className='semicolon'>:</p>
                <p className='seconds'>{totalWorkTime <= totalBreakTime?"00" :addZero(seconds)}</p>
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
            {setterInfo.cancelTheSession? <Areyousure/>:null}

            {setterInfo.sessionComplete?setterInfo.setShowTimerPage(false):null}
            {/* {mode === 'break'? <Rating/>:null} */}
            {/* {isWorkTimeUp} */}
            {/* {showThisRating? <Rating/> : null} */}
            {/* {isBlockOver && isPaused === true?<Rating/>:null} */}

        {/* <SetterContext.Provider value ={{
          setBlockNum,
          blockNum
        }}>
         
        </SetterContext.Provider> */}

        </div>
    )
}

export default Timer