const server= require('http').createServer();
const socket= require('socket.io')(server);
var amqp= require('amqplib/callback_api');
const writeJsonFile = require('write-json-file');

var cross={
  singlePoint:(ParentOne,ParentTwo)=> {
      
  },
  uniform: (ParentOne,ParentTwo)=> {
              var parents=[ParentOne,ParentTwo];
              var mask= ParentOne.map(item=> Math.round(Math.random()));
              return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
          }
};

socket.on('connection',client=>{
    client.on('message',async (msn)=>{
        console.log('sending:=>',msn.id);
        setTimeout(async ()=>{
        sendRabbitmq(JSON.stringify(msn));
        },2000);
    });
    client.on('crossPop',async (msn)=>{
        crossPop(msn);
    });
    client.on('Save',async (msn)=>{
        await writeJsonFile('Experiments/Experiment_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), msn);
    });
    client.on('disconnect',()=>{
//        console.log('client disconnect...',client.id);
        
    });
});
socket.on('error',err=>console.log('received socket error:',err));

server.listen(3001,err=>{
   if(err) throw err
   console.log('listening on port 3001');
});


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

async function crossPop(msn){
    return new Promise(async (resolve)=>{
        setTimeout(async ()=>{
        let crossedPop=cross.uniform(msn[0].population,msn[1].population);
        crossedPop.forEach((pop,i)=>{
            msn[i].population=pop;
            console.log('resending=>:'+msn[i].id);
            sendRabbitmq(JSON.stringify(msn[i]));
        });    
        },5000);
    });
}


 amqp.connect('amqp://localhost',function(err,conn){
     conn.createChannel(function(err,ch){
        var q= 'Evolved';//channel's name 
        ch.assertQueue(q,{durable:false});

        ch.consume('Evolved', function(msg) {
            var evolvedPop=JSON.parse(msg.content);
            console.log('<=:receiving :',evolvedPop.id);
        socket.emit('evolved',evolvedPop);
        }, {noAck: true});
     });
 });