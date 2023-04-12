// var INFLUXDB_TOKEN="JK9gQH30px_47i4uiXKzi1h9mz5cGSQusAb9B1poeP7WSa7ccMXZT7wKS1xemxB6BUaiiSCFUDn29f77C75RPA=="
var INFLUXDB_TOKEN = "UzX1k65yoQI5A-ZPUNpXvAkUzweF2YzPJD9ufpI4_E9q06S64v52DNRsT4-kvO3UAMgVPefFCFkTfb0XAKjQ8Q=="

var cors = require('cors')
var express = require('express');
const https = require('https')

var { InfluxDB, Point } = require('@influxdata/influxdb-client')

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
   origin: '*'
}));

const token = INFLUXDB_TOKEN
const url = 'http://localhost:8086'
const org = `PCS`
const bucket = `BD`

const client = new InfluxDB({ url, token })



app.get('/', function (req, res) {
   res.send("Welcome to your SmartHome controller!");
});

app.post('/clearData', function (req, res) {
   var post_options = {
      host: 'localhost',
      port: '8086',
      path: "/api/v2/delete?org=PCS&bucket=DB",
      method: 'POST',
      headers: {
         'Authorization': 'Token ' + INFLUXDB_TOKEN,
         'Content-Type': 'application/json'
      },
      data: {
         "start": "2020-01-01T00:00:00Z",
         "stop": "2024-12-31T00:00:00Z"
      }
   };

   // Set up the request
   var post_req = https.request(post_options, function (dbRes) {
      dbRes.setEncoding('utf8');
      dbRes.on('data', function (chunk) {
         console.log('Response: ' + chunk);
         res.send(chunk)
      });
   });
});

app.post('/writeTemp', function (req, res) {
   let writeClient = client.getWriteApi(org, bucket, 'ns')

   let temp = req.body.temp
   let timestamp = String().concat(req.body.timestamp, "000000")

   try {
      let point = new Point('Temperatura')
         .floatField('Valor', temp)
         .timestamp(timestamp)

      writeClient.writePoint(point)

      writeClient.close().then(() => {
      })
      res.send("SUCCESS");
   }

   catch (err) {
      res.send(err.message);
   }
});

app.post('/writeHum', function (req, res) {
   let writeClient = client.getWriteApi(org, bucket, 'ns')

   let hum = req.body.hum
   let timestamp = String().concat(req.body.timestamp, "000000")

   try {
      let point = new Point('Umidade')
         .floatField('Valor', hum)
         .timestamp(timestamp)

      writeClient.writePoint(point)

      writeClient.close().then(() => {
      })
      res.send("SUCCESS");
   }

   catch (err) {
      res.send(err.message);
   }
});

app.get('/readTemp', function (req, res) {
   let queryClient = client.getQueryApi(org)
   fluxQuery = `from(bucket: "` + bucket + `")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "Temperatura")
      |> filter(fn: (r) => r["_field"] == "Valor")`;

   try {
      let queryData = []
      queryClient.queryRows(fluxQuery, {
         next: (row, tableMeta) => {
            queryData.push(tableMeta.toObject(row))
         },
         error: (error) => {
            console.error('\nError', error)
         },
         complete: () => {
            res.send(queryData);
         },
      })
   }

   catch (err) {
      res.send(err.message);
   }
});

app.get('/readHum', function (req, res) {
   let queryClient = client.getQueryApi(org)
   fluxQuery = `from(bucket: "` + bucket + `")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "Umidade")
      |> filter(fn: (r) => r["_field"] == "Valor")`;

   try {
      let queryData = []
      queryClient.queryRows(fluxQuery, {
         next: (row, tableMeta) => {
            queryData.push(tableMeta.toObject(row))
         },
         error: (error) => {
            console.error('\nError', error)
         },
         complete: () => {
            res.send(queryData);
         },
      })
   }

   catch (err) {
      res.send(err.message);
   }
});

app.listen(8000);