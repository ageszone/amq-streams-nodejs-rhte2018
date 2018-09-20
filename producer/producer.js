// AMQ Streams - NodeJS Producer - RHTE2018 version

// Requires express section
var express = require('express');
var app = express();

// Body parser section
var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


// Initialize Producer section

var kafka = require('kafka-node');

var Producer = kafka.Producer
 
var APP_VERSION = "1.0.0-RHTE2018"
var APP_NAME = "AMQ-Streams-Producer"

var KAFKA_BROKER_IP = process.env.KAFKA_BROKER_IP;
var kafkaConnectDescriptor = KAFKA_BROKER_IP;
 
console.log("Running Module " + APP_NAME + " version " + APP_VERSION);
 
function initializeKafkaProducer(attempt) {
  try {
    console.log(`Try to initialize Kafka Client at ${kafkaConnectDescriptor} and Producer, attempt ${attempt}`);
    const client = new kafka.KafkaClient({ kafkaHost: kafkaConnectDescriptor });
    console.log("created client");
    producer = new Producer(client);
    console.log("submitted async producer creation request");
    producer.on('ready', function () {
      console.log("Producer is ready in " + APP_NAME);
    });
    producer.on('error', function (err) {
      console.log("failed to create the client or the producer " + JSON.stringify(err));
    })
  }
  catch (e) {
    console.log("Exception in initializeKafkaProducer" + JSON.stringify(e));
    console.log("Try again in 5 seconds");
    setTimeout(initializeKafkaProducer, 5000, ++attempt);
  }
}

initializeKafkaProducer(1);


// Express section

app.get('/',function(req,res){
    res.json({greeting:'Kafka Producer'})
});

app.post('/sendMsg',function(req,res){
    var sentMessage = JSON.stringify(req.body.message);
    payloads = [
        { topic: req.body.topic, messages:sentMessage , partition: 0 }
    ];
    producer.send(payloads, function (err, data) {

        if (err) {
            console.error("Failed to publish data to topic " + req.body.topic + " :" + JSON.stringify(err));
          }
          console.log("Published data to topic " + req.body.topic + " :" + JSON.stringify(data) + ",data: " + sentMessage);
          res.json(data);
    });
    
})

app.listen(5001,function(){
    console.log('Kafka producer running at 5001')
})