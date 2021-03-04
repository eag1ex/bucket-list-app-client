import "@scss/pages/home.component.scss"

import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Input from '@components/Input';
import Add from '@components/Add';

import {log} from 'x-utils-es';
import Todo from '../components/Todos/Todo'
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

class Home extends PureComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      newBucketTitle:'New bucket'
    }
  }

  actionAdd(data){
    log('actionAdd',data)
  }

  render() {
    return (
      <>
      <div className="row">   
          <div className="col-8 m-auto">
              <div className="d-flex justify-content-center align-items-center w-50 m-auto">
                  <Input 
                  onUpdate={()=>{
                    log('on update')
                  }}
                  variantName='outlined' text={this.state.newBucketTitle}/><Add actionAdd={()=>{
                    this.actionAdd()
                  }} />
              </div>
          </div>
      </div>

      <div className="row">
          <div className="col-8 m-auto">
                  <Todo/>
          </div>
      </div>

      </>
    );
  }
}
export default Home;



