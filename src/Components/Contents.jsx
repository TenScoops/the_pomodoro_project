// import Tooltip from "@material-ui/core/Tooltip";
// import { withStyles } from "@material-ui/core/styles";
import React, { useContext } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { UserAuth } from '../FirebaseAuth/AuthContext';
import SetterContext from './SetterContext';


const Contents = () => {
  const setterInfo = useContext(SetterContext);

  const {user} = UserAuth();
  
  const questionMark =()=>{
    return <button className='questionMark'onClick={()=>{setterInfo.setSynopsis(true)}} >
        <AiOutlineQuestionCircle/>
      </button>
    
  }
  const questionMark2 =()=>{
    return <button className='questionMark2' onClick={()=>{setterInfo.setSynopsis(true)}} >
      <AiOutlineQuestionCircle className='questionMark2'/>
    </button>
   
  }

  // const TheTooltip = withStyles({
  //   arrow:{
  //     "&::before": {
  //       backgroundColor: "black",
  //     }
  //   },
  //   tooltip: {
  //     display:'flex',
  //     justifyContent:'center',
  //     alignItems:'center',
  //     color: "white",
  //     backgroundColor: "rgb(18, 18, 18)",
  //     maxWidth:'120px',
  //     height:'23px',
  //     fontSize:'13px',
  //     fontFamily:'kalam',
  //     marginTop:'20px',
  //     letterSpacing:'1px'

  //   }
  // })(Tooltip);
  
  return (
    <div>
        <div className='Content'>
              
              {/* <h1 className='h1-text' style={{marginTop:'40px', marginBottom:'0'}} >
                The Progress Pomodoro 
              </h1>  */}

            {/* <hr style={{margin:'0', padding:'0', width:'80px'}}/> */}
            <div className='the-content-text'>
              <div >
                  {user?.displayName? <div className='text-div' style={{letterSpacing:'1px'}}>
                    <p className='content-text'> Hi {user?.displayName}!</p>
                  </div> 
                    :
                    <div className='text-div' >
                  <p className='content-text'>
                    Do you find yourself struggling with productivity? Can't seem to get motivated? Can't seem to get out bed?
                  </p>
                 
                  </div>
                  }
              </div>

              <div className='divsession-buttons'>
                {questionMark()}
                <button className='startSession-button' 
                onClick={() => {setterInfo.setShowSetterPage(true); setterInfo.setShowParagraph(false); }}>
                  Start a session </button>
              </div>
            </div>
            
        </div>
    </div>
  )
}

export default Contents