import "@scss/pages/home.component.scss"

import React, { PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Input from '@components/Input';
import Add from '@components/Add';
import TodoList from '@components/TodoList';
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
                  <Input variantName='outlined' text="Outline"/><Add actionAdd={this.actionAdd.bind(this)} />
              </div>
          </div>
      </div>

      <div className="row">
          <div className="col-8 m-auto">
                  <TodoList/> 
          </div>
      </div>
      
        <div id="home-page">

          <h1 className="title is-1">This is the Home Page</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras gravida,
            risus at dapibus aliquet, elit quam scelerisque tortor, nec accumsan eros
            nulla interdum justo. Pellentesque dignissim, sapien et congue rutrum,
            lorem tortor dapibus turpis, sit amet vestibulum eros mi et odio.
          </p>
        </div>
      </>
    );
  }
}
export default Home;



