import socketIOClient from "socket.io-client";
import {fn} from './constants.js';
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
        const socket = socketIOClient('localhost:3001');
        socket.emit('message', message);    
        });
        
    },
    resend:async (message)=>{
        return new Promise(async ()=>{
        const socket = socketIOClient('localhost:3001');
        socket.emit('crossPop', message);    
        });
        
    },
    save:(json)=>{
        return new Promise(async ()=> {
            const socket = socketIOClient('localhost:3001');
            socket.emit('Save', json);    
        });
    },
    clear:(params)=>{
        return new Promise(async ()=> {
            const socket = socketIOClient('localhost:3001');
            socket.emit('clear', params);    
        });
    }
};