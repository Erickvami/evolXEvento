const Scaledrone= require('scaledrone-node');
const sd= new Scaledrone('X7d4NnH7icqQbabP');
var number=1;
sd.on('open',error=> {
    const room= sd.subscribe('notifications');
    room.on('data',message=> {
        console.log(message);
        console.log(number);
        number=number+1;
    });
});