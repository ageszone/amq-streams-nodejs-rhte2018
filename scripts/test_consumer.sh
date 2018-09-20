#!/bin/bash
# OpenShift Kafka consumer
 oc run kafka-consumer -ti -n $1 --image=strimzi/kafka:latest --restart=Never \-- bin/kafka-console-consumer.sh --bootstrap-server $2:9092 --topic $3 --from-beginning