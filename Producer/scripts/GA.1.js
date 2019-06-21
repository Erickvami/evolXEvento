// var amqp= require('amqplib/callback_api');
const writeJsonFile = require('write-json-file');
const fetch = require('node-fetch');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/evol";
module.exports={
experimentId:undefined,
nMessages:0,
evaluations:0,
best:null,
// globalPop:[],//population of populations
resendLimit:0,//limit times of resending to evolve (generations)
resends:0,//send counter
finished:false,//is finish flag
done:false,
isLivePlot:true,// determines if there will be send every change to UI or just the last result
Save: async ()=>{
    MongoClient.connect(url, { useNewUrlParser: true }).then(db=> {
        var dbo = db.db("evol");
        
        dbo.collection("current").find({},{"sort": [['best','asc']]})
        .toArray().then(out=> {
            dbo.collection("best").find({expId:module.exports.experimentId},{"sort": [['best','asc']]})
            .toArray().then(out2=> {
                let log={
                    population:{
                        sphere: out.filter(item=> item.fitness==='sphere').sort((a,b)=> a.best-b.best),
                        rastrigin:out.filter(item=> item.fitness==='rastringin').sort((a,b)=> a.best-b.best),
                        rosenbrock:out.filter(item=> item.fitness==='rosenbrock').sort((a,b)=> a.best-b.best)
                    },
                    bestsByIteration:{
                        sphere:out2.filter(item=> item.fitness=='sphere').sort((a,b)=> a.iteration-b.iteration),
                        rastrigin:out2.filter(item=> item.fitness=='rastringin').sort((a,b)=> a.iteration-b.iteration),
                        rosenbrock:out2.filter(item=> item.fitness=='rosenbrock').sort((a,b)=> a.iteration-b.iteration)
                    }
                };
                writeJsonFile('Experiments/Experiment_'.concat(module.exports.experimentId,'.json'), log);
                // module.exports.clearPopulation();
            });
        });
    });

    
},
SaveMessage: async (msn)=> {//saves the experiment data
    await writeJsonFile('Experiments/Experiment_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), msn);
    await writeJsonFile('Experiments/GlobalPop_'.concat(new Date().toDateString(),',',new Date().getHours(),'',new Date().getMinutes(),'.json'), module.exports.globalPop);
},
insertIndividual:async individual=>{
    MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
        if (err) throw err;
        var dbo = db.db("evol");
            //   var myobj = { name: "val"+i, value: i };
              dbo.collection("current").insertOne(individual, function(err, res) {
                if (err) throw err;
                console.log(individual._id," inserted");
                db.close();    
              });
      }); 
},
clearPopulation:()=>{
MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db("evol");
    dbo.collection("current").deleteMany({});
    db.close();
  }); 
},
replaceIndividual:individual=>{
MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db("evol");
    dbo.collection("current").findOneAndUpdate({_id:individual._id},{$set:{population:individual.population,best:individual.best}});
    db.close();
  });
},
send:(message,channel)=>{//sends one individual population to evolve
        if(module.exports.resends<=module.exports.resendLimit || !module.exports.finished){
                        
            return new Promise(async ()=>{
                fetch("http://localhost:8080/function/"+channel+"-fn",{
                                method:"POST",
                                body:message
                            });
            });
        }
    return false;
    },
setBest:async (best,resends)=>{
MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db("evol");
          dbo.collection("best").insertOne({expId:module.exports.experimentId,iteration:resends,best:best.best,bestId:best._id,alg:best.algorithm,fitness:best.fitness}, function(err, res) {
            if (err) throw err;
            db.close();    
          });
  }); 
},
crossPop:(evolvedPop)=>{//cross the individuals and sends them to evolve
    return new Promise(async ()=>{
        setTimeout(async ()=>{
            MongoClient.connect(url, { useNewUrlParser: true }).then(db=> {
                var dbo = db.db("evol");
            dbo.collection("current").find({fitness:evolvedPop.fitness},{"sort": [['best',evolvedPop.optimizer==='Minimize'?'asc':'desc']]})//,limit:2})
                .toArray().then(out=> {
                    // let randomPosition= Math.floor(Math.random() * (+(2) - +0)) + +0;
                    let now= {best: out[0],worst:out[out.length-1]};
                    console.log(module.exports.resends);
                    console.log(now.best.best);
                    module.exports.resends=module.exports.resends+1;
                    if(now.best.best<=7.0e-8){
                        module.exports.finished=true;
                    }
                    module.exports.setBest(now.best,module.exports.resends);
                    let selectedPop=[evolvedPop,now.best];//Math.floor(Math.random() * (+(2) - +0)) + +0]];//module.exports.globalPop.filter(fil=> fil._id===module.exports.getBest(module.exports.globalPop.filter(f=> f.fitness===evolvedPop.fitness),Math.random()>5?1:0)[0])[0]];
                    let crossedPop=({//crossover functions
                        uniform: (ParentOne,ParentTwo)=> {//creates a random mask to cross the 2 individuals
                            var parents=[ParentOne,ParentTwo];
                            var mask= ParentOne.map(item=> Math.round(Math.random()));
                            return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
                        },
                        splitingPointUniform: (ParentOne,ParentTwo)=> {//creates a random mask to cross the 2 individuals
                            var parents=[ParentOne,ParentTwo];
                            var mask= ParentOne.map(item=> Math.round(Math.random()));
                            return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i].map((subitem,subi)=> (subitem +parents[item][i][subi])/2))];
                        },
                        onePoint:(ParentOne,ParentTwo)=>{//splits the parents in one point and cross them
                            return [ParentOne.map((item,i)=> i<=Math.round(ParentOne.length/2)-1?item:ParentTwo[i]),ParentTwo.map((item,i)=> i<=Math.round(ParentTwo.length/2)-1?item:ParentOne[i])];
                        },
                        ring:(ParentOne,ParentTwo)=>{// concats the 2 parenst into one and cuts in one random point
                          let randomIndex= Math.round(Math.random()*(ParentOne.concat(ParentTwo).length-1));
                          return [ParentOne.concat(ParentTwo,ParentOne).slice(randomIndex,randomIndex+ParentTwo.length),ParentOne.concat(ParentTwo,ParentOne,ParentTwo).slice(randomIndex+ParentTwo.length,randomIndex+(ParentTwo.length*2))]
                      }
                      }).splitingPointUniform(selectedPop[0].population,selectedPop[1].population);
                      
                    let evaluations=crossedPop.map((pop,i)=>{
                        selectedPop[i].population=pop;
                        console.log('resending=>:'+selectedPop[i]._id);
                        module.exports.send(JSON.stringify(selectedPop[i]),selectedPop[i].algorithm);
                    },module.exports);  
                }).then(()=> db.close());
            });
              
        },3000);
    },module.exports);
    }
};
