import React from 'react';
import Modal from "react-modal";
import { useState, useContext } from 'react';
import SetterContext from '../SetterContext';

const Synopsis = () => {
  const synopInfo = useContext(SetterContext);
  const [modalOpen, setModalOpen] = useState(true);

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
      width: '1200px',
      borderRadius:'50px',
      // borderColor:'transparent'
      // backgroundRepeat: 'no-repeat',
      // backgroundAttachment:'fixed',
      // backgroundImage: `url(${'/5996460.jpg'})` ,
      //  backgroundImage: "url(/images/background3.jpg)" 
      padding:'0'
      
    }
  };

  const closeModal=()=>{
    setModalOpen(false)
    synopInfo.setSynopsis(false)
  }

  return (
    
      <Modal
      
              isOpen={modalOpen}
              onRequestClose={() => closeModal()}
              style={customStyles} 
              // shouldCloseOnOverlayClick={false}
            >
              <div style={{height:'100%', width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}} className='modals'>

                <p style={{width:'800px', margin:'0'}}className='lorem'>
                  {/* Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit maiores voluptatibus nostrum doloremque, nemo libero vero? Deleniti perspiciatis quibusdam necessitatibus reiciendis iste eum cum dolore harum, possimus accusamus commodi dicta.
                    Non quisquam ipsa labore dicta consequuntur est molestiae? Soluta voluptatum, mollitia sapiente, optio animi quibusdam culpa corrupti nihil nostrum cumque recusandae fugiat in veritatis facere rem temporibus, natus quidem doloribus.
                    Alias, repellat! Ex, error, suscipit ea numquam veritatis culpa dolorem dicta non sint eum asperiores quibusdam eligendi doloribus delectus dolor. At tempore quis labore numquam, accusamus esse natus sunt corrupti.
                    Iste quas id laboriosam non quibusdam laborum ducimus? Animi nostrum sed repudiandae optio recusandae suscipit corrupti vero delectus, ratione architecto unde eos harum iusto, accusantium corporis nihil odio laborum nobis.
                    Facilis non dolore necessitatibus architecto modi. Natus nemo placeat ea accusamus possimus commodi similique sunt numquam saepe magnam. Enim distinctio nihil quo eligendi vel asperiores laborum dolor corrupti obcaecati neque.
                    Tenetur quia sit necessitatibus quae vero iste quasi error rem repellendus debitis quos vitae natus perspiciatis provident recusandae, at sunt accusantium dolor possimus sequi eaque! Sed itaque repellat possimus explicabo.
                    Officia nemo saepe ipsum architecto corrupti ducimus alias sapiente ex sequi voluptatum necessitatibus, earum odit at ipsam consequuntur labore a accusamus reprehenderit facilis. Cumque excepturi quas culpa sit modi sunt.
                    Reiciendis, blanditiis. Accusantium quae blanditiis, amet ipsum rem expedita ipsa magnam, iusto minus error esse? Ex, autem doloremque dolorem corporis veritatis aliquid nihil, enim doloribus sit perferendis odit. Et, praesentium?
                    Perferendis iure molestias blanditiis magni. Eaque iure ullam culpa odit, quidem labore eos ipsa tempora vitae esse eum, sit laboriosam repellendus. Exercitationem, accusantium eius? Commodi, aliquid natus. Expedita, quasi harum.
                    Dignissimos ipsum eligendi quod veritatis nostrum quisquam perferendis maxime provident. Architecto cupiditate nulla natus in ipsum repudiandae corrupti ad iusto quibusdam dolore, facere perferendis quia debitis, eius reiciendis nam nisi. */}
                    </p>
    
                   {/* <button onClick={() => setModalOpen(false)}>Close Modal</button> */}

              </div>

        </Modal>
    
  )
}

export default Synopsis