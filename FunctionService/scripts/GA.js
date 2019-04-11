module.exports=(opt)=>{
        return new Promise(()=>{
        const Genetic= require('./genetic.js');
        var amqp = require('amqplib/callback_api');
        let genetic=Genetic.create();//creates new GA object
        genetic.entities= opt.population; //Asigns population
        genetic.select1= Genetic.Select1[opt.mutation];//Sets the mutation method by its name
        genetic.select2= Genetic.Select2[opt.crossover];//Sets crossover method by its name
        genetic.configuration.crossover=opt.crossoverPer;
        genetic.configuration.mutation=opt.mutationPer;
        genetic.crossover= ({
            uniform: (ParentOne,ParentTwo)=> {
                var parents=[ParentOne,ParentTwo];
                var mask= ParentOne.map(()=> Math.round(Math.random()));
                return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> parents[item==1?0:1][i])];
            },
            splittingPointUniform: (ParentOne,ParentTwo)=> {
                var parents=[ParentOne,ParentTwo];
                var mask= ParentOne.map(()=> Math.round(Math.random()));
                return [mask.map((item,i)=> parents[item][i]),mask.map((item,i)=> item==1?parents.reduce((sum,num)=>sum[i]+num[i])/2:parents[item==1?0:1][i])];
            },
            onePoint:(ParentOne,ParentTwo)=>{
                return [ParentOne.map((item,i)=> i<=Math.round(ParentOne.length/2)-1?item:ParentTwo[i]),ParentTwo.map((item,i)=> i<=Math.round(ParentTwo.length/2)-1?item:ParentOne[i])];
            },
            ring:(ParentOne,ParentTwo)=>{
              let randomIndex= Math.round(Math.random()*(ParentOne.concat(ParentTwo).length-1));
              return [ParentOne.concat(ParentTwo,ParentOne).slice(randomIndex,randomIndex+ParentTwo.length),ParentOne.concat(ParentTwo,ParentOne,ParentTwo).slice(randomIndex+ParentTwo.length,randomIndex+(ParentTwo.length*2))]
          }
          })[opt.crossoverFunc];
        genetic.mutate=({
            gaussian:(entity)=>{
                let x1=Math.random();
                let x2=Math.random();
                if(x1==0)
                    x1=1;
                if(x2==0)
                    x2=1;
                let y1 = Math.sqrt(-2.0 * Math.log(x1)) * Math.cos(2.0 * Math.PI * (x2+0.001));
                let stddev=Math.random()*Math.random();
            return entity.map(item=> y1 * stddev + item);
            }
        })[opt.mutationFunc];
        genetic.fitness= ({
            sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
            rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return (10*entity.length)+total;}
            })[opt.fitness];//Asigns the fitness function, the parameter is the number of function
        genetic.optimize= Genetic.Optimize[opt.optimizer];//Defines what is the purpose of optimizing, maximize or minimize
        genetic.configuration.iterations=opt.iterations; //Sets the number of generations
        genetic.configuration.size=opt.size; //Sets the population size
        genetic.configuration.webWorkers=true;//Activates a better perfomance using webworkers
        genetic.notification=(pop,gen,stats,isFinished)=> {if(isFinished) console.log({pop:pop,gen:gen,starts:stats});opt.best=stats.maximum;};
        console.log('+=========================================================+');
        console.log('Population : '.concat(opt.id));
        genetic.start(opt.id);//Run the GA
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