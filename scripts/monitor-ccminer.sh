#!/bin/bash

result=`echo 'summary' | netcat localhost 4068`

#echo "API result:" $result

khs=`echo $result | sed  -r 's/.*(;KHS=)([0-9]+).*/\2/'`

if [ $khs -gt 1000 ] && [ $khs -lt 300000 ] 
then
	echo `date` "; detected KHS:" $khs "; OK" 
else
	echo `date` "; detected KHS:" $khs "; KO"
fi

for GPU in {0..3}
do
  UTIL=`nvidia-smi -i $GPU --query-gpu=utilization.gpu --format=csv,noheader | cut -f1 -d" "`
  if (($UTIL < 50)); then
    GPUINFO=`nvidia-smi -i $GPU --query-gpu=index,name,utilization.gpu,temperature.gpu --format=csv,noheader`

    ### restart ccminer
    #systemctl restart ccmona
    #python3 /usr/bin/bootlace -m "Mona ccminer restarted. $GPUINFO was IDLE!" -T "MONA check" -t nope -u nope
    /home/mirko/scripts/telegram.sh "Attention: $GPUINFO is sick"

    # so that we don't restart the service more times the neccessary, force exit here
 
    #TODO: some magic with the whattomine JSON feed...
  fi
done
