import React from "react";
import ReactDOM from "react-dom";
// import "bulma/css/bulma.min.css";

import "@scss/styles.scss"; // < base theme
import App from "./App";

ReactDOM.render(
 // <React.StrictMode>
    <App />,
//  </React.StrictMode>,
  document.getElementById("root")
);
