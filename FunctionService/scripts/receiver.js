
const genetic= require('./GA.js');
const pso= require('./pso.js');
var amqp = require('amqplib/callback_api');
const async = require('async');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'ga';
    var q2 = 'pso';
    ch.assertQueue(q, {durable: false});
    ch.assertQueue(q2, {durable: false});
      
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q2);
      
      ch.consume(q, function(msg) {
//        console.log(" [x] Received %s", JSON.parse(msg.content));
        genetic(JSON.parse(msg.content));    
      }, {noAck: true});

      ch.consume(q2, function(msg) {
        //        console.log(" [x] Received %s", JSON.parse(msg.content));
                pso(JSON.parse(msg.content));    
              }, {noAck: true});
      
  });
});