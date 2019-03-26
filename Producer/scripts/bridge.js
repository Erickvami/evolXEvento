const server= require('http').createServer();
const socket= require('socket.io')(server);
let amqp= require('amqplib/callback_api');
let ga= require('./GA.js');
const writeJsonFile = require('write-json-file');

//Receive messages from socket.io
socket.on('connection',client=>{
    client.on('message',async (msn)=>{
        ga.finished=false;
        console.log('sending:=>',msn.id);
        ga.globalPop.push(msn);
        setTimeout(async ()=>{
        ga.sendRabbitmq(JSON.stringify(msn));
        },2000);
    });
    client.on('clear',async (params)=>{
        console.log('clear');
        ga.resends=0;
        ga.resendLimit=params.resendLimit;
        ga.isLivePlot=params.isLivePlot;
        console.log(params);
        ga.globalPop=[];
    });
    client.on('crossPop',async (msn)=>{
        ga.crossPop(msn);
    });
    client.on('Save',async (msn)=>{
        ga.SaveMessage(msn)
    });
    // client.on('disconnect',()=>{
    //    // socket.open();
    // });
});
//Just in case for errors
socket.on('error',err=>console.log('received socket error:',err));
//Socket.io port assignment
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
            ga.globalPop= ga.globalPop.filter(f=> f.id!==evolvedPop.id);
            ga.globalPop.push(evolvedPop);
            ga.resends++;
            if(ga.resends>ga.resendLimit){
                if(!ga.finished){
                    socket.emit('finished',true);
                    if(!ga.isLivePlot){
                        ga.globalPop.forEach(item=>{
                            socket.emit('evolved',item);
                        });
                    }
                    ch.purgeQueue(q);
                    ch.purgeQueue('GA');
                    ga.Save();
                }
                ga.finished=true;
            }else if(ga.resends<ga.resendLimit && ga.resends!==0 && !ga.finished){
                console.log(ga.resends,ga.resendLimit);
            ga.crossPop(evolvedPop);    
            }
            if(ga.isLivePlot){
                socket.emit('evolved',evolvedPop);
            }
            console.log('<=:receiving :',evolvedPop.id);
            
        }, {noAck: true});
     });
 });