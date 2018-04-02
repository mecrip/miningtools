#!/bin/bash

WORKER='3QHxMeDRwi4LPMVe13Dy7uqKbL9c857oWo.Sneezy'
PASSWORD='x'
CCPARAMS=" -b 0.0.0.0:4068  --intensity=22 >> /home/mirko/logs/ccminer.log 2>&1"
MINER=""
MAXTEMP=81

sleep 60

while true; do


    MINER=' miner:dstm algo:equihash '
    echo `date` $MINER >> /home/mirko/logs/currentminer.log
    /home/mirko/miner/dstm/current/zm --server equihash.eu.nicehash.com --port 3357 --user $WORKER --pass $PASSWORD  --telemetry=0.0.0.0:2222 --temp-target $MAXTEMP >>  /home/mirko/logs/ccminer.log 2>&1

    sleep 10

done

