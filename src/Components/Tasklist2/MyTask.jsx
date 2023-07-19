import React, { useContext, useState, useEffect } from 'react';
import Modal from "react-modal";
import SetterContext from '../SetterContext';
import '../TaskList/Task.css';
import {ImPencil2} from 'react-icons/im';
import TaskDiv from './TaskDiv';
import { UserAuth } from '../../FirebaseAuth/AuthContext';
import { db } from '../../Firebase';
import {query, collection, onSnapshot, 
  updateDoc, doc, addDoc, deleteDoc, editDoc} from 'firebase/firestore';
// import { text } from '@fortawesome/fontawesome';
// import { } from 'firebase/firestore';
  

const Task = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  // const [edit, setEdit] = useState('')
  const { user } = UserAuth();
  
  const taskInfo = useContext(SetterContext);

  const customStyles = {
    overlay: {
      backgroundColor: 'transparent'
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
      border:'solid 2px black'
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
  
  //create task
  const createTask = async (e) => {
    e.preventDefault(e);
    if(input === ''){
      return;
    }
    try{
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        text:input,
        completed:false
    })
    setInput('')
    }catch (error){
      console.log('Error creating task:', error)
    }
  }

  //read taskfrom firebase
  useEffect(()=>{
    try{
      const q = query(collection(db, `users/${user.uid}/tasks`))
      const unsubscribe = onSnapshot(q,(querySnapshot) => {
        let tasksArr= []
        querySnapshot.forEach((doc) =>{
          tasksArr.push({...doc.data(), id: doc.id})
        });
        setTasks(tasksArr)
      })
      return () => unsubscribe()

      }catch (error){
        console.log('Error reading task:', error)
      }
  }, [])
  //update task in fire base
  const toggleComplete = async (task) => {
    try{
     await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
      completed: !task.completed
    })

    }catch(error){
      console.log('error updating task:', error)
    }
  }
  //delete todo
  const deleteTask = async (id) =>{
    try{
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, id))

    }catch(error){
      console.log('error deleting task:', error)
    }
  }

  const TheTask =()=>{
    if (!user) {//if null, undefined, user not authenticated
      // User is not authenticated, you can show a loading spinner or redirect to the login page
      return <div>Loading...</div>;
    }
  }
  
  //edit todo
  // const editTask =  () => {
  //   return<form onSubmit={createTask} className='task-form'>
  //                 <input value={edit} onChange={(e) => setEdit(e.target.value)} className='task-input' type='text' placeholder='Add a task'/>
                
  //               <button title='add' className='task-button'><ImPencil2 style={{fontSize:'30px'}}/></button>
  //               </form>
  //   await updateDoc(doc(db, 'tasks', task.id), {
  //     completed: false,
  //     text: edit
  //   })
  // }
  return (
    <div>
        <Modal
            isOpen={modalOpen}
            onRequestClose={() => closeModal()}
            style={customStyles} 
        > 
            {closeButton()}
            
            {user?<div className='task'>
              {/* <div > */}
                
                <form onSubmit={createTask} className='task-form'>
                  <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className='task-input' 
                  type='text' 
                  placeholder='Add a task'
                  />
                  <button title='add' className='task-button'><ImPencil2 style={{fontSize:'30px'}}/></button>
                </form>

                <ul 
                  style={{display:'flex', flexDirection:'column', 
                  alignItems:'center', justifyContent:'center', padding:'0'}}>
                    
                  {tasks.map((task, index)=>(
                    <TaskDiv
                      key={index} 
                      task={task} 
                      toggleComplete={toggleComplete} 
                      deleteTask = {deleteTask} 
                    />
                  ))}
                  <p>{`you have ${tasks.length}` } {tasks.length===1?'task':'tasks'}</p>
                
                </ul>
              {/* </div> */}

            </div>:null
}
        </Modal>
    </div>
  )
}

export default Task