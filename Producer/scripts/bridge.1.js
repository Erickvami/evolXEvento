// const server= require('http').createServer();
// const socket= require('socket.io')(server);
let amqp= require('amqplib/callback_api');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http,{handlePreflightRequest: (req,res)=>{
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
        "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
}});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


let ga= require('./GA.1.js');
var os = require( 'os' );
var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/evol";
var networkInterfaces = os.networkInterfaces();
console.log(networkInterfaces.en0[1].address);
//Receive messages from socket.io
socket.on('connection',client=>{
    client.on('message',async (msn)=>{
        // ga.finished=false;
        console.log('sending:=>',msn._id);
        // ga.globalPop.push(msn);
        ga.insertIndividual(msn).then(()=>{
            msn.ip=networkInterfaces.en0[1].address;
        setTimeout(async ()=>{
        ga.send(JSON.stringify(msn),msn.algorithm,msn.fitness);
        
        },1000);
        });
        
    });
    client.on('clear',async (params)=>{
        console.log('clear');
        let resends={};
        params.functions.forEach(fn=> {
            resends[fn.name]=0
            });
        let areFinish= functions.map(fn=> {return {fitness:fn,isFinish:false}});
        ga.resends=resends;
        ga.resendLimit=params.resendLimit;
        ga.isLivePlot=params.isLivePlot;
        ga.experimentId= new Date().getTime();
        ga.finished=areFinish;
        ga.done=false;
        console.log(params);
        // ga.globalPop=[];
        ga.clearPopulation();
    });
    client.on('downloadLog',async (msn)=>{
        socket.emit('getLog',require('./Experiments/Experiment_'+msn+'.json'))
    });
    // client.on('disconnect',()=>{
    //    // socket.open();
    // });
});
//Just in case for errors
socket.on('error',err=>console.log('received socket error:',err));
//Socket.io port assignment
// server.listen(3001,err=>{
//    if(err) throw err
//    console.log('listening on port 3001');
// });

var server = http.listen(3001, () => {
    console.log('server is running on port', server.address().port);
  });

//Receive messages from Rabbitmq
//  amqp.connect('amqp://localhost',function(err,conn){
//      conn.createChannel(function(err,ch){
//         // var q= 'Evolved';//channel's name 
//         ch.assertQueue('Evolved0',{durable:false});
//         ch.assertQueue('Evolved1',{durable:false});
//         ch.consume('Evolved0', function(msg) {            
//             manage(msg);
//         }, {noAck: true});

//         ch.consume('Evolved1', function(msg) {            
//             manage(msg);
//         }, {noAck: true});
//      });
//  });
app.post('/evolved', async(req, res) => {
    // var message = new Message(req.body);
    // console.log(req.body);
    manage(req.body);
    res.sendStatus(200);
  });

 async function manage(evolvedPop){
    //  ga.evaluations=ga.evaluations+evolvedPop;
    // var evolvedPop=JSON.parse(msg.content);
    // ga.globalPop= ga.globalPop.filter(f=> f._id!==evolvedPop._id);
    // ga.globalPop.push(evolvedPop);
    ga.replaceIndividual(evolvedPop);
    console.log('is finished:'+ga.finished)
    if(ga.resends[evolvedPop.fitness]>=ga.resendLimit || ga.finished.every(fn=> fn.isFinish)){
        if(!ga.done){
            ga.done=true;
            socket.emit('finished',{message:'finished',experimentId:ga.experimentId});
            if(!ga.isLivePlot){
                // ga.globalPop.forEach(item=>{
                //     socket.emit('evolved',item);
                // });
                MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("evol");
                    dbo.collection("current").find({}).toArray(function(err, result) {
                    if (err) throw err;
                    // console.log(result);
                    result.forEach(item=> socket.emit('evolved',item));
                    db.close();
                    });
                }); 
            }
            // ch.purgeQueue(q);
            // ch.purgeQueue('GA');
             ga.Save();
        }
        // ga.finished=true;
    }else {
        console.log(ga.resends[evolvedPop.fitness],ga.resendLimit);
    ga.crossPop(evolvedPop);    
    }
    if(ga.isLivePlot){
        // console.log(ga.globalPop);
        socket.emit('evolved',evolvedPop);
    }
    console.log('<=:receiving :',evolvedPop._id);
    console.log(ga.finished.filter(f=> f.fitness===evolvedPop.fitness)[0].isFinish);
 }