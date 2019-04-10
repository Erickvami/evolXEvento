var amqp= require('amqplib/callback_api');
const writeJsonFile = require('write-json-file');

module.exports={
globalPop:[],//population of populations
resendLimit:0,//limit times of resending to evolve (generations)
resends:0,//send counter
finished:true,//is finish flag
isLivePlot:true,// determines if there will be send every change to UI or just the last result
Save: async ()=>await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), module.exports.globalPop),
SaveMessage: async (msn)=> {//saves the experiment data
    await writeJsonFile('Experiments/Experiment_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), msn);
    await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), module.exports.globalPop);
},
sendRabbitmq:(message)=>{//sends one individual population to evolve
    return new Promise(async ()=>{
         amqp.connect('amqp://localhost',function(err,conn){
    conn.createChannel(function(err,ch){
    var q= 'GA';//channel's name 
    ch.assertQueue(q,{durable:false});
    ch.sendToQueue(q,new Buffer.from(message));
    });
         });
    });
    },
getBest:(individuals,take)=>{
return individuals
.map(item=> [item.id,({// all fitness function definitions
    sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
    rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return (10*entity.length)+total;}
    })[item.fitness](item.population[0])])
.sort((a,b)=> a[1]-b[1])[individuals[0].optimizer==='Minimize'? 0+take:individuals.length-1-take];
},
crossPop:(evolvedPop)=>{//cross the individuals and sends them to evolve
    return new Promise(async ()=>{
        setTimeout(async ()=>{
            let selectedPop=[evolvedPop,module.exports.globalPop.filter(fil=> fil.id===module.exports.getBest(module.exports.globalPop.filter(f=> f.fitness===evolvedPop.fitness),Math.random()>5?1:0)[0])[0]];
            let crossedPop=({//crossover functions
                uniform: (ParentOne,ParentTwo)=> {//creates a random mask to cross the 2 individuals
                    var parents=[ParentOne,ParentTwo];
                    var mask= ParentOne.map(item=> Math.round(Math.random()));
                    return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
                },
                onePoint:(ParentOne,ParentTwo)=>{//splits the parents in one point and cross them
                    return [ParentOne.map((item,i)=> i<=Math.round(ParentOne.length/2)-1?item:ParentTwo[i]),ParentTwo.map((item,i)=> i<=Math.round(ParentTwo.length/2)-1?item:ParentOne[i])];
                },
                ring:(ParentOne,ParentTwo)=>{// concats the 2 parenst into one and cuts in one random point
                  let randomIndex= Math.round(Math.random()*(ParentOne.concat(ParentTwo).length-1));
                  return [ParentOne.concat(ParentTwo,ParentOne).slice(randomIndex,randomIndex+ParentTwo.length),ParentOne.concat(ParentTwo,ParentOne,ParentTwo).slice(randomIndex+ParentTwo.length,randomIndex+(ParentTwo.length*2))]
              }
              }).uniform(selectedPop[0].population,selectedPop[1].population);
            crossedPop.forEach((pop,i)=>{
                selectedPop[i].population=pop;
                console.log('resending=>:'+selectedPop[i].id);
                module.exports.sendRabbitmq(JSON.stringify(selectedPop[i]));
            },module.exports);    
        },5000);
    },module.exports);
    }
};