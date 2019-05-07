var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/evol";

function insert(myobj){
    MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
        if (err) throw err;
        var dbo = db.db("myfirstdb");
            //   var myobj = { name: "val"+i, value: i };
              dbo.collection("pop").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();    
              });
      }); 
}

// for(let i=0;i<=10;i++){
//     // population.push({ name: "val"+Math.random(), value: Math.random() });
//     insert({_id:'ga-'+i ,name: "val"+Math.random(), value: i });
// }
// insert(population);
// population=[];

// MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("myfirstdb");
//     dbo.collection("customers").findOne({name:"Erick Inc"}, function(err, result) {
//       if (err) throw err;
//       console.log(result.address);
//       db.close();
//     });
//   }); 


//Select all
MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db("evol");
    dbo.collection("current").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  }); 


//Select max
// function selectMax(callback){
//      MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("myfirstdb");
//          dbo.collection("pop").find({name:'replaced2'},{"sort": [['value','desc']],limit:1}).toArray(function(err, result) {
//           if (err) throw err;
//        console.log(result[0]);
//           db.close();
//         });
        
//       });
// }
// let x=null;
// async function selectMax(){
//     return MongoClient.connect(url, { useNewUrlParser: true }).then(db=>{
//         let dbo= db.db('myfirstdb');

//         let collection=dbo.collection("pop").find({name:'replaced2'},{"sort": [['value','desc']],limit:1}).toArray().then(out=> x=out).then(()=> db.close());

//         console.log(collection);
//         return dbo.collection("pop").find({name:'replaced2'},{"sort": [['value','desc']],limit:1}).toArray().then(result=> result);
//     }).then(items=> items).then(res=> res);
// }
 
// console.log(selectMax().then(()=> console.log(x)));
// console.log(x);

//Remove all
// MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("second");
//     dbo.collection("popu").deleteMany({});
//     db.close();
//   }); 

//Replace
// MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("myfirstdb");
//     dbo.collection("pop").findOneAndUpdate({_id:'ga-6'},{$set:{name:'replaced2'}});
//     db.close();
//   });

