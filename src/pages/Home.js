import "@scss/pages/home.component.scss"
import WithStoreReady from '../components/WithStore.hoc';
import React from 'react';
//import { makeStyles } from '@material-ui/core/styles';
import Input from '@components/Input';
import { log } from 'x-utils-es';
import Todo from '../components/Todos/Todo';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: '100%',
//   },
//   heading: {
//     fontSize: theme.typography.pxToRem(15),
//     fontWeight: theme.typography.fontWeightRegular,
//   },
// }));


function Home(props){
  const {mobxstore} = props 

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

export default WithStoreReady(Home);



