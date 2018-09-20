#!/bin/bash
# OpenShift Kafka producer
oc run kafka-producer -ti -n $1 --image=strimzi/kafka:latest --restart=Never \-- bin/kafka-console-producer.sh --broker-list $2:9092 --topic $3 