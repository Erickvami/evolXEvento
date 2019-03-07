
var process1=(async () => {
  const { job, start, stop } = require("microjob");
 
  try {
    // start the worker pool
      
    await start();
 
    // this function will be executed in another thread
    const res =await job(() => {
      let i = 0; let array=[];
      for (i = 0; i < 1000; i++) {
        // heavy CPU load ...
       array.push(i);    
          
      }
    
}); 
      return array;
    });
    
    console.log(res); // 1000000
  } catch (err) {
    console.error(err);
  } finally {
    // shutdown worker pool
    await stop();
  }
});

var process2=(async () => {
  const { job, start, stop } = require("microjob");
 
  try {
    // start the worker pool
      
     await start();
 
    // this function will be executed in another thread
    const res = await job(() => {

      let i = 0; let array=[];
      for (i = 0; i < 100; i++) {
        // heavy CPU load ...
       array.push(i);    
          
      }
 //console.log(array);
      return array;
    });
    
    console.log(res); // 1000000
  } catch (err) {
    console.error(err);
  } finally {
    // shutdown worker pool
   await  stop();
  }
});

process1();
process2();