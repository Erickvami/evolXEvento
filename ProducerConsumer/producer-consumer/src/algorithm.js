import socketIOClient from "socket.io-client";
import {fn} from './constants.js';
let MANAGER_IP='192.168.1.212:3001';
export const algorithm={
generateRandomPopulation: (definition)=>{
var random={
int:()=>Math.round(Math.random()* (definition.rangeValue[1]*2))-definition.rangeValue[1],
float:()=>Math.random()*(fn.ranges[definition.fitness][1]*2)+fn.ranges[definition.fitness][0],
decimals:()=>Math.random()*(Math.round(Math.random())===1?1:-1)
}
return (new Array(definition.length).fill()).map(()=>(new Array(definition.size).fill(0)).map(()=>random[definition.type]()));
},
send:async (message)=>{
return new Promise(async ()=>{
const socket = socketIOClient(MANAGER_IP);
socket.emit('message', message);
});
},
resend:async (message)=>{
return new Promise(async ()=>{
const socket = socketIOClient(MANAGER_IP);
socket.emit('crossPop', message);
});
},
save:(json)=>{
return new Promise(async ()=> {
const socket = socketIOClient(MANAGER_IP);
socket.emit('Save', json);
});
},
clear:(params)=>{
return new Promise(async ()=> {
const socket = socketIOClient(MANAGER_IP);
socket.emit('clear', params);
});
},
requestJSON:(expId)=>{
    return new Promise(async ()=> {
        const socket = socketIOClient(MANAGER_IP);
        socket.emit('downloadLog', expId);
        });
},
downloadJSON:(exportObj, exportName)=>{
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
};