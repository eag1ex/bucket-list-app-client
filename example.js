Promise.all([Promise.reject('err')]).catch(err => {
    console.log(err)
}).then((a) => console.log('ha?', a))
