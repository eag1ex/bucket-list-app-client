import "@scss/pages/home.component.scss"
import withStoreReady from '../components/withStore.hoc';
import React from 'react';
import { useParams } from "react-router-dom";
import Input from '@components/Input';
import BucketTodo from '../components/Todos/BucketTodo';
import { log} from 'x-utils-es';


function Home(props){
  const {mobxstore} = props 
  const { user } = useParams();
  // console.log('you are logged in as: ',`user: ${user}`)
  
  const storeOnUpdateHandler=(data,id,entity,eventName,childStore, onDone)=>{
    mobxstore.onUpdate(data,id,entity,eventName,childStore,onDone)
  }

  return (
    <>
      <div className="row">
        <div className="col-8 m-auto">
          <div className="d-flex justify-content-center align-items-center w-50 m-auto">
            <Input
              variantName='outlined' text='New bucket' 
              entity='homeComponent'
              childStore={null}
              onUpdate={storeOnUpdateHandler}
              add={ true }
              />
   
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-7 m-auto p-4">
          <BucketTodo mobxstore={mobxstore} onUpdate={storeOnUpdateHandler}/>
        </div>
      </div>
    </>
  );
}

export default withStoreReady(Home)



