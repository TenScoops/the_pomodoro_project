import React, { useContext } from 'react';
// import Header from './Header';
// import Timer from './Timer';
import SetterContext from './SetterContext';
import Startsession from './Buttons/Startsession';


const Contents = () => {
  const setterInfo = useContext(SetterContext);
  return (
    <div>
        <div className='Content'>
            <div className='paragraph'>
                <p>This app is meant to help you become a better, productive person. Over time you will notice more 
                and more results and this will be achieved through the help of our rating system, click this button
                below to dive in... 
                </p>
            </div>
            <div className='divsession'>
              <Startsession  onClick={() => {setterInfo.setShowSetterPage(true)}}/>
              {/* <Timer/>  */}
            </div>
        </div>
    </div>
  )
}

export default Contents