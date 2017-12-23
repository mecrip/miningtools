#!/bin/bash

#script to monitor nvidia status and log

#nvidia 
nvidia-smi \
        --query-gpu=timestamp,name,gpu_bus_id,utilization.gpu,power.draw,temperature.gpu,fan.speed,clocks.mem,clocks.gr \
        --format=csv \
        >> /home/mirko/logs/nvidia.log 2>&1


