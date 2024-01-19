if(process.env.FULL_INIT_STARTUP!=1){
    console.log("Please run from init.bat!");
    console.log(`ENV_VAR = ${process.env.FULL_INIT_STARTUP}`);
    throw "Error init!";
}
const nodemon = require("nodemon");

nodemon({
    script: 'app.js',
    ext: 'js'
});

nodemon.on('start', function(){
    console.log('App has started');
}).on('quit', function(){
    console.log('App has quit!');
}).on('restart', function(files){
    console.log("App restarted due to: ", files);
});