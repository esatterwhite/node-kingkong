#!/usr/bin/env bash

set -e

printenv | grep CASS \
&& echo "Waiting for cassandra on $CASSANDRA_HOSTNAME:$CASSANDRA_PORT..." \
&& while ! tcping -q -t 120 $CASSANDRA_HOSTNAME $CASSANDRA_PORT; do sleep 0.5; done\
&& echo "Cassandra is ready! Launching Kong..." \
&& kong start
