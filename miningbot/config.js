
var config ={};

config.URLs={};


config.Wallets=[
	{ id:1,Coin:"VTC",wallet:"asfasf",link:'',CoinMarketCapQuery:'https://api.coinmarketcap.com/v1/ticker/vertcoin/?convert=EUR'},
	{ id:2,Coin:"ETC",wallet:"asfafs",link:'',CoinMarketCapQuery:'https://api.coinmarketcap.com/v1/ticker/ethereum-classic/?convert=EUR'},
	{	id:3,Coin:"ZCL",wallet:"MPH",link:'',CoinMarketCapQuery:'https://api.coinmarketcap.com/v1/ticker/ethereum-classic/?convert=EUR'}
];

config.TELEGRAM_TOKEN="";
config.TELEGRAM_ADMIN="98135983";
config.Admins=["32512","23523","23512"];

config.REPORT_TIMEOUT_S=3600;

config.TP110_PLUG_IP="192.168.50.52";

module.exports = config;
