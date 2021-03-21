
import "../theme/scss/pages/home.component.scss"
import withStoreReady from '../components/withStore.hoc'
import React from 'react'
import Input from '../components/Input'
import BucketTodo from '../components/Todos/BucketTodo'

function Home(props) {
    const { mobxstore } = props 

    const storeOnUpdateHandler = (data, id, entity, eventName, childStore, onDone) => {
        mobxstore.onUpdate(data, id, entity, eventName, childStore, onDone)
    }

    return (
        <>
            <div className="row">
                <div className="col-sm-12 col-md-8 m-auto bucket-wrap ">
                    <div className="d-flex justify-content-center align-items-center m-auto">
                        <Input
                            className='bucket-add-input'
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
                <div className="col-sm-12 col-md-7 m-auto p-4">
                    <BucketTodo mobxstore={mobxstore} onUpdate={storeOnUpdateHandler}/>
                </div>
            </div>
        </>
    )
}

export default withStoreReady(Home)
