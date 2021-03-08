import "@scss/pages/home.component.scss"
import withStoreReady from '../components/withStore.hoc';
import React from 'react';
import { useParams } from "react-router-dom";
import Input from '@components/Input';
import Todo from '../components/Todos/Todo';



function Home(props){
  const {mobxstore} = props 
  const { user } = useParams();
  // console.log('you are logged in as: ',`user: ${user}`)
  
  return (
    <>
      <div className="row">
        <div className="col-8 m-auto">
          <div className="d-flex justify-content-center align-items-center w-50 m-auto">
            <Input
              variantName='outlined' text='New bucket' 
              add={ {mobxstore} }
              />
   
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-5 m-auto">
          <Todo mobxstore={mobxstore} />
        </div>
      </div>
    </>
  );
}

export default withStoreReady(Home)



