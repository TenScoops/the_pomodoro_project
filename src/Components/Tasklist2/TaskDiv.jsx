import React from 'react';
import {HiOutlinePencilAlt} from 'react-icons/hi'
import {TfiTrash} from 'react-icons/tfi'

const MyTaskForm = ({task, toggleComplete, deleteTask }) => {
  return (
  
        <div  className={task.completed ? 'task-row + complete':'task-row'}
                onClick={()=>{toggleComplete(task)}}>

            <div style={{display:'flex', flexDirection:'row'}}>
                <input 
                onChange={() => toggleComplete(task)} type='checkbox' checked={task.completed? 'checked': ''}/>
                <p onClick={() => toggleComplete(task)} className={task.completed?'text-complete': 'texts'} style={{margin:'10px', cursor:'pointer'}}>{task.text}</p>
            </div>

            <div className="icons">
                {/* <HiOutlinePencilAlt
                    title='edit'
                    onClick={()=> editTask()}
                    className='edit-icon'
                /> */}
                <TfiTrash
                    title='delete'
                    onClick={()=> deleteTask(task.id)}
                    className='delete-icon'
                />
            </div>

        </div>

  )
}

export default MyTaskForm