var amqp= require('amqplib/callback_api');
const writeJsonFile = require('write-json-file');

module.exports={
globalPop:[],
resendLimit:0,
resends:0,
finished:true,
isLivePlot:true,
cross:{
    singlePoint:(ParentOne,ParentTwo)=> {
        
    },
    uniform: (ParentOne,ParentTwo)=> {
                var parents=[ParentOne,ParentTwo];
                var mask= ParentOne.map(item=> Math.round(Math.random()));
                return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
            }
  },
Save: async ()=>await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), module.exports.globalPop),
SaveMessage: async (msn)=> {
    await writeJsonFile('Experiments/Experiment_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), msn);
    await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), module.exports.globalPop);
},
sendRabbitmq:(message)=>{
    return new Promise(async (resolve)=>{
         amqp.connect('amqp://localhost',function(err,conn){
    conn.createChannel(function(err,ch){
    var q= 'GA';//channel's name 
    ch.assertQueue(q,{durable:false});
    ch.sendToQueue(q,new Buffer.from(message));
    });
         });
    });
    },
crossPop:(evolvedPop)=>{
    return new Promise(async (resolve)=>{
        setTimeout(async ()=>{
            let selectedPop=[evolvedPop,module.exports.globalPop.filter(f=> f.fitness===evolvedPop.fitness)[Math.round(Math.random()*(module.exports.globalPop.filter(f=> f.fitness===evolvedPop.fitness).length-1))]];
        let crossedPop=module.exports.cross.uniform(selectedPop[0].population,selectedPop[1].population);
        crossedPop.forEach((pop,i)=>{
            selectedPop[i].population=pop;
            console.log('resending=>:'+selectedPop[i].id);
            module.exports.sendRabbitmq(JSON.stringify(selectedPop[i]));
        },module.exports);    
        },5000);
    },module.exports);
    }
};