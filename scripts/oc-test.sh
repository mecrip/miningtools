#opt settings for eth
CLOCK=150
MEM=500
PL_1070=100	
PL_1080=120


#opt settings for neoscrypt = 1950h@110W
#CLOCK=150
#MEM=-500
#PL_1070=100
#PL_1080=120
FAN=0 #0 auto, 1 manual
FANSPEED=75

#opt settings for neoscrypt = 1950h@110W
#CLOCK=175
#MEM=-600
#PL=110
#FAN=0 #0 auto, 1 manual
#FANSPEED=75


export DISPLAY=:0

#set power level
sudo nvidia-smi -i 0 -pl $PL_1070
sudo nvidia-smi -i 1 -pl $PL_1070
sudo nvidia-smi -i 2 -pl $PL_1080
sudo nvidia-smi -i 3 -pl $PL_1080


#set status
nvidia-settings -c :0 -a [gpu:0]/GPUPowerMizerMode=1
nvidia-settings -c :0 -a [gpu:1]/GPUPowerMizerMode=1

#set clock
nvidia-settings -a [gpu:0]/GPUGraphicsClockOffset[2]=$CLOCK
nvidia-settings -a [gpu:0]/GPUGraphicsClockOffset[3]=$CLOCK

nvidia-settings -a [gpu:1]/GPUGraphicsClockOffset[2]=$CLOCK
nvidia-settings -a [gpu:1]/GPUGraphicsClockOffset[3]=$CLOCK

nvidia-settings -a [gpu:2]/GPUGraphicsClockOffset[2]=$CLOCK
nvidia-settings -a [gpu:2]/GPUGraphicsClockOffset[3]=$CLOCK

nvidia-settings -a [gpu:3]/GPUGraphicsClockOffset[2]=$CLOCK
nvidia-settings -a [gpu:3]/GPUGraphicsClockOffset[3]=$CLOCK

#set mem
nvidia-settings -a [gpu:0]/GPUMemoryTransferRateOffset[2]=$MEM
nvidia-settings -a [gpu:0]/GPUMemoryTransferRateOffset[3]=$MEM

nvidia-settings -a [gpu:1]/GPUMemoryTransferRateOffset[2]=$MEM
nvidia-settings -a [gpu:1]/GPUMemoryTransferRateOffset[3]=$MEM

nvidia-settings -a [gpu:2]/GPUMemoryTransferRateOffset[2]=$MEM
nvidia-settings -a [gpu:2]/GPUMemoryTransferRateOffset[3]=$MEM

nvidia-settings -a [gpu:3]/GPUMemoryTransferRateOffset[2]=$MEM
nvidia-settings -a [gpu:3]/GPUMemoryTransferRateOffset[3]=$MEM


#set fan
nvidia-settings -a [gpu:0]/GPUFanControlState=$FAN
nvidia-settings -a [fan:0]/GPUTargetFanSpeed=$FANSPEED

nvidia-settings -a [gpu:1]/GPUFanControlState=$FAN
nvidia-settings -a [fan:1]/GPUTargetFanSpeed=$FANSPEED
