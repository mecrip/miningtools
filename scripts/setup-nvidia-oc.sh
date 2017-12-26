#run as user
#CLOCK 300 => instacrash
#clock 200 => miner crash in some time

#settings for LYRA - 153Mh/s - 430W
CLOCK_1070=150
MEM_1070=400

CLOCK_1080=125
MEM_1080=400

PL_1070_0=100
PL_1070_1=100
PL_1080=120

FAN_1070=0 #0 auto, 1 manual
FANSPEED_1070=80


#settings for NEOSCRYPT
#stable settings for neoscrypt = 1950h@120W
#CLOCK=175
#MEM=-600
#PL=110

#settings for equihash
#CLOCK=250
#MEM=-250
#PL=120

sleep 45

export DISPLAY=:0

#set persisten mode
sudo nvidia-smi -pm 1

#shutdown led
nvidia-settings --assign GPULogoBrightness=0


#set power level
sudo nvidia-smi -i 0 -pl $PL_1070_0
sudo nvidia-smi -i 1 -pl $PL_1070_1
sudo nvidia-smi -i 2 -pl $PL_1080
sudo nvidia-smi -i 3 -pl $PL_1080
sleep 5

#set status
nvidia-settings -c :0 -a [gpu:0]/GPUPowerMizerMode=1
nvidia-settings -c :0 -a [gpu:1]/GPUPowerMizerMode=1
nvidia-settings -c :0 -a [gpu:2]/GPUPowerMizerMode=1
nvidia-settings -c :0 -a [gpu:3]/GPUPowerMizerMode=1

#set clock
nvidia-settings -a [gpu:0]/GPUGraphicsClockOffset[2]=$CLOCK_1070
nvidia-settings -a [gpu:0]/GPUGraphicsClockOffset[3]=$CLOCK_1070

nvidia-settings -a [gpu:1]/GPUGraphicsClockOffset[2]=$CLOCK_1070
nvidia-settings -a [gpu:1]/GPUGraphicsClockOffset[3]=$CLOCK_1070

nvidia-settings -a [gpu:2]/GPUGraphicsClockOffset[2]=$CLOCK_1080
nvidia-settings -a [gpu:2]/GPUGraphicsClockOffset[3]=$CLOCK_1080

nvidia-settings -a [gpu:3]/GPUGraphicsClockOffset[2]=$CLOCK_1080
nvidia-settings -a [gpu:3]/GPUGraphicsClockOffset[3]=$CLOCK_1080

#set mem
nvidia-settings -a [gpu:0]/GPUMemoryTransferRateOffset[2]=$MEM_1070
nvidia-settings -a [gpu:0]/GPUMemoryTransferRateOffset[3]=$MEM_1070

nvidia-settings -a [gpu:1]/GPUMemoryTransferRateOffset[2]=$MEM_1070
nvidia-settings -a [gpu:1]/GPUMemoryTransferRateOffset[3]=$MEM_1070

nvidia-settings -a [gpu:2]/GPUMemoryTransferRateOffset[2]=$MEM_1080
nvidia-settings -a [gpu:2]/GPUMemoryTransferRateOffset[3]=$MEM_1080

nvidia-settings -a [gpu:3]/GPUMemoryTransferRateOffset[2]=$MEM_1080
nvidia-settings -a [gpu:3]/GPUMemoryTransferRateOffset[3]=$MEM_1080


#set fan
nvidia-settings -a [gpu:0]/GPUFanControlState=$FAN_1070
nvidia-settings -a [fan:0]/GPUTargetFanSpeed=$FANSPEED_1070

nvidia-settings -a [gpu:1]/GPUFanControlState=$FAN_1070
nvidia-settings -a [fan:1]/GPUTargetFanSpeed=$FANSPEED_1070


#start report screen
#screen -dmS
#
#nvidia nvidia-smi --query-gpu=timestamp,name,gpu_bus_id,utilization.gpu,power.draw,temperature.gpu,fan.speed,clocks.mem,clocks.gr \
#		 --format=csv -l \
#		>> /home/mirko/logs/nvidia.log 2>&1


