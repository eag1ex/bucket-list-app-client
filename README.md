### Bucket List App (client)
#### - [ Developed by Eaglex ](http://eaglex.net)

#### About
This client application is a todo list running on React with Mobx, fully functional and connected to real api.
You create your a bucket with any number of tasks, all actions connected to rest api end points

- App page routing support
- Initially build stand alone using mocked data (so can be pulled back)
- Connected to real api end points
- Stateless application
- Mobx Store


#### Demo
Full featured hosted demo of `bucket-list` on :
```sh
https://whispering-everglades-48688.herokuapp.com/login
# login: eaglex
# password: eaglex
```
- demo database is reset and pureged for every session
- limited session time, hosted on free dyno, initial load may take bit longer


#### Server
For server app visit: `https://bitbucket.org/eag1ex/bucket-list-server/`




#### Install 
Build in `Node.js 12.0.0` and `NPM 6.9.0` in strict mode, maybe supported on higher but not tested

```sh
/$ npm i 
```


#### Start
**Before starting the app make sure the `bucket-list-server` application is up and running**
Opens in http://localhost:3000/

```sh
/$ npm start
```

#### Stack
Application stack: `React v16, Mobx v6, es6, MVC, React Material (configurable), Bootstrap (configurable), x-utils-es, Javascript`


#### Code Hierarchy
- App
- Components
    - Todos
        - Accordion
        - Bucket
        - Subtaks
    - Add
    - Input
    - Messages    
    - Navbar
    - withStore.hoc

- Pages
    - Home

- Store
    - api `(list of available api)`
    - Mobx `(store and state manager)`
    - dummy.data
- Theme `(scss and React Material)`

- Utils


#### Api/Store
- The api is controlled by the Mobx store via callback hook `storeOnUpdateHandler`


#### Create-react-app readme:
To know more about `npx create-react-app my-app` please read on here:
`https://github.com/facebook/create-react-app/blob/master/README.md`


#### Configs
- Sass/scss: the `.env` file needs to be adjusted depending on your OS environment, as per instructions in: `https://create-react-app.dev/docs/adding-a-sass-stylesheet`


#### Developer Notes
- This is my first take on `React with Mobx`, had to overcome view challenges
- The Api handling could be improved, perhaps patching it directly on the component without `storeOnUpdateHandler` hook
- No production version provided, as i have not tested it

#### Tests
* For now there are no coverage and tests optimized, i will get around to it.


#### Production
To run new build, execute  `npm run build` then move all files to `bucket-list-server` in `./views/bucket-app`
- check /add file `.env.production` and variables for api adjustments ...


#### .env
- `.env.development` looks at `bucket-list-server` running on your local server _(make sure to sets its mode to development)_ or you wont have access the api
- `.env.production` presumes, it is being hosted on `bucket-list-server`, you have to update `.env.production` with your REACT_APP_API_URL 


#### TODO
* NYC and Mocha for coverage


##### LICENSE
* LICENCE: CC BY-NC-ND 2.0
* SOURCE: https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode


##### Thank you

