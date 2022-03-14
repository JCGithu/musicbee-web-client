import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

console.log('woah!');

//TEXT CHANGER
let targetData = {};
let config = { characterData: true, attributes: false, childList: false, subtree: true };
let playingData;

var observer = new MutationObserver((list) => {
    let content = JSON.parse(list[0].target.data);
    console.log(content);
});
setTimeout(()=>{
    playingData = document.getElementById('playingData');
    console.log('starting observe');
    observer.observe(playingData, config);
}, 1000)

