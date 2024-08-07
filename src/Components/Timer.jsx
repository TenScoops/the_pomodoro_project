import React, { useContext, useEffect, useRef, useState } from 'react';
import Areyousure from './Areyousure';
import Skip from './Buttons/Skip';
import './CSS/Timer.css';
import Rating from './Rating';
import SetterContext from './SetterContext';

const Timer = () => {
  const setterInfo = useContext(SetterContext);
  const [isPaused, setIsPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState('');

  const timeLeftRef = useRef(timeLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  const totalBreakTime = setterInfo.numOfBreaks * setterInfo.breakMinutes;
  const numOfblocks = setterInfo.numOfBreaks + 1;
  const totalWorkTime = setterInfo.workMinutes * 60 - totalBreakTime;

  const blockNumRef = useRef(setterInfo.blockNum);
  const [block] = useState(0);
  const blockRef = useRef(block);

  window.onbeforeunload = function () {
    return true;
  };

  function tick() {
    timeLeftRef.current--;
    setTimeLeft(timeLeftRef.current);
  }

  const grabTimeWorked = () =>{
    const timeWorked = timeLeft/60
  }
  const whenUserRates = () =>{
    
  }
  function initiateTimer() {
    if (mode === 'work') {
      setTimeLeft(((setterInfo.workMinutes * 60 - totalBreakTime) / numOfblocks) * 60);
    } else if (mode === 'break') {
      setTimeLeft(setterInfo.breakMinutes * 60);
    } else {
      setTimeLeft(((setterInfo.workMinutes * 60 - totalBreakTime) / numOfblocks) * 60);
    }
  }

  function switchMode() {
    const nextMode = modeRef.current === 'work' ? 'break' : 'work';
    const nextTime = 60 * (nextMode === 'work' ? ((60 * setterInfo.workMinutes) - totalBreakTime) / numOfblocks : setterInfo.breakMinutes);
    setMode(nextMode);
    modeRef.current = nextMode;
    setTimeLeft(nextTime);
    timeLeftRef.current = nextTime;
  }

  useEffect(() => {
    initiateTimer();
  }, [setterInfo]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      } else if (timeLeftRef.current === 0) {
        switchMode();
      } else {
        tick();
      }
    }, 1);

    return () => clearInterval(interval);
  }, [setterInfo]);

  useEffect(() => {
    function pause() {
      setIsPaused(true);
      isPausedRef.current = true;
    }

    if (mode === 'break' && !setterInfo.hasUserRated) {
      pause();
    } else if (mode === 'work' && setterInfo.hasUserRated) {
      setterInfo.setHasUserRated(false);
      blockRef.current += 1;
      blockNumRef.current += blockRef.current;
      setterInfo.blockNum += blockRef.current;
      setterInfo.setBlockNum(setterInfo.blockNum);
      blockRef.current = 0;
    }

    if (setterInfo.blockNum === numOfblocks && mode === 'break') {
      setterInfo.setSessionComplete(true);
      setterInfo.blockNum = 0;
      setterInfo.setBlockNum(setterInfo.blockNum);
    }
  }, [isPaused, mode, setterInfo, blockRef]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  const addZero = (number) => {
    return number < 10 ? '0' + number : number;
  };

  const showTheButtons = () => {
    if (setterInfo.showButtons === true) {
      return (
        <div style={{ display: 'flex', justifyCotent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyCotent: 'center', alignItems: 'center' }}>
            {isPaused ? (
              <button
                className="play"
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                }}
              >
                Start
              </button>
            ) : (
              <button
                className="pause"
                onClick={() => {
                  setIsPaused(true);
                  isPausedRef.current = true;
                }}
              >
                Pause
              </button>
            )}
            {mode === 'break' ? (
              <Skip title="Skip Break" onClick={() => {
                timeLeftRef.current = 0;
                setMode('work');
              }}/>
            ) : null}
          </div>
          <div style={{ display: 'flex', justifyCotent: 'center', alignItems: 'center' }}>
            <button className='cancel' style={{ width: '150px', height: '25px', marginLeft: '55px', borderRadius: '12px' }}
              onClick={() => {
                setterInfo.setClicked(false);
                setterInfo.setCancelTheSession(true);
              }}>
              Cancel Session
            </button>
          </div>
        </div>
      );
    }
  };

  const showRating = () => {
    if (mode === 'break') {
      return <Rating/>;
    }
  };

  return (
    <div className='timer'>
      {totalWorkTime <= totalBreakTime ? (
        setterInfo.setIsWorkGreater(false)
      ) : (
        setterInfo.setIsWorkGreater(true)
      )}
      <div className='showUserData' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {setterInfo.showData ? (
          <div className='blockdiv'><p>&nbsp;Your session &nbsp;</p></div>
        ) : null}
        {setterInfo.showData ? (
          <div className='blockdiv'><p>&nbsp;Will have {totalWorkTime} minutes of worktime&nbsp;</p></div>
        ) : null}
        {setterInfo.showData ? (
          <div className='blockdiv'><p>&nbsp;And {totalBreakTime} minutes of breaktime&nbsp;</p></div>
        ) : null}
        {setterInfo.showData ? (
          <div style={{ marginLeft: '15px' }} className='blockdiv'>
            <p style={{ color: 'black', backgroundColor: 'white' }}>&nbsp;Session will be completed in {numOfblocks} block(s)&nbsp;</p>
          </div>
        ) : null}
        {setterInfo.showData ? (
          <div className='blockdiv'><p >&nbsp;With {addZero(minutes)}:{addZero(seconds)} minutes per block&nbsp;</p></div>
        ) : null}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {setterInfo.showClock && (
          <div style={{ borderRadius: '10px' }} className='blockdiv2'>
            <p>&nbsp;You are currently: {mode === 'work' ? 'working..' : 'on break.'}&nbsp;</p>
          </div>
        )}
      </div>

      {mode === 'work' && (
        <div style={{ borderRadius: '10px', marginBottom: '20px' }} className='blockdiv2'>
          <p>&nbsp;Block #{blockNumRef.current}/{numOfblocks}&nbsp;</p>
        </div>
      )}

      {setterInfo.showClock && (
        <div className='timediv'>
          <div className={setterInfo.showButtons ? 'time' : 'time + new-font'}>
            <p style={{ marginLeft: '20px' }} className='minutes'>
              {totalWorkTime < totalBreakTime ? '00' : addZero(minutes)}
            </p>
            <p className='semicolon'>:</p>
            <p style={{ marginRight: '20px' }} className='seconds'>
              {totalWorkTime < totalBreakTime ? '00' : addZero(seconds)}
            </p>
          </div>
        </div>
      )}

      {setterInfo.showClock && (
        <div className='timerbuttons'>
          {setterInfo.showButtons ? showTheButtons() : null}
        </div>
      )}

      {totalWorkTime < totalBreakTime && (
        <div className='blockdiv' style={{ backgroundColor: 'white', color: 'darkred' }}>
          <p>Worktime cannot be less than your breaktime.</p>
        </div>
      )}

      {showRating()}
      {setterInfo.cancelTheSession ? <Areyousure/> : null}
      {setterInfo.sessionComplete ? setterInfo.setShowTimerPage(false) : null}
      {window.onbeforeunload()}
    </div>
  );
};

export default Timer;
