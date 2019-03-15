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
            crossoverType:this.props.crossoverType,
            optimizer:this.props.optimizer,
            size:this.props.size,
            id:1,
            random:this.props.random,
            nMessages:2,
            json:[],
            fitness:[{name:'sphere',checked:true},{name:'rastringin',checked:false}],
            plotValues:[],
            stop:true,
            resendLimit:0,
            isRunning:false,
            resend:false
        };
        this.Run= this.Run.bind(this);
        this.Stop= this.Stop.bind(this);
        this.Clear= this.Clear.bind(this);
    }
    componentDidMount(){
        const socket= socketIOClient('localhost:3001');
        socket.on('evolved',async (msn)=> {
            this.setState({json:this.state.json.map(item=> item.id===msn.id? msn:item),resendLimit:this.state.resendLimit+1});    
//            if(this.state.resendLimit===this.state.json.length){
//               alert("first loop finished");
//                rs = setInterval(()=>this.Resend(),4000);
//               }
            
            if(this.state.stop ){//|| this.state.resendLimit>=(10)*this.state.nMessages){
                clearInterval(rs);
            this.setState({isRunning:false,resend:false});
            }
//            if(!this.state.stop && this.state.resendLimit<(10)*this.state.nMessages){
//            this.Resend(msn);
//            }else{
//                this.setState({isRunning:false});
//            }

        },this);
    }
    async Resend(){
            
        let randomfitness=this.state.fitness[Math.round(Math.random()*(this.state.fitness.filter(f=> f.checked).length-1))].name;
        console.log("resending",randomfitness);
            algorithm.resend([this.state.json.filter(f=> f.fitness===randomfitness)[Math.round(Math.random()*(this.state.nMessages-1))],this.state.json.filter(f=> f.fitness===randomfitness)[Math.round(Math.random()*(this.state.nMessages-1))]]);

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
        this.state.fitness.filter(f=> f.checked).map(item=> item.name).forEach((func,fid)=>{
             for(let i=1;i<=this.state.nMessages;i++){
                 let pSize=this.props.random.population? Math.round(Math.random()*999)+1:this.props.population;
            let message={
    mutation:this.props.mutation,
    crossover:this.props.crossover,
    optimizer:this.props.optimizer,
    iterations:this.props.random.iterations? Math.round(Math.random()*4999)+1:this.props.iterations,
    size:pSize,
    fitness:func,
    crossoverPer:this.props.random.crossoverPercentage?parseFloat(Math.random().toFixed(1)):this.props.crossoverPer,
    mutationPer:this.props.random.mutationPercentage?parseFloat(Math.random().toFixed(1)):this.props.mutationPer,
    crossoverFunc:this.props.crossoverType,
    mutationFunc:'gaussian',
    id:fid+'-'+i,
    population:algorithm.generateRandomPopulation({
        fitness:func,
        size:this.props.random.individualSize? Math.round(Math.random()*39)+1:this.props.size,
        type:'float',//int,float,string,array,object
        rangeValue:[0,10],
        length:pSize
    })
        };
                 
        json.push(message);
            
            //send message
//        setTimeout(()=>{         
//        algorithm.send(message);
//        },5000);
        //finishing send message
        this.setState({json:json,stop:false,resendLimit:0,isRunning:true});
        }
        },this);
        rs = setInterval(()=>this.Resend(),3000);
       
    }
    async Clear(){
        
        this.setState({json:[],stop:true});
        clearInterval(rs);
    }
    async Stop(){
        this.setState({stop:true});
        clearInterval(rs);
    }
    Checks(obj){
        return <div>
            {this.state[obj.id].map((item,i)=> <label style={{padding:'5px'}}><input type='checkbox' checked={item.checked} onClick={val=>
            this.setState({fitness:this.state.fitness.map(fit=> fit.name===item.name? {name:fit.name,checked:val.target.checked}:fit,this)})} /> {item.name}</label>,this)}
        </div>;
    }
    GetXYZ(fitnessFunction){
        let data=this.state.json.filter(f=> f.fitness===fitnessFunction);
        
        
        return data.map(dt=>{
//            console.log(dt);
            let x=dt.population.map(item=> item[0]);
            let y=dt.population.map(item=> item[1]);
            let z=y.map((item,i)=> fn.fitness[fitnessFunction]([item,x[i]]));
            return {
            x: x,
            y: y,
            z: z,
            showlegend:true,
            name:'Experiment '.concat(dt.id,'<br>',
                                      'Min:',Math.min.apply(null,z),//Array.prototype.slice.call(z).sort((a,b)=> a-b)[0],////Array.prototype.slice.call(z).sort()[0],
                                      '<br>Max:',Math.max.apply(null,z),
                                      '<br>Avg:',z.length>0?z.reduce((previous, current) => current += previous)/z.length:0),
//            text:'alex',
            marker:{size:5,/*color:'#1e1f26',*/borderColor:'white',line: {
                  color: 'rgb(204, 204, 204)',
                  width: 1
            }},
            mode: 'markers', 
            type: 'scatter3d',
//            color:'#1e1f26'
          };
        },this);
    }
    render(){
        return <Card>
            <ButtonGroup>
            {this.Checks({id:'fitness',label:'Fitness'})}
            <Button onClick={this.Clear} variant='primary'>Clear</Button>
            <Button onClick={this.Stop} variant='danger'>Stop</Button>
            <Button onClick={this.Run} variant='success'>Run</Button>
            </ButtonGroup>
            {this.SliderInput({label:'Packages',id:'nMessages',step:1,min:1,max:10,})}
            <div>
                {
                    this.state.fitness.filter(f=> f.checked).map(item=>{
                        let xyz=this.GetXYZ(item.name);
//                        if(xyz.length>0){
//                        console.log(
//                            xyz[0].z.map((zitem,zi)=> {return {x:xyz[0].x[zi],
//                                y:xyz[0].y[zi],
//                                    z:zitem}})
//                            .sort((a,b)=> a.z-b.z));
//                        }
                        xyz.push({
            type: 'mesh3d',
            x: fn[item.name].x,
            y: fn[item.name].y,
            z: fn[item.name].y.map((xy,i)=> fn.fitness[item.name]([xy,fn[item.name].x[i]])),
            intensity: fn[item.name].y.map((xy,i)=> fn.fitness[item.name]([xy,fn[item.name].x[i]])),
            colorscale: 'Jet', 
            opacity:1
          });
//                        console.log(xyz);
                        return  <div><Plot
        data={xyz}
        layout={ {width: 700, height: 600, title: item.name,legend: {
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
      /></div>
                    },this)
                }
            <label>{this.state.isRunning?"Running":"Stoped"}...</label>
            </div>
            <textarea style={{backgroundColor:'#282c34',color:'#f8d674',fontFamily:'Lucida Console',height:'100px',fontSize:11}} disabled value={JSON.stringify(this.state.json)}></textarea>
            </Card>;
    }
}

let rs=null;
export default Chart;