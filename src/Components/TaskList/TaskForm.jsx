import React,{useState, useEffect, useRef} from 'react';
import {AiOutlinePlusCircle} from 'react-icons/ai'
import {ImPencil2} from 'react-icons/im'

const TaskForm = (props) => {
    const[input, setInput] = useState('');

    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current.focus()
    })

    const handleChange = (e) =>{ //allow user to type in text box
        setInput(e.target.value);
    }

    const handleSubmit = e =>{
        e.preventDefault();

        props.onSubmit({
            id: Math.floor(Math.random()*10000),
            text: input
        });

        setInput('')
    };

  return (
    <form className='task-form' onSubmit={handleSubmit}>
        <input 
             type='text' 
             placeholder='Add a task' 
             value={input}
             name='text'
             className='task-input'
             onChange={handleChange}
             ref={inputRef}
        />
        <button title='add' className='task-button'><ImPencil2 style={{fontSize:'30px'}}/></button>
    </form>
  )
}

export default TaskForm