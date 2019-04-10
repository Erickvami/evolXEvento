var createOptimizer = require('./particle-swarm.js').default;

const ranges={rastringin:[-5.12,5.12],
         sphere:[-5.12,5.12],
         ellipsoid:[-65.536,65.536]};
const fitness='rastringin';
const ndimensions=4;
const populationSize=100;
let population=new Array(populationSize).fill().map(()=> new Array(ndimensions).fill().map(()=> Math.random()+0.001));

var optimizer = createOptimizer({
    maxVelocity: new Array(ndimensions).fill(ranges[fitness][1]),
    minVelocity: new Array(ndimensions).fill(ranges[fitness][0]),
    maxPosition: new Array(ndimensions).fill(ranges[fitness][1]),
    minPosition: new Array(ndimensions).fill(ranges[fitness][0]),
    population: population,
    populationSize: populationSize,
    numberOfDimensions: ndimensions,
    maxIterations: 500,
    desiredFitness: 0,
    desiredPrecision: 1E-8,
    fitnessFunction: ({
        sphere:(entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},//[Σn^2]}
        rastringin:(entity)=>{let total=0; entity.forEach(item=>{total+=(Math.pow(item,2)-10*Math.cos(2*Math.PI*item))});return (10*entity.length)+total;}
        })[fitness],
    socialFactor:(iteration)=> 2.05,
    individualFactor:(iteration)=> 2.05,
    inertiaFactor:(iteration)=> 1,
    // callbackFn:(meta)=> console.log({bestPosition:meta.globalBestPosition,bestFitness:meta.globalBestFitness,i:meta.iteration}),
});

var solution = optimizer.start();
console.log(solution);