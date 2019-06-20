import React, { Component } from 'react';
//import {styles} from './ControlPanelStyles.js';
import {ListGroup,
Dropdown,
Row,
Col,
Card}
from 'react-bootstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import Chart from './Chart.js';
class ControlPanel extends Component{
constructor(props){
super(props);
this.state={
individual:{
types:['int','float','decimal'],
selected:'int',
},
individualSize:2,
mutation:{
types:['Tournament2','Tournament3','Random','RandomLinearRank','Sequential','Fittest'],
selected:'Tournament3'
},
crossover:{
types:['Tournament2','Tournament3','Random','RandomLinearRank','Sequential','FittestRandom'],
selected:'Tournament3'
},
optimizer:{
types:['Minimize','Maximize'],
selected:'Minimize'
},
crossoverType:{
types:['uniform','splittingPointUniform','onePoint','ring'],
selected:'splittingPointUniform'
},
iterations:70,
population:200,
mutationPercentage:0.2,
crossoverPercentage:0.6,
socialFactor:2.05,
individualFactor:2.05,
inertiaFactor:1,
fitness:{
types:['sphere'],
selected:'sphere'
},
randomParams:{
individual:false,
iterations:false,
population:false,
crossover:true,
mutation:true,
crossoverPercentage:false,
mutationPercentage:false,
crossoverType:false,
socialFactor:true,
individualFactor:true,
inertiaFactor:true
}
};
}
SliderInput(obj){
return <label>{obj.label}:
<Slider
step={obj.step}
min={obj.min}
max={obj.max}
tooltip={true}
value={this.state[obj.id]}
onChange={value=> obj.percentage? this.setState({[obj.id]:value.toFixed(2)}):this.setState({[obj.id]:value})}
labels={{10:this.state[obj.id]}}
/>
{this.RandomCheckBox(obj.checkbox,obj.id)}
</label>;
}
DropdownInput(obj){
return <label>{obj.label}:
<Dropdown>
<Dropdown.Toggle variant="primary" size='sm'>
{this.state[obj.id].selected}
</Dropdown.Toggle>
<Dropdown.Menu>
{this.state[obj.id].types.map((item,i)=> <Dropdown.Item
key={i}
onClick={()=>{var value=this.state[obj.id];
value.selected=item;
this.setState({[obj.id]:value});}}>{item}</Dropdown.Item>)
}
</Dropdown.Menu>
</Dropdown>
{this.RandomCheckBox(obj.checkbox,obj.id)}
</label>;
}
RandomCheckBox(isCheckbox,id){
return isCheckbox? <div style={{marginTop:'-35px',transform:'translate(92px,20px)'}}>
<small>random </small><input type='checkbox' checked={this.state.randomParams[id]} onClick={target=> {
var value= this.state.randomParams;
value[id]= target.target.checked;
this.setState({randomParams:value});
}}/>
</div>:<div style={{marginTop:'-35px',transform:'translate(92px,20px)'}}></div>;
}
render(){
return <Row>
<Col xs={3}>
<Card>
<ListGroup>
<ListGroup.Item>{this.SliderInput({label:'Generations',id:'iterations',step:10,min:1,max:2000,checkbox:true})}</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Population',id:'population',step:10,min:10,max:1500,checkbox:true})}</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Individual size',id:'individualSize',step:1,min:2,max:40,checkbox:true})}</ListGroup.Item>
<ListGroup.Item>{this.DropdownInput({id:'optimizer',label:'Optimizer',checkbox:false})}</ListGroup.Item>
<ListGroup.Item style={{background:'#d1d1d1'}}><label>GA Parameters</label></ListGroup.Item>
<ListGroup.Item>{this.DropdownInput({id:'crossover',label:'Crossover selection',checkbox:true})}
</ListGroup.Item>
<ListGroup.Item>{this.DropdownInput({id:'crossoverType',label:'Crossover Type',checkbox:true})}
</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Crossover %',id:'crossoverPercentage',step:0.1,min:0.0,max:1.0,checkbox:true,percentage:true})}</ListGroup.Item>
<ListGroup.Item>{this.DropdownInput({id:'mutation',label:'Mutation selection',checkbox:true})}</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Mutation %',id:'mutationPercentage',step:0.1,min:0.0,max:1.0,checkbox:true,percentage:true})}</ListGroup.Item>
<ListGroup.Item style={{background:'#d1d1d1'}}><label>PSO Parameters</label></ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Social factor',id:'socialFactor',step:0.01,min:0.0,max:4.0,checkbox:true,percentage:true})}</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Individual factor',id:'individualFactor',step:0.01,min:0.0,max:4.0,checkbox:true,percentage:true})}</ListGroup.Item>
<ListGroup.Item>{this.SliderInput({label:'Inertia factor',id:'inertiaFactor',step:0.01,min:0.0,max:2.0,checkbox:true,percentage:true})}</ListGroup.Item>
</ListGroup>
</Card>
</Col>
<Col xs={9}>
<Chart
iterations={this.state.iterations}
population={this.state.population}
mutation={this.state.mutation.selected}
mutationPer={this.state.mutationPercentage}
crossover={this.state.crossover.selected}
crossoverPer={this.state.crossoverPercentage}
crossoverType={this.state.crossoverType.selected}
optimizer={this.state.optimizer.selected}
size={this.state.individualSize}
socialFactor={this.state.socialFactor}
individualFactor={this.state.individualFactor}
inertiaFactor={this.state.inertiaFactor}
random={this.state.randomParams}
/>
</Col>
</Row>;
}
}

export default ControlPanel;