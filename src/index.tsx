import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import {App} from "src/render/App";

createRoot(document.getElementById("root"))
    .render(
        <App/>
    )
