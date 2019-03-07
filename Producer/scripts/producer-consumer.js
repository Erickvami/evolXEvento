module.exports={
    generateRandomPopulation: (definition)=>{
       var random={
        int:()=>Math.round(Math.random()* definition.rangeValue[1]),
        float:()=>Math.random()* definition.rangeValue[1],
        decimals:()=>Math.random()
    } 
    return (new Array(definition.length).fill()).map(()=>(new Array(definition.size).fill(0)).map(()=>random[definition.type]()));
    }
}