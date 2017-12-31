#!/bin/bash

/usr/local/bin/forever stop miningbot.js

/usr/local/bin/forever start  -w --watchDirectory /home/mirko/dev/miningtools/miningbot/ \
                 -a -o >(logger -t miningbot) -e >(logger -t miningbot) \
		/home/mirko/dev/miningtools/miningbot/miningbot.js

#/usr/local/bin/forever start  -w --watchDirectory /home/mirko/dev/miningtools/miningbot/ \
#                 -o /home/mirko/logs/miningbot.log \
#                 /home/mirko/dev/miningtools/miningbot/miningbot.js


