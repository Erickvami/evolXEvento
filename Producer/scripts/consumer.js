var express = require('express')
var bodyParser = require('body-parser')
var amqp = require('amqplib/callback_api');
 
var app = express()
 
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.listen(3002,()=>console.log("Inicializado en puerto 3002"));
let counter=0;
app.post('/evolved',jsonParser,(req,res)=>{
    counter++;
    console.log(req.body._id);
    console.log(counter);
    amqp.connect('amqp://localhost',function(err,conn){
                        conn.createChannel(function(err,ch){
                           var q= 'Evolved';//channel's name 
                            ch.assertQueue(q,{durable:false});
                            ch.sendToQueue(q,new Buffer.from(JSON.stringify(req.body)));
                        });
                     });
res.send(JSON.stringify({status:'ok'}));
});