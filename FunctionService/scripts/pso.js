module.exports=(opt)=>{
    return new Promise(()=>{
        var createOptimizer = require('./particle-swarm.js').default;
        var amqp = require('amqplib/callback_api');
        // const fitness='rastringin';
        // const ndimensions=4;
        // const populationSize=100;
        // let population=new Array(opt.size).fill().map(()=> new Array(ndimensions).fill().map(()=> Math.random()+0.001));
        
        var optimizer = createOptimizer({
            maxVelocity: new Array(opt.population[0].length).fill(({rastringin:[-5.12,5.12],
                 sphere:[-5.12,5.12]})[opt.fitness][1]),
            minVelocity: new Array(opt.population[0].length).fill(({rastringin:[-5.12,5.12],
                 sphere:[-5.12,5.12]})[opt.fitness][0]),
            maxPosition: new Array(opt.population[0].length).fill(({rastringin:[-5.12,5.12],
                 sphere:[-5.12,5.12]})[opt.fitness][1]),
            minPosition: new Array(opt.population[0].length).fill(({rastringin:[-5.12,5.12],
                 sphere:[-5.12,5.12]})[opt.fitness][0]),
            population: opt.population,
            populationSize: opt.size,
            numberOfDimensions: opt.population[0].length,
            maxIterations: opt.iterations,
            desiredFitness: opt.optimizer==='Minimize'?0:1000000,
            desiredPrecision: 1E-8,
            fitnessFunction: ({
                sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
                rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return (10*entity.length)+total;}
                })[opt.fitness],
            socialFactor:(iteration)=> opt.socialFactor,
            individualFactor:(iteration)=> opt.individualFactor,
            inertiaFactor:(iteration)=> opt.inertiaFactor,
            // callbackFn:(meta)=> console.log({bestPosition:meta.globalBestPosition,bestFitness:meta.globalBestFitness,i:meta.iteration}),
        });
        console.log('+=========================================================+');
        console.log('Population : '.concat(opt.id));
        var solution = optimizer.start();
        opt.population=solution.pop;
        opt.best=solution.globalBestFitness;
        console.log(solution);
        amqp.connect('amqp://localhost',function(err,conn){
                        conn.createChannel(function(err,ch){
                           var q= 'Evolved';//channel's name 
                            ch.assertQueue(q,{durable:false});
                            ch.sendToQueue(q,new Buffer.from(JSON.stringify(opt)));
                        });
                     });
    });
}

// var createOptimizer = require('./particle-swarm.js').default;

// const ranges={rastringin:[-5.12,5.12],
//          sphere:[-5.12,5.12],
//          ellipsoid:[-65.536,65.536]};
// const fitness='rastringin';
// const ndimensions=4;
// const populationSize=100;
// let population=new Array(populationSize).fill().map(()=> new Array(ndimensions).fill().map(()=> Math.random()+0.001));

// var optimizer = createOptimizer({
//     maxVelocity: new Array(ndimensions).fill(ranges[fitness][1]),
//     minVelocity: new Array(ndimensions).fill(ranges[fitness][0]),
//     maxPosition: new Array(ndimensions).fill(ranges[fitness][1]),
//     minPosition: new Array(ndimensions).fill(ranges[fitness][0]),
//     population: population,
//     populationSize: populationSize,
//     numberOfDimensions: ndimensions,
//     maxIterations: 500,
//     desiredFitness: 0,
//     desiredPrecision: 1E-8,
//     fitnessFunction: ({
//         sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
//         rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return (10*entity.length)+total;}
//         })[fitness],
//     socialFactor:(iteration)=> 2.05,
//     individualFactor:(iteration)=> 2.05,
//     inertiaFactor:(iteration)=> 1,
//     // callbackFn:(meta)=> console.log({bestPosition:meta.globalBestPosition,bestFitness:meta.globalBestFitness,i:meta.iteration}),
// });

// var solution = optimizer.start();
// console.log(solution);