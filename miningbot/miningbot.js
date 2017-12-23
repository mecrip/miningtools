const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
//const { reply } = Telegraf

var exec = require('child_process').exec;
var jayson = require('jayson');

const config = require("/home/mirko/.miningbotconfig.js");

console.info(config.TELEGRAM_TOKEN); 
const bot = new Telegraf(config.TELEGRAM_TOKEN)

bot.use(session())

// Register logger middleware
bot.use((ctx, next) => {
    const start = new Date()
    return next().then(() => {
        const ms = new Date() - start
        console.log('response time %sms', ms)
    })
}) 

setTimeout(function(){
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, "--------------------------\n\n hello world, bot started\n\n--------------------------\n\n");
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, "supported commands: /reboot_ /report");
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, "Version 0.0.1");    
},30000);

bot.command('/report', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        
    ctx.telegram.sendMessage(ctx.message.chat.id, `--------------------------\n\n hello boss, here is your report\n\n--------------------------\n\n`);
    SendFullReport(bot);
})

bot.command('/reboot', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        
    
    ctx.telegram.sendMessage(ctx.message.chat.id, `reboot request received.... restarting`);
    exec('sudo reboot');
});

setInterval(function(){
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,"\n\n--------------------\n\nHello boss!, here is your timed reporting\n\n");
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, "supported commands: /reboot /report");
    SendFullReport(bot);
}, config.REPORT_TIMEOUT_S*1000);

function SendFullReport(bot)
{
    getNvidiaReport(function(stdout){
        bot.telegram.sendMessage(config.TELEGRAM_ADMIN,stdout);
    })

    QueryPlug(function(err,result){
        if (err)
            bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`Plug- Error: ${err}`);
        else
            bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`Plug-power \n I: ${result.current}, V: ${result.voltage}, W: ${result.power} `);
    });
    
    getCurrentMinerReport(function(stdout){
        var currentminer=stdout;
        var miner="";

        if (currentminer.toLowerCase().indexOf("dstm") !== -1){
            miner="dstm";

            console.log("DSTM is running, querying api")
            QueryDSTM(function(err,result){
                if (err)
                    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`DSTMstat- Error: ${err}`);
                else
                    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`DSTM is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
            });
        }

        if (currentminer.toLowerCase().indexOf("ccminer") !== -1){
            miner="ccminer";

            console.log("CCminer is running, querying api")
            QueryCCminer(function(err,result){
                if (err)
                    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`CCminer- Error: ${err}`);
                else
                    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,`CCminer is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
            });
        }

        if (miner==="")
        {
            bot.telegram.sendMessage(config.TELEGRAM_ADMIN,stdout);

            getMinerReport(function(stdout){
                bot.telegram.sendMessage(config.TELEGRAM_ADMIN,stdout);
            })
        }

    })

}

function getNvidiaReport(callback) {
    exec("nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu --format=csv", function(error, stdout, stderr){ callback(stdout); });
};

function getCurrentMinerReport(callback) {
    exec("tail -n1 /home/mirko/logs/currentminer.log", function(error, stdout, stderr){ callback(stdout); });
};

function getMinerReport(callback) {
    exec("tail -n10 /home/mirko/logs/ccminer.log", function(error, stdout, stderr){ callback(stdout); });
};

function UserAuth(ctx) {
    if (ctx.from.id != config.TELEGRAM_ADMIN)
    {
        ctx.telegram.sendMessage(ctx.message.chat.id, `not my owner, bye!`);
        ctx.leaveChat();
        return false;
    }
    return true;
} 

function QueryPlug(callback)
{

    try{
        const { Client } = require('tplink-smarthome-api');

        const client = new Client();

        const plug = client.getDevice(
            {host: config.TP110_PLUG_IP}
        ).then((device)=>{
            device.emeter.getRealtime().then((res,err)=>{callback(err,res)});
        });
    }
    catch(err){};

}

function QueryDSTM(callback)
{
    var result={};
    result.GpuCount=0;
    result.Hr=0
    result.AvgHr=0;
    // create a client
    var client = jayson.client.tcp({
        port: 2222,
        host: "127.0.0.1"
    });

    // invoke "add"
    client.request('getstat', [], function(err, response) {
        //console.log("response:" + response);

        result.uptime=Math.round(100.0 * (response.uptime/3600.0))/100.0;
        result.algo="equihash";
        if(!err)
        {     
            for(var item of response.result) {
                console.log(`cpu ${item.gpu_id}, ${item.avg_sol_ps} ${item.sol_ps}`)
                result.Hr+=item.sol_ps;
                result.AvgHr+=item.avg_sol_ps;
                result.GpuCount++;
            }
        }
        callback(err,result);
    });
}

function QueryCCminer(callback)
{
    var command="echo 'summary' | netcat localhost 4068";

    exec(command, function(error, stdout, stderr){

        //sample asnwer:
        //mirko@Sneezy:~/dev/miningtools/miningbot$ echo 'summary' | netcat localhost 4068
        //NAME=ccminer;VER=2.2.3;API=1.9;ALGO=lyra2v2;GPUS=4;KHS=153232.61;SOLV=0;ACC=30;REJ=0;ACCMN=3.659;DIFF=43433.738117;NETKHS=0;POOLS=1;WAIT=0;UPTIME=492;TS=1513700779|
        console.log("ccminer answer:" + stdout);
        try{
            var result = stdout.match(/.*;ALGO=([a-zA-Z0-9]+);.*;KHS=([0-9]+).*;UPTIME=([0-9]+)/);

            var res={};
            res.algo=result[1];
            res.Hr=result[2];
            res.uptime=Math.round(100.0 * (result[3]/3600.0))/100.0;
        }catch(stderr){}

        callback(stderr,res); 
    });

}


// Start polling
bot.startPolling()
