var INFLUXDB_TOKEN="JK9gQH30px_47i4uiXKzi1h9mz5cGSQusAb9B1poeP7WSa7ccMXZT7wKS1xemxB6BUaiiSCFUDn29f77C75RPA=="

var cors = require('cors')
var express = require('express');

var {InfluxDB, Point} = require('@influxdata/influxdb-client')

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cors({
   origin: '*'
}));

const token = INFLUXDB_TOKEN
const url = 'http://localhost:8086'
const org = `PCS`
const bucket = `BD`

const client = new InfluxDB({url, token})



app.get('/', function(req, res){
   res.send("Hello world!");
});

app.post('/writeTemp', function(req, res){
   let writeClient = client.getWriteApi(org, bucket, 'ns')

   let temp = req.body.temp
   let timestamp = String().concat(req.body.timestamp, "000000")
   
   let point = new Point('Temperatura')
               .floatField('Valor', temp)
               .timestamp(timestamp)

   writeClient.writePoint(point)

   writeClient.close().then(() => {
    })
   res.send("SUCCESS");
});

app.listen(8000);