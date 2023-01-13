import React from 'react';
import SetterContext from '../SetterContext';
// import './images/5996460.jpg';

const Login = () => {
    const [modalOpen, setModalOpen] = useState(true);
    // const [shouldOpen, setShouldOpen] = useState(true)
    const loginInfo = useContext(SetterContext);

    const customStyles = {
        overlay: {
            backgroundColor: '#08080b97',
            //#1e212d82
            //#1e212da3
            //#08080b97
        //  backdrop:'static'
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#181a24',
            height:'800px',
            width: '800px',
            borderRadius:'50px',
            // borderColor:'transparent'
            // backgroundRepeat: 'no-repeat',
            // backgroundAttachment:'fixed',
            // backgroundImage: `url(${'/5996460.jpg'})` ,
            //  backgroundImage: "url(/images/background3.jpg)" 
            padding:'0'
        }
    };

    const closeModal = () =>{
    setModalOpen(false)
    dataInfo.setData(false)
    }    
  return (
    <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
           <div style={{height:'100%', width:'100%'}}className='modals' >

            <div>
                <p>Username</p>
                <p>Password</p>
           </div>
          </div>
        </Modal>
  )
}

export default Login