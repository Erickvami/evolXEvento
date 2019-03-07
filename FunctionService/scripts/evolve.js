const genetic= require('./GA.js');
const async = require('async');


async function RunGenetic(id,it){
   return new Promise(async function(resolve){
       var population=genetic.generateRandomPopulation({
        size:10,
        type:'int',//int,float,string,array,object
        rangeValue:[0,10],
        length:20
    });
   console.log('Initial population:');
   console.log(population);
      genetic.run({
    population:population,
    mutation:'randomrank',
    crossover:'randomrank',
    optimizer:'max',
    iterations:it,
    size:population.length,
    fitness:1,
    id:id
});       
    console.log('genetic '.concat(id,' finished')); 
    console.log('\n');
   });
}
RunGenetic(1,100000);
RunGenetic(2,10);
