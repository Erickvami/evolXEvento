import React, { Component } from 'react';
import {
Card,
Button,
ButtonGroup
} from 'react-bootstrap';
import Slider from 'react-rangeslider';
import {algorithm} from './algorithm.js';
import socketIOClient from "socket.io-client";
import Plot from 'react-plotly.js';
import {fn} from './constants.js';


class Chart extends Component{
constructor(props){
super(props);
this.state={
iterations:this.props.iterations,
population:this.props.population,
mutation:this.props.mutation,
mutationPer:this.props.mutationPer,
crossover:this.props.crossover,
crossoverPer:this.props.crossoverPer,
crossoverType:this.props.crossoverType,
optimizer:this.props.optimizer,
size:this.props.size,
socialFactor:this.props.socialFactor,
individualFactor:this.props.individualFactor,
inertiaFactor:this.props.inertiaFactor,
_id:1,
random:this.props.random,
nMessages:10,
json:[],
fitness:[{name:'sphere',checked:false},{name:'rastringin',checked:false},{name:'rosenbrock',checked:true}],
plotValues:[],
stop:true,
resendLimit:5,
isRunning:false,
eye:[{x:1,y:1,z:-1},{x:1,y:1,z:-1}],
is3d:true,
isLivePlot:true,
isGA:false,
isPSO:true
};
this.Run= this.Run.bind(this);
this.Stop= this.Stop.bind(this);
this.Clear= this.Clear.bind(this);
this.Save= this.Save.bind(this);
}
componentDidMount(){
const socket= socketIOClient('192.168.1.212:3001');
var nm=0;
socket.on('evolved',async (msn)=> {
this.setState({json:this.state.json.map(item=> item._id===msn._id? msn:item),
//resendLimit:this.state.resendLimit+1,
eye:this.state.fitness.filter(f=> f.checked).map((_,i)=>this.refs['plot-'+i].props.layout.scene.camera.eye,this)
});
nm++;
// console.log(nm+'-',this.state.resendLimit*this.state.nMessages);
if(this.state.stop || nm+this.state.nMessages>=(this.state.resendLimit*this.state.nMessages)){
nm=0;
this.setState({isRunning:false});
//setTimeout(()=>this.Save(),4000);
}
},this);
socket.on('finished',async(msn)=>{
// alert('Evolution finished!');
// setTimeout(()=>this.Save(),4000);
if(window.confirm("Experiment ".concat(msn.experimentId," finished, save results?"))){
algorithm.requestJSON(msn.experimentId);
}
});
socket.on('getLog',async(msn)=>{
    algorithm.downloadJSON(msn,'Exp_'+new Date().getTime());
});
}
SliderInput(obj){
return <label>{obj.label}:
<Slider
step={obj.step}
min={obj.min}
max={obj.max}
tooltip={true}
value={this.state[obj.id]}
onChange={value=> obj.percentage? this.setState({[obj.id]:value.toFixed(1)}):this.setState({[obj.id]:value})}
labels={{5:this.state[obj.id]}}
/>
</label>;
}
Run(){
let json= [];
algorithm.clear({resendLimit:this.state.resendLimit*this.state.nMessages*this.state.fitness.filter(item=> item.checked).length,isLivePlot:this.state.isLivePlot});
this.state.fitness.filter(f=> f.checked).map(item=> item.name).forEach((func,fid)=>{
for(let i=1;i<=this.state.nMessages;i++){
let pSize=this.props.random.population? Math.round(Math.random()*999)+1:this.props.population;
let algSelection= this.state.isGA && this.state.isPSO? i%2? 'ga':'pso':this.state.isGA? 'ga':'pso';
let message={
algorithm:algSelection,//i%2? 'ga':'pso',
optimizer:this.props.optimizer,
iterations:this.props.random.iterations? Math.round(Math.random()*1999)+1:this.props.iterations,
size:pSize,
fitness:func,
_id:(/*i%2? 'ga':'pso'*/algSelection)+'-'+fid+'-'+i,
population:algorithm.generateRandomPopulation({
fitness:func,
size:this.props.random.individualSize? Math.round(Math.random()*39)+1:this.props.size,
type:'float',//int,float,string,array,object
rangeValue:[0,10],
length:pSize
})
};

if(message.algorithm==='ga'){
message.mutation=this.props.mutation;
message.crossover=this.props.crossover;
message.crossoverPer=this.props.random.crossoverPercentage?parseFloat(Math.random().toFixed(1)):this.props.crossoverPer;
message.mutationPer=this.props.random.mutationPercentage?parseFloat(Math.random().toFixed(1)):this.props.mutationPer;
message.crossoverFunc=this.props.random.crossoverType?['uniform','splittingPointUniform','onePoint','ring'][Math.round(Math.random()*3)]:this.props.crossoverType;
message.mutationFunc='gaussian';
}else{
message.socialFactor= this.props.random.socialFactor? parseFloat(Math.random().toFixed(1)*3):this.props.socialFactor;
message.individualFactor= this.props.random.individualFactor? parseFloat(Math.random().toFixed(1)*3):this.props.individualFactor;
message.inertiaFactor= this.props.random.inertiaFactor? parseFloat(Math.random().toFixed(1)*3):this.props.inertiaFactor;
}
json.push(message);
this.setState({json:json,stop:false,isRunning:true,plotValues:[]});
algorithm.send(message);
}
},this);
}
async Save(){
const json= this.state.fitness.filter(f=> f.checked).map((_,i)=> {
return {
"fn":this.refs['plot-'+i].props.layout.title.text,
generations:this.props.random.iterations? 'random':this.props.iterations.toString(),
population:this.props.random.population? 'random':this.props.population.toString(),
dimensions:this.props.random.individualSize? 'random':this.props.size.toString(),
crossoverPer:this.props.random.crossoverPercentage?'random':this.props.crossoverPer.toString(),
mutationPer:this.props.random.mutationPercentage?'random':this.props.mutationPer.toString(),
crossoverType:this.props.random.crossoverType?'random':this.props.crossoverType.toString(),
results:this.refs['plot-'+i].props.data.filter(f=> f.type==='scatter3d' || f.mode==='lines').map(m=> m.name.replace(/<br>/g,','))
}
},this);
// console.log(json);
algorithm.save(json);
}
async Clear(){
this.setState({json:[],stop:true});
var functions=[{name:'sphere',checked:true},{name:'rastringin',checked:false},{name:'rosenbrock',checked:true}].filter(f=> f.checked);


algorithm.clear({functions:functions,resendLimit:this.state.resendLimit*this.state.nMessages*this.state.fitness.filter(item=> item.checked).length,isLivePlot:this.state.isLivePlot});

}
async Stop(){
this.setState({stop:true});
}
Checks(obj){
return <div>
{this.state[obj.id].map((item,i)=> <label key={i} style={{padding:'5px'}}><input type='checkbox' checked={item.checked} onClick={val=>
this.setState({fitness:this.state.fitness.map(fit=> fit.name===item.name? {name:fit.name,checked:val.target.checked}:fit,this)})} /> {item.name}</label>,this)}
</div>;
}
GetXYZ(fitnessFunction){
let data=this.state.json.filter(f=> f.fitness===fitnessFunction);
return data.map(dt=>{
let fitnessVal=dt.population.map((item,i)=> fn.fitness[fitnessFunction](item));
// console.log(fitnessVal);
let statistics={min:Math.min.apply(null,fitnessVal),max:Math.max.apply(null,fitnessVal),avg:dt.population.length>0?fitnessVal.reduce((previous, current) => current += previous)/dt.population.length:0};
if(dt.population[0].length===2){
return {
x: dt.population.map(item=> item[0]),
y: dt.population.map(item=> item[1]),
z: fitnessVal,
showlegend:true,
name:'Population '.concat(dt._id,'<br>',
'Min:',statistics.min,
'<br>Max:',statistics.max,
'<br>Avg:',statistics.avg),
marker:{size:5,borderColor:'white',line: {
color: 'rgb(204, 204, 204)',
width: 1
}},
mode: 'markers',
type: 'scatter3d',
};
}else{
// if(lines.length>=this.state.nMessages){
// lines[lines.findIndex(fi=> fi.id===dt.id)].pop=lines.filter(f=> f.id===dt.id).map(item=> item.pop)[0].concat([statistics[dt.optimizer==='Minimize'? 'min':'max']]);
// }else{
// lines.push({id:dt.id,pop:[]});
// }
// console.log('lines:',lines);
return {
y: fitnessVal.sort((a,b)=> dt.optimizer==='Minimize'? b-a:a-b),
// y: lines.filter(f=> f.id===dt.id).map(item=> item.pop)[0],
mode: 'lines',
showlegend:true,
_id:dt._id,
name:'Experiment '.concat(dt._id,'<br>',
'Min:',statistics.min,
'<br>Max:',statistics.max,
'<br>Avg:',statistics.avg)
};
}
},this);
}
render(){
return <Card>
<ButtonGroup>
{this.Checks({id:'fitness',label:'Fitness'})}
{/* <Button onClick={this.Save} variant='primary'>Save</Button> */}
<Button onClick={this.Clear} variant='warning'>Clear</Button>
{/* <Button onClick={this.Stop} variant='danger'>Stop</Button> */}
<Button onClick={this.Run} variant='success'>Run</Button>
</ButtonGroup>
{this.SliderInput({label:'Multi-population size',id:'nMessages',step:1,min:1,max:10,})}
{this.SliderInput({label:'Multi-population Iterations',id:'resendLimit',step:1,min:1,max:50})}
<label><input type='checkbox' checked={this.state.isLivePlot} onClick={val=>
this.setState({isLivePlot:val.target.checked})} /> Live Plot</label>
<label><input type='checkbox' checked={this.state.isGA} onClick={val=>
this.setState({isGA:val.target.checked})} /> GA</label>
<label><input type='checkbox' checked={this.state.isPSO} onClick={val=>
this.setState({isPSO:val.target.checked})} /> PSO</label>
<div>
{
this.state.fitness.filter(f=> f.checked).map((item,nitem)=>{
let xyz=this.GetXYZ(item.name);
if(this.props.size===2){
xyz.push({
type: 'mesh3d',
x: fn[item.name].x,
y: fn[item.name].y,
z: fn[item.name].x.map((xy,i)=> fn.fitness[item.name]([xy,fn[item.name].y[i]])),
intensity: fn[item.name].x.map((xy,i)=> fn.fitness[item.name]([xy,fn[item.name].y[i]])),
colorscale: 'Jet',
opacity:1
});
}

return this.state.is3d?<div key={nitem}><Plot
ref={'plot-'+nitem}
data={xyz}
layout={ {width: 800, height: 600,scene:{camera:{eye:this.state.eye[nitem]}},
title: item.name,legend: {
x: -1,
y: 1,
traceorder: 'normal',
font: {
family: 'sans-serif',
size: 12,
color: '#000'
},
bgcolor: '#E2E2E2',
bordercolor: '#000',
borderwidth: 2
}} }
/></div>:<div></div>
},this)
}
<label>{this.state.isRunning?"Running":"Stoped"}...</label>
</div>
<textarea style={{backgroundColor:'#282c34',color:'#f8d674',fontFamily:'Lucida Console',height:'100px',fontSize:11}} disabled value={JSON.stringify(this.state.json)}></textarea>
</Card>;
}
}

export default Chart;