const server= require('http').createServer();
const socket= require('socket.io')(server);
var amqp= require('amqplib/callback_api');
const writeJsonFile = require('write-json-file');

let globalPop=[];
let resendLimit=0;
let resends=0;

const cross={
  singlePoint:(ParentOne,ParentTwo)=> {
      
  },
  uniform: (ParentOne,ParentTwo)=> {
              var parents=[ParentOne,ParentTwo];
              var mask= ParentOne.map(item=> Math.round(Math.random()));
              return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
          }
};

//Receive messages from socket.io
socket.on('connection',client=>{
    client.on('message',async (msn)=>{
        console.log('sending:=>',msn.id);
        globalPop.push(msn);
        setTimeout(async ()=>{
        sendRabbitmq(JSON.stringify(msn));
        },2000);
    });
    client.on('clear',async (msn)=>{
        console.log('clear');
        resends=0;
        resendLimit=msn;
        console.log('resendLimit=',msn);
        globalPop=[];
    });
    client.on('crossPop',async (msn)=>{
        crossPop(msn);
    });
    client.on('Save',async (msn)=>{
        await writeJsonFile('Experiments/Experiment_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), msn);
        await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), globalPop);
    });
    client.on('disconnect',()=>{
        
    });
});
socket.on('error',err=>console.log('received socket error:',err));

server.listen(3001,err=>{
   if(err) throw err
   console.log('listening on port 3001');
});

//Receive messages from Rabbitmq
 amqp.connect('amqp://localhost',function(err,conn){
     conn.createChannel(function(err,ch){
        var q= 'Evolved';//channel's name 
        ch.assertQueue(q,{durable:false});

        ch.consume('Evolved', function(msg) {
            var evolvedPop=JSON.parse(msg.content);
            globalPop= globalPop.filter(f=> f.id!==evolvedPop.id);
            globalPop.push(evolvedPop);
            resends++;
            if(resends<=resendLimit && resends!==0){
                console.log(resends,resendLimit);
            crossPop(evolvedPop);    
            }else if(resends>resendLimit){
                socket.emit('finished',true);
                Save();
            }
            
            console.log('<=:receiving :',evolvedPop.id);
        socket.emit('evolved',evolvedPop);
        }, {noAck: true});
     });
 });

async function Save(){
        await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), globalPop);
}

async function sendRabbitmq(message){
    return new Promise(async (resolve)=>{
         amqp.connect('amqp://localhost',function(err,conn){
conn.createChannel(function(err,ch){
   var q= 'GA';//channel's name 
    ch.assertQueue(q,{durable:false});
    ch.sendToQueue(q,new Buffer.from(message));
});
         });
    });
}

//async function crossPop(msn){
//    return new Promise(async (resolve)=>{
//        setTimeout(async ()=>{
//        let crossedPop=cross.uniform(msn[0].population,msn[1].population);
//        crossedPop.forEach((pop,i)=>{
//            msn[i].population=pop;
//            console.log('resending=>:'+msn[i].id);
//            sendRabbitmq(JSON.stringify(msn[i]));
//        });    
//        },5000);
//    });
//}
async function crossPop(evolvedPop){
    return new Promise(async (resolve)=>{
        setTimeout(async ()=>{
            let selectedPop=[evolvedPop,globalPop.filter(f=> f.fitness===evolvedPop.fitness)[Math.round(Math.random()*(globalPop.filter(f=> f.fitness===evolvedPop.fitness).length-1))]];
        let crossedPop=cross.uniform(selectedPop[0].population,selectedPop[1].population);
        crossedPop.forEach((pop,i)=>{
            selectedPop[i].population=pop;
            console.log('resending=>:'+selectedPop[i].id);
            sendRabbitmq(JSON.stringify(selectedPop[i]));
        });    
        },5000);
    });
}

