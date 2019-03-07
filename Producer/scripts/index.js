const Scaledrone= require('scaledrone-node-push');
const sd= new Scaledrone({
    channelId:'X7d4NnH7icqQbabP',
    secretKey:'S2ePjFHg3MRTQEiytnLWDkVlStGDvxZf'
});


const popSize=10;
const nMessages=10;

for (var i=0;i<=popSize;i++){
    var population=[];
for (var j=0;j<=popSize;j++){
    population.push([
        Math.round(Math.random()*10),
        Math.round(Math.random()*10),
        Math.round(Math.random()*10),
        Math.round(Math.random()*10),
        Math.round(Math.random()*10)
    ]);
}
   var message= JSON.stringify({
        population:population,
    id:new Date().getTime(),
    iter:Math.round(Math.random()*10),
    eval:Math.round(Math.random()*10),
    mutation:false
    });
    console.log(message.length);
//    Send(message);
}


async function Send(message){
 sd.publish('notifications',message);   
}