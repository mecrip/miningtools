#!/bin/bash

/home/mirko/scripts/setup-nvidia-oc.sh &

/home/mirko/scripts/miningbot.sh &

sleep 30

/home/mirko/scripts/miner.sh &
