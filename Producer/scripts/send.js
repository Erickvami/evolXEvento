var amqp= require('amqplib/callback_api');
const pc= require('./producer-consumer.js');


async function Send(messages){
    return new Promise(async function(resolve){
           amqp.connect('amqp://localhost',function(err,conn){
conn.createChannel(function(err,ch){
   var q= 'GA';//channel's name 
    ch.assertQueue(q,{durable:false});
    
    for(var i=1;i<=messages;i++){
        var population=pc.generateRandomPopulation({
        size:Math.round(Math.random()*9)+1,
        type:'int',//int,float,string,array,object
        rangeValue:[0,10],
        length:Math.round(Math.random()*9)+1
    });
        
        ch.sendToQueue(q,new Buffer.from(JSON.stringify({
    population:population,
    mutation:'RandomLinearRank',
    crossover:'RandomLinearRank',
    optimizer:'Minimize',
    iterations:Math.round(Math.random()*100000),
    size:population.length,
    fitness:'sphere',
    id:i,
    crossoverPer:0.6,
    mutationPer:0.2,
    crossoverFunc:'uniform'
})));    
    }
    
    console.log("[x] Sent 'population!'");
    ch.assertQueue('Evolved', {durable: false});
    
          ch.consume('Evolved', function(msg) {
        //console.log(" [x] Received %s", msg.content);
        console.log(JSON.parse(msg.content));
              
      }, {noAck: true});
   
});    
});
//     conn.createChannel(function(err,ch){
//         ch.assertQueue('Evolved', {durable: false});
//          ch.consume('Evolved', function(msg) {
//        //console.log(" [x] Received %s", msg.content);
//        console.log(JSON.parse(msg.content));    
//      }, {noAck: true});
//     });   
//        
        
        
    }); 
}

//async function receive(){
//   return new Promise(async(resolve)=>{
//                       amqp.connect('amqp://localhost',function(err,conn){
//             conn.createChannel(function(err,ch){
//         ch.assertQueue('Evolved', {durable: false});
//                 var indefines=0;
//          ch.consume('Evolved', function(msg) {
//        //console.log(" [x] Received %s", msg.content);
//              if(msg.content===undefined)
//              indefines++;
//              
//        console.log(JSON.parse(msg.content).length);    
//        console.log(indefines);
//      }, {noAck: true});
//     }); 
//    });
//                       });
//}

console.log(Send(10));
//console.log(receive());


