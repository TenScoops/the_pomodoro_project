import React, { useContext } from 'react';
import SetterContext from './SetterContext';
import { UserAuth } from '../FirebaseAuth/AuthContext';
import {AiOutlineQuestionCircle} from 'react-icons/ai';

const Contents = () => {
  const setterInfo = useContext(SetterContext);

  const {user} = UserAuth();
  
  const questionMark =()=>{
    return <button className='questionMark' title="The rating system" onClick={()=>{setterInfo.setSynopsis(true)}} >
      <AiOutlineQuestionCircle/>
    </button>
  }
  const questionMark2 =()=>{
    return <button className='questionMark2' title="The rating system" onClick={()=>{setterInfo.setSynopsis(true)}} >
      <AiOutlineQuestionCircle className='questionMark2'/>
    </button>
  }

  return (
    <div>
        <div className='Content'>
            <div className='text-div' style={{display:'flex', flexDirection:'column', letterSpacing:'1px'}}>

                {user?.displayName? <p className='content-text'>{questionMark2()}Hi {user?.displayName}!</p> 
                  :
                <p className='content-text'>
                  Do you find yourself struggling with productivity?{questionMark2()}  
                </p>
                }
            </div>

            <div className='divsession'>
              {questionMark()} 
              <button className='startSession-button' 
              onClick={() => {setterInfo.setShowSetterPage(true); setterInfo.setShowParagraph(false); }}>
                 Start a session </button>
            </div>

            
        </div>
    </div>
  )
}

export default Contents