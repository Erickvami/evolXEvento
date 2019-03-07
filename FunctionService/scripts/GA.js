const Genetic= require('./genetic.js');
var amqp = require('amqplib/callback_api');
module.exports={
    //Async execution of Genetic Algorithm using promises
    run: async (opt)=>{
        return new Promise((resolve,reject)=>{
//            console.log(JSON.parse(opt));
        let genetic=Genetic.create();//creates new GA object
        const fitness={// all fitness function definitions
        sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
        rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return total;}
        }
        const crossovers={
          uniform: (ParentOne,ParentTwo)=> {
              var parents=[ParentOne,ParentTwo];
              var mask= ParentOne.map(item=> Math.round(Math.random()));
              return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
          }
        };
        
        genetic.entities= opt.population; //Asigns population
        //this.genetic.usingWebWorker=true; //Activates a better perfomance using webworkers
        genetic.select1= Genetic.Select1[opt.mutation];//Sets the mutation method by its name
        genetic.select2= Genetic.Select2[opt.crossover];//Sets crossover method by its name
        genetic.configuration.crossover=opt.crossoverPer;
        genetic.configuration.mutation=opt.mutationPer;
        genetic.crossover=crossovers[opt.crossoverFunc];
        genetic.optimize= Genetic.Optimize[opt.optimizer];//Defines what is the purpose of optimizing, maximize or minimize
        genetic.configuration.iterations=opt.iterations; //Sets the number of generations
        genetic.configuration.size=opt.size; //Sets the population size
        genetic.fitness= fitness[opt.fitness];//Asigns the fitness function, the parameter is the number of function
        console.log('+=========================================================+');
        console.log('Evolved population'.concat(opt.id,' on ',opt.iterations,' iterations:'));
        genetic.start(opt.id);//Run the GA
        console.log(genetic);
            opt.population=genetic.entities;
        amqp.connect('amqp://localhost',function(err,conn){
                        conn.createChannel(function(err,ch){
                           var q= 'Evolved';//channel's name 
                            ch.assertQueue(q,{durable:false});
                            ch.sendToQueue(q,new Buffer.from(JSON.stringify(opt)));
                        });
                     });
        });
    }
};






