import axios from 'axios'
import { useEffect, useState } from 'react'


export const DataManip = ({rating, time_worked})=>{
    const [userId, setUserID] = useState(null)
    const [date, setDate] = useState(Date.now())

    const fetchUserId = async() => {
        try{
        const response = await axios.get('http://localhost:3000/auth/user')
        const userData = response.data
        if(userData.loggedIn){
            setUserID(userData.user_id)
        }
        }catch(err){
            console.log(err)
        }
    }

    const sendBack = async ()=>{
        const temp = await axios.post("localhost:3000/activity/addActivity")

    }
   
    useEffect(()=>{
        fetchUserId()
    }, [])
    useEffect(()=>{
        if(userId !== null && rating!==null && time_worked!==null){
            setDate(Date.now())
            sendBack()
            
        }
    })

}