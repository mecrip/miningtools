<html>
<head>
    <title>Sneezy Mining status</title>
    <meta http-equiv="refresh" content="30" >

    </head>
    <body>
<?php

$host="10.13.75.252";
$reboot="http://$host/reboot";
$CurrentMiner = "/home/mirko/logs/currentminer.log";
$MinerLog="/home/mirko/logs/ccminer.log";
$NvidiaLog="/home/mirko/logs/nvidia.log";
    
$now = new DateTime();    
echo "<p>lodaded: ";echo $now->format('Y-m-d H:i:s'); echo "</p>";
        
echo "<H1>current mining:</H1>";
$output = shell_exec("tail -n1  $CurrentMiner"); //exec removed
echo "<P>$output</P>";
        
        
if(stripos($output, 'dstm')) {
    echo "<p><a href='http://$host:2222'>miner console</a></p>";
  }      
        

if(stripos($output, 'ccminer')) {
    echo "<p><a href='ccminer/'>miner console</a></p>";
  }       


echo "<H1>last output:</H1>";
$output = shell_exec("tail -n20  $MinerLog"); //exec removed
echo "<pre>$output</pre>";

echo "<H1>nvidia status:</H1>";
$output = shell_exec("nvidia-smi"); //exec removed
echo "<pre>$output</pre>";

$output = shell_exec("tail -n20  $NvidiaLog"); //exec removed
echo "<pre>$output</pre>";
        
echo "<h1> Maintenance </h1>";
#echo "<a href='$reboot'> Maintenance </a>";
?>
        
    </body></html>
