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
    setTimeout(() => {
        amqp.connect('amqp://localhost',function(err,conn){

                        conn.createChannel(function(err,ch){
                            console.log(err);
                        //    var q= 'Evolved';//channel's name 
                            let q='Evolved'+(Math.random()>0.5?1:0);
                            ch.assertQueue(q,{durable:false});
                            ch.sendToQueue(q,new Buffer.from(JSON.stringify(req.body)));
                        });

                     });
    }, 1000);

res.send(JSON.stringify({status:'ok'}));
});