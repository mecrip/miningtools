const Version="0.0.5";
const Commands="/reboot_ /report /balance";

const ConfigFile="/home/mirko/.miningbotconfig.js";

const config = require(ConfigFile);

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')

var exec = require('child_process').exec;
var jayson = require('jayson');

console.info("Bot started");
console.info(config.TELEGRAM_TOKEN); 
const bot = new Telegraf(config.TELEGRAM_TOKEN)

bot.use(session())

setTimeout(function(){
    var sMessage="";

    sMessage+="--------------------------\nHello world, bot started\n--------------------------\n";
    sMessage+=`Version: ${Version}, Commands: ${Commands}\n--------------------------`;
    bot.telegram.sendMessage(config.TELEGRAM_ADMIN, sMessage);

},30000);

bot.command('/report', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        
    SendFullReport(bot,ctx.message.chat.id);
})

bot.command('/balance', (ctx) => {
    if(!UserAuth(ctx)){
        return;
    }        

    QueryWalletBalance(function(result){
        ctx.telegram.sendMessage(ctx.message.chat.id, `Balance ${result.coin}: ${result.balance}, €: ${result.balanceEUR},  ${result.link} `);
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
    SendFullReport(bot);
}, config.REPORT_TIMEOUT_S*1000);

function SendFullReport(bot,chatid)
{
    bot.telegram.sendMessage(chatid, `\n\n--------------------------\n Hello boss, here is your report:\n--------------------------\nsupported commands: ${Commands}`);


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


    DetectMiner(function (currentminer){

        switch(currentminer){

            case 'dstm':
        
                //console.log("DSTM is running, querying api")
                QueryDSTM(function(err,result){
                    if (err)
                        bot.telegram.sendMessage(chatid,`DSTMstat- Error: ${err}`);
                    else
                        bot.telegram.sendMessage(chatid,`DSTM is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
                });
                break;

            case 'ccminer':
        
                //console.log("CCminer is running, querying api")
                QueryCCminer(function(err,result){
                    if (err)
                        bot.telegram.sendMessage(chatid,`CCminer- Error: ${err}`);
                    else
                        bot.telegram.sendMessage(chatid,`CCminer is running \n Algo: ${result.algo}, KH/s: ${result.Hr}, Uptime(h): ${result.uptime} `);
                });
                break;

            default:
                //bot.telegram.sendMessage(chatid,stdout);

                getMinerReport(function(stdout){
                    bot.telegram.sendMessage(chatid,stdout);
                })
        }
    });
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
    
	for(var w of config.Wallets){
		switch (w.Coin){
			case 'VTC':
				QueryVTC(callback,w);
				break;
			case 'ETC':
				QueryETC(callback,w);
				break;
		}
	}
}


function InitQueryResult(w)
{
	var result={};
	result.coin=w.Coin;
	result.link=w.link;
	result.balanceUSD=0;
    result.balanceEUR=0;
	result.var24=0;    
	result.var7d=0;
    result.balance=0;
	return result;
}

function QueryETC(callback,w)
{
	var result=InitQueryResult(w);
	
	const http = require('https');

    //get balance
    http.get(`https://etcchain.com/api/v1/getAddressBalance?address=${w.wallet}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            result.balance=JSON.parse(data).balance;

			QueryCoinMarketCap(w,result,callback);
         
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function QueryVTC(callback,w){
	const http = require('http');
	
	var result=InitQueryResult(w);
	
    //get balance
    http.get(`http://explorer.vertcoin.info/ext/getbalance/${w.wallet}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            result.balance=data;

			QueryCoinMarketCap(w,result,callback);
         
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function QueryCoinMarketCap(w,result,callback){
	//get change
	const https = require('https');
	https.get(w.CoinMarketCapQuery, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			ParseBalanceResult(data,result);
			
			//console.log(result);

			callback(result);
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

function ParseBalanceResult(data,result){

	var coinmarketdata=JSON.parse(data)[0];
	
	result.balanceUSD=result.balance * coinmarketdata.price_usd;
	result.balanceEUR=result.balance * coinmarketdata.price_eur;
	result.var24=coinmarketdata.percent_change_24h;    
	result.var7d=coinmarketdata.percent_change_7d;

	result.balance=Math.round(result.balance*1000.0)/1000.0;
	result.balanceEUR=Math.round(result.balanceEUR*100.0)/100.0;
	result.balanceUSD=Math.round(result.balanceUSD*100.0)/100.0;
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
        //console.log("ccminer answer:" + stdout);
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
    var command="/sbin/ifconfig tun0";
    var ipaddress="";

    exec(command, function(error,stdout,stderr){
        //console.log("ifconfig answer:" + stdout); 

        try{
            var r=stdout.match(/inet ([0-9]*.[0-9]*.[0-9]*.[0-9]*).*/);
            if (r!=null)
                ipaddress=r[1];
            else
                ipaddress="error";
        }catch(error){
            console.log(error);
        }

        callback(stderr,ipaddress);


    });

}

function DetectMiner(callback)
{
    //check ccminer
    var command="ps -ef | grep ccminer | grep -v grep";
    exec(command, function(error, stdout, stderr){
        console.log("cc stdout len " + stdout.length );

        if (stdout.length>0)
            callback("ccminer");
        else
        {
            //test dstm
            var command="ps -ef | grep zm | grep -v grep";
            exec(command, function(error, stdout, stderr){
                console.log("zm stdout len" + stdout.length );

                if (stdout.length>0)
                    callback("dstm");
                else
                {
                    //test claymore
                    var command="ps -ef | grep ethdcrminer64 | grep -v grep";
                    exec(command, function(error, stdout, stderr){
                        console.log("clay stdout len " + stdout.length );

                        if (stdout.length>0)
                            callback("claymore");
                        else
                            callback("unknown");

                    });
                }

            });
        }
    });

}
// Start polling
bot.startPolling()
