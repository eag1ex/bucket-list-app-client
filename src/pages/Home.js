import "@scss/pages/home.component.scss"

import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Input from '@components/Input';
import Add from '@components/Add';
import TodoList from '@components/Todo/TodoList';
import {log} from 'x-utils-es';

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
                  <Input variantName='outlined' text="New bucket"/><Add actionAdd={this.actionAdd.bind(this)} />
              </div>
          </div>
      </div>

      <div className="row">
          <div className="col-8 m-auto">
                  <TodoList/> 
          </div>
      </div>

      </>
    );
  }
}
export default Home;



