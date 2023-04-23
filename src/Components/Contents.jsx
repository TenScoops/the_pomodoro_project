import React, { useContext } from 'react';
import SetterContext from './SetterContext';
import { UserAuth } from '../FirebaseAuth/AuthContext';
import {AiOutlineQuestionCircle} from 'react-icons/ai';
import Tooltip from "@material-ui/core/Tooltip";
import {withStyles} from "@material-ui/core/styles";

const Contents = () => {
  const setterInfo = useContext(SetterContext);

  const {user} = UserAuth();
  
  const questionMark =()=>{
    return <TheTooltip title="More Info" placement='bottom'>
      <button className='questionMark'onClick={()=>{setterInfo.setSynopsis(true)}} >
        <AiOutlineQuestionCircle/>
      </button>
    </TheTooltip>
  }
  const questionMark2 =()=>{
    return <TheTooltip title="More Info" placement='top'><button className='questionMark2' onClick={()=>{setterInfo.setSynopsis(true)}} >
      <AiOutlineQuestionCircle className='questionMark2'/>
    </button>
    </TheTooltip>
  }

  const TheTooltip = withStyles({
    tooltip: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      color: "white",
      backgroundColor: "rgb(18, 18, 18)",
      maxWidth:'120px',
      height:'23px',
      fontSize:'12px',
      fontFamily:'kalam',
      marginTop:'20px',
      // boxShadow: '7px 10px 5px 0px rgba(0,0,0,0.75)',

    }
  })(Tooltip);
  
  return (
    <div>
        <div className='Content'>
            <div className='text-div' style={{display:'flex', flexDirection:'column', letterSpacing:'1px'}}>

                {user?.displayName? <div>
                  <p className='content-text'>&nbsp;{questionMark2()} Hi {user?.displayName}! &nbsp;</p>
                <p className='content-text'></p>
                </div> 
                  :
                  <div>
                <p className='content-text'>
                  &nbsp;Do you find yourself struggling with productivity? {questionMark2()}
                </p>
                <p className='content-text'></p>
                </div>
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