import React, { Component } from 'react';
import {
    Card,
    Button,
    ButtonGroup,
    Dropdown
       } from 'react-bootstrap';
import Slider from 'react-rangeslider';
import {algorithm} from './algorithm.js';
import socketIOClient from "socket.io-client";
import Plot from 'react-plotly.js';
import {fn} from './constants.js';
//var amqp = require('amqplib/callback_api');
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
            optimizer:this.props.optimizer,
            size:this.props.size,
            id:1,
            random:this.props.random,
            nMessages:1,
            json:[],
            fitness:[{name:'sphere',checked:true},{name:'rastringin',checked:false}],
            plotValues:[],
            stop:true
        };
        this.Run= this.Run.bind(this);
        this.Stop= this.Stop.bind(this);
        this.Clear= this.Clear.bind(this);
    }
    componentDidMount(){
        const socket= socketIOClient('localhost:3001');
        socket.on('evolved',async (msn)=> {
            if(!this.state.stop){
            this.Resend(msn);
            }
            this.setState({json:this.state.json.map(item=> item.id===msn.id? msn:item)});    
        },this);
    }
    Resend(population){
        console.log(population);
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
                  labels={{50:this.state[obj.id]}}
                />
                    </label>;
    }
    async Run(){
        
        let json= [];
        this.state.fitness.filter(f=> f.checked).map(item=> item.name).forEach((func,fid)=>{
             for(let i=1;i<=this.state.nMessages;i++){
                 let pSize=this.props.random.population? Math.round(Math.random()*999)+1:this.props.population;
            let message={
    mutation:this.props.mutation,
    crossover:this.props.crossover,
    optimizer:this.props.optimizer,
    iterations:this.props.random.iterations? Math.round(Math.random()*100000):this.props.iterations,
    size:pSize,
    fitness:func,
    crossoverPer:this.props.random.crossoverPercentage?parseFloat(Math.random().toFixed(1)):this.props.crossoverPer,
    mutationPer:this.props.random.mutationPercentage?parseFloat(Math.random().toFixed(1)):this.props.mutationPer,
    id:fid+'-'+i,
    population:algorithm.generateRandomPopulation({
        fitness:func,
        size:this.props.random.individualSize? Math.round(Math.random()*49)+1:this.props.size,
        type:'float',//int,float,string,array,object
        rangeValue:[0,10],
        length:pSize
    })
        };
        json.push(message);
            
            //send message
        algorithm.send(message);
        //finishing send message
        this.setState({json:json,stop:false});
        }
        },this);
       
    }
    async Clear(){
        this.setState({json:[],stop:true});
    }
    async Stop(){
        this.setState({stop:true});
    }
    Checks(obj){
        return <div>
            {this.state[obj.id].map((item,i)=> <label style={{padding:'5px'}}><input type='checkbox' checked={item.checked} onClick={val=>
            this.setState({fitness:this.state.fitness.map(fit=> fit.name===item.name? {name:fit.name,checked:val.target.checked}:fit,this)})} /> {item.name}</label>,this)}
        </div>;
    }
    GetXYZ(fitnessFunction){
        let x=this.state.json.filter(f=> f.fitness===fitnessFunction).length>0?this.state.json.filter(f=> f.fitness===fitnessFunction)[0].population.map(item=> item[0]):[];
        let y=this.state.json.filter(f=> f.fitness===fitnessFunction).length>0?this.state.json.filter(f=> f.fitness===fitnessFunction)[0].population.map(item=> item[1]):[];
        return {
            x:x,
            y:y,
            z:this.state.json.filter(f=> f.fitness===fitnessFunction).length>0?y.map((item,i)=> fn.fitness[fitnessFunction]([item,x[i]])):[]
        }
    }
    render(){
        return <Card>
            <ButtonGroup>
            {this.Checks({id:'fitness',label:'Fitness'})}
            <Button onClick={this.Clear} variant='primary'>Clear</Button>
            <Button onClick={this.Stop} variant='danger'>Stop</Button>
            <Button onClick={this.Run} variant='success'>Run</Button>
            </ButtonGroup>
            {this.SliderInput({label:'Packages',id:'nMessages',step:1,min:1,max:100,})}
            <div>
                {
                    this.state.fitness.filter(f=> f.checked).map(item=>{
                        let xyz=this.GetXYZ(item.name);
                        return  <div><Plot
        data={[
          {
            x: fn[item.name].x,
            y: fn[item.name].y,
            z: fn[item.name].y.map((xy,i)=> fn.fitness[item.name]([xy,fn[item.name].x[i]])),
            type: 'mesh3d',
            color:'#01c4c3',
            opacity:0.8
          },{
            x: xyz.x,
            y: xyz.y,
            z: xyz.z,
            marker:{size:4,color:'#1e1f26'},
            mode: 'markers',
            type: 'scatter3d',
            color:'#1e1f26',
          }
        ]}
        layout={ {width: 500, height: 500, title: item.name} }
      /></div>
                    },this)
                }
            
            </div>
            <textarea style={{backgroundColor:'#282c34',color:'#f8d674',fontFamily:'Lucida Console',height:'100px',fontSize:11}} disabled value={JSON.stringify(this.state.json)}></textarea>
            </Card>;
    }
}
export default Chart;