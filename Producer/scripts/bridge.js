const server= require('http').createServer();
const socket= require('socket.io')(server);
var amqp= require('amqplib/callback_api');

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
        sendRabbitmq(JSON.stringify(msn));
        //console.log(msn.id);
    });
    client.on('crossPop',async (msn)=>{
//        sendRabbitmq(JSON.stringify(msn));
        //console.log(msn.id);
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

async function crossPop(populations){
    return Promise(async (resolve)=>{
        
    });
}


 amqp.connect('amqp://localhost',function(err,conn){
     conn.createChannel(function(err,ch){
        var q= 'Evolved';//channel's name 
        ch.assertQueue(q,{durable:false});

        ch.consume('Evolved', function(msg) {
            var evolvedPop=JSON.parse(msg.content);
        socket.emit('evolved',evolvedPop);
            //here will comes a DB connection to creates a line of populations by experiment allowing us to cross them and keep a record of all experiments
            //sendRabbitmq(msg.content);
        }, {noAck: true});
     });
 });