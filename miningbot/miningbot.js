const Version="0.0.4";
const Commands="/reboot_ /report /balance";

const ConfigFile="/home/mirko/.miningbotconfig.js";

const config = require(ConfigFile);

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')

var exec = require('child_process').exec;
var jayson = require('jayson');

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
    var sMessage="";

    sMessage+="--------------------------\nHello world, bot started\n--------------------------\n";
    sMessage+=`Version: ${Version}, Commands: /reboot_ /report\n--------------------------`;
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, sMessage);

},30000);

bot.command('/report', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        
    ctx.telegram.sendMessage(ctx.message.chat.id, `\n\n--------------------------\n Hello boss, here is your report:\n--------------------------\nsupported commands: ${Commands}`);

    SendFullReport(bot,ctx.message.chat.id);
})

bot.command('/balance', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        

    QueryWalletBalance(function(result){
        ctx.telegram.sendMessage(ctx.message.chat.id,`Balance VTC: ${result.balanceVTC}, $: ${result.balanceUSD}, €: ${result.balanceEUR}`);
        ctx.telegram.sendMessage(ctx.message.chat.id, `Check wallet here: ${config.URLs.WalletLink}\nCheck unpaid balance here:${config.URLs.MPHSummaryLink}`);
    })
    
})

bot.command('/reboot', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        

    ctx.telegram.sendMessage(ctx.message.chat.id, `reboot request received.... restarting`);
    exec('sudo reboot');
});

setInterval(function(){
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN,"\n--------------------\nHello boss!, here is your timed reporting\nsupported commands: ${Commands}");

    SendFullReport(bot);
}, config.REPORT_TIMEOUT_S*1000);

function SendFullReport(bot,chatid)
{
    QueryVPN(function(err,ip){
        if (err)
            bot.telegram.sendMessage(chatid,`VPN- Error: ${err}`);
        else
            bot.telegram.sendMessage(chatid,`VPN- ip: ${ip}, smb: smb://${ip}/ , ssh://${ip} `);

    });

    getNvidiaReport(function(stdout){
        bot.telegram.sendMessage(chatid,stdout);
    });

    QueryPlug(function(err,result){
        if (err)
            bot.telegram.sendMessage(chatid,`Plug- Error: ${err}`);
        else
            bot.telegram.sendMessage(chatid,`Plug-power \n I: ${Math.round(result.current*100.0)/100.0}, V: ${Math.round(result.voltage)}, W: ${Math.round(result.power)} `);
    });

    getCurrentMinerReport(function(stdout){
        var currentminer=stdout;
        var miner="";

        if (currentminer.toLowerCase().indexOf("dstm") !== -1){
            miner="dstm";

            console.log("DSTM is running, querying api")
            QueryDSTM(function(err,result){
                if (err)
                    bot.telegram.sendMessage(chatid,`DSTMstat- Error: ${err}`);
                else
                    bot.telegram.sendMessage(chatid,`DSTM is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
            });
        }

        if (currentminer.toLowerCase().indexOf("ccminer") !== -1){
            miner="ccminer";

            console.log("CCminer is running, querying api")
            QueryCCminer(function(err,result){
                if (err)
                    bot.telegram.sendMessage(chatid,`CCminer- Error: ${err}`);
                else
                    bot.telegram.sendMessage(chatid,`CCminer is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
            });
        }

        if (miner==="")
        {
            bot.telegram.sendMessage(chatid,stdout);

            getMinerReport(function(stdout){
                bot.telegram.sendMessage(chatid,stdout);
            })
        }

    })

}

function getNvidiaReport(callback) {
    exec("nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu,power.draw,power.limit --format=csv", function(error, stdout, stderr){ callback(stdout); });
};

function getCurrentMinerReport(callback) {
    exec("tail -n1 /home/mirko/logs/currentminer.log", function(error, stdout, stderr){ callback(stdout); });
};

function getMinerReport(callback) {
    exec("tail -n10 /home/mirko/logs/ccminer.log", function(error, stdout, stderr){ callback(stdout); });
};

function UserAuth(ctx) {
    var isAllowed=false;

    for (var i = 0; i < config.Admins.length; i++) {
        if (config.Admins[i] == ctx.from.id) {
            isAllowed=true;
        }
    }

    if (!isAllowed)
    {
        ctx.telegram.sendMessage(ctx.message.chat.id, `${ctx.message.from.id} not my owner, bye!`);
        return false;
    }
    return true;
} 

function QueryWalletBalance(callback){
    const http = require('http');

    var result={};
    var coinmarketdata={};

    //get balance
    http.get(`http://explorer.vertcoin.info/ext/getbalance/${config.VertcoinMiningAddress}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            result.balanceVTC=data;

            //get change
            const https = require('https');
            https.get('https://api.coinmarketcap.com/v1/ticker/vertcoin/?convert=EUR', (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    coinmarketdata=JSON.parse(data)[0];
                    console.log(data);
                    result.balanceUSD=result.balanceVTC * coinmarketdata.price_usd;
                    result.balanceEUR=result.balanceVTC * coinmarketdata.price_eur;
                    result.var24=coinmarketdata.percent_change_24h;    
                    result.var7d=coinmarketdata.percent_change_7d;

                    result.balanceEUR=Math.round(result.balanceEUR*100.0)/100.0;
                    result.balanceVTC=Math.round(result.balanceVTC*100.0)/100.0;
                    result.balanceUSD=Math.round(result.balanceUSD*100.0)/100.0;
                    
                    
                    callback(result);
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });



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
            result.Hr=Math.round(result.Hr*100.0)/100.0;
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

            res.Hr=Math.round(res.Hr*100.0)/100.0;
        }catch(stderr){
            console.log(stderr);
        }

        callback(stderr,res); 
    });

}

function QueryVPN(callback)
{
    var command="ifconfig tun0";
    var ipaddress="";

    exec(command, function(error,stdout,stderr){
        console.log("ifconfig answer:" + stdout); 

        try{
            var r=stdout.match(/inet ([0-9]*.[0-9]*.[0-9]*.[0-9]*).*/);
            ipaddress=r[1];

        }catch(error){
            console.log(error);
        }

        callback(stderr,ipaddress);


    });

}

// Start polling
bot.startPolling()
