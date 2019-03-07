var amqp = require('amqplib/callback_api');
const genetic= require('./GA.js');
const async = require('async');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'GA';

    ch.assertQueue(q, {durable: false});
      
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
      
      ch.consume(q, function(msg) {
//        console.log(" [x] Received %s", JSON.parse(msg.content));
        genetic.run(JSON.parse(msg.content));    
      }, {noAck: true});
      
  });
});