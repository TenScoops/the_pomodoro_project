import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import '../CSS/Rating.css';
import SetterContext from '../SetterContext';
import './Task.css';
import TaskList from './TaskList';
  

const Task = () => {
  const [modalOpen, setModalOpen] = useState(true);

  const taskInfo = useContext(SetterContext);

  const customStyles = {
    overlay: {
      backgroundColor: '#1e212d52'
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#181a24',
      height:'65vh',
      width: '80vmin',
      borderRadius:'30px',
    }
  };

  const closeModal=()=>{
    setModalOpen(false)
    taskInfo.setOpenTask(false)
  }
  const closeButton=()=>{
    return<button onClick={()=>{closeModal()}} className='close'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
  }

  return (
    <div>
        <Modal
            isOpen={modalOpen}
            onRequestClose={() => closeModal()}
            style={customStyles} 
        > 
            {closeButton()}
            
            <div className='task'>
                <TaskList/>
            </div>

        </Modal>
    </div>
  )
}

export default Task