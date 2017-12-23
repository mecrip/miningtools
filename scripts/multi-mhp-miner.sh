#!/bin/bash

WORKER='mecrip.AutoSneezy'
PASSWORD='x'
CCPARAMS=" -b 0.0.0.0:4068  --intensity=22 >> /home/mirko/logs/ccminer.log 2>&1"
MINER=""

while true; do
    
    MINER=' miner:claymore algo:ethash '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /home/mirko/miner/claymoredual/current/ethdcrminer64 -epool europe.ethash-hub.miningpoolhub.com:12020 -ewal $WORKER -eworker $WORKER -esm 3 -epsw $PASSWORD -allcoins 1 -retrydelay -1 >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:dstm algo:equihash '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /home/mirko/miner/dstm/current/zm --server europe.equihash-hub.miningpoolhub.com --port 12023 --user $WORKER --pass $PASSWORD --noreconnect --telemetry=0.0.0.0:2222 >>  /home/mirko/logs/ccminer.log 2>&1
    #/usr/local/bin/ccminer -r 0 -a equihash -o stratum+tcp://europe.equihash-hub.miningpoolhub.com:12023     -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1 
    
    MINER=' miner:ccminer algo:groestl '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a groestl -o stratum+tcp://hub.miningpoolhub.com:12004             -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1 
    
    MINER=' miner:ccminer algo:myr-gr '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a myr-gr -o stratum+tcp://hub.miningpoolhub.com:12005              -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:x11 '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a x11 -o stratum+tcp://hub.miningpoolhub.com:12007                 -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068                >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:x13 '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a x13 -o stratum+tcp://hub.miningpoolhub.com:12008                 -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068                >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:x15 '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log    
    /usr/local/bin/ccminer -r 0 -a x15 -o stratum+tcp://hub.miningpoolhub.com:12009                 -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068                >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:neoscrypt '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log    
    /usr/local/bin/ccminer -r 0 -a neoscrypt -o stratum+tcp://hub.miningpoolhub.com:12012           -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:qubit '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log    
    /usr/local/bin/ccminer -r 0 -a qubit -o stratum+tcp://hub.miningpoolhub.com:12014               -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068  >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:quark '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log    
    /usr/local/bin/ccminer -r 0 -a quark -o stratum+tcp://hub.miningpoolhub.com:12015               -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1

    MINER=' miner:ccminer algo:skein '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a skein -o stratum+tcp://hub.miningpoolhub.com:12016               -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1
 
    MINER=' miner:ccminer algo:lyra2v2 '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a lyra2v2 -o stratum+tcp://hub.miningpoolhub.com:12018             -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity=22 >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:vanilla '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a vanilla -o stratum+tcp://hub.miningpoolhub.com:12019             -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity 22 >> /home/mirko/logs/ccminer.log 2>&1
    
    MINER=' miner:ccminer algo:lyra2z '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a lyra2z -o stratum+tcp://europe.lyra2z-hub.miningpoolhub.com:12025              -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068 --intensity=22 >> /home/mirko/logs/ccminer.log 2>&1

    MINER=' miner:ccminer algo:cryptonight '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /usr/local/bin/ccminer -r 0 -a cryptonight -o stratum+tcp://europe.cryptonight-hub.miningpoolhub.com:12024    -u $WORKER -p $PASSWORD  -b 0.0.0.0:4068  >> /home/mirko/logs/ccminer.log 2>&1


done


#missin algo
#Yescrypt
#Sia
#Keccak
#Scrypt
