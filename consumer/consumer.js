// AMQ Streams - NodeJS Consumer - RHTE2018 version

// Requires express section
var express = require('express');
var app = express();


// Body parser section
var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Initialize Consumer section

var kafka = require('kafka-node');

var Consumer = kafka.Consumer
 
var APP_VERSION = "1.0.0-RHTE2018"
var APP_NAME = "AMQ-Streams-Consumer"

var KAFKA_BROKER_IP = process.env.KAFKA_BROKER_IP;
var kafkaConnectDescriptor = KAFKA_BROKER_IP;

var KafkaTopic = process.env.KAFKA_TOPIC;
 
console.log("Running Module " + APP_NAME + " version " + APP_VERSION);
 
function initializeKafkaConsumer(attempt) {
  try {
    console.log(`Try to initialize Kafka Client at ${kafkaConnectDescriptor} and Consumer, attempt ${attempt}`);
    const client = new kafka.KafkaClient({ kafkaHost: kafkaConnectDescriptor });
    console.log("created client");
    consumer = new Consumer(client,
        [{ topic: KafkaTopic, partition: 0, offset: 0}],
        {
            autoCommit: false
        }
    );

    console.log("submitted consumer creation request");
    consumer.on('ready', function () {
      console.log("Consumer is ready in " + APP_NAME);
    });
    consumer.on('message', function (message) {
        console.log(message);
    });
    consumer.on('offsetOutOfRange', function (err) {
        offset.fetch([KafkaTopic], function (err, offsets) {
          if (err) {
            return console.error(err);
          }
          var min = Math.min.apply(null, offsets[KafkaTopic][0]);
          consumer.setOffset(KafkaTopic, 0, min);
        });
    })
    consumer.on('error', function (err) {
      console.log("failed to create the client or the consumer " + JSON.stringify(err));
    })
  }
  catch (e) {
    console.log("Exception in initializeKafkaConsumer" + JSON.stringify(e));
    console.log("Try again in 5 seconds");
    setTimeout(initializeKafkaConsumer, 5000, ++attempt);
  }
}

initializeKafkaConsumer(1);


// Express section

app.get('/',function(req,res){
    res.json({greeting:'Kafka Consumer'})
});

app.get('/getMsg', function(req,res){
    
    var offset = req.query.offset;
    consumer.setOffset(KafkaTopic, 0, offset);
    consumer.on('message', function (message){
        if(!res.headersSent) { 
            res.writeHead(200, {"Content-Type": "application/json"}); }
        res.end(JSON.stringify(message));
    });
})

app.listen(5001,function(){
    console.log('Kafka consumer running at 5001');
})
