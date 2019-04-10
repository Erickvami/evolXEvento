// let pso= require('./pso.js');

// // create the optimizer
// var optimizer = new pso.Optimizer();

// // set the objective function
// optimizer.setObjectiveFunction(function (x) { return -(x[0] * x[0] + x[1] * x[1]); });

// // set an initial population of 20 particles spread across the search space *[-10, 10] x [-10, 10]*
// optimizer.init(20, [{ start: -5.12, end: 5.12 }, { start: -5.12, end: 5.12 }]);

// // run the optimizer 40 iterations
// for (var i = 0; i < 40; i++) {
//     optimizer.step();
// }

// // print the best found fitness value and position in the search space
// console.log(optimizer.getBestFitness(), optimizer.getBestPosition());
var createOptimizer = require('./pso2.js').default;

var optimizer = createOptimizer({
    maxVelocity:[1,2,0.4,0.006],
    minVelocity: [-1,-2,-0.4,-0.006],
    maxPosition: [1,2,0.4,0.006],
    minPosition: [-1,-2,-0.4,-0.006],
    all:[1,2,3,4,5,6,7],
    populationSize: 30,
    numberOfDimensions: 4,
    maxIterations: 100,
    desiredFitness: 0,
    desiredPrecision: 1E-5,
    fitnessFunction: (entity)=>{let total=0; entity.forEach(item=>{total+=Math.pow(item,2)});return total;},
});

var solution = optimizer.start();
console.log(solution);