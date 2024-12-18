const express = require('express');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const amqp = require('amqp');

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.json());

var channel, connection;

// Connect to MongoDB
mongoose.connect("mongodb://localhost/product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to product service database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

async function connect(){
    const amqpServer = 'amqp://localhost:5672';
    connection = amqp.connect(amqpServer);
    channel = connection.createChannel();
    await channel.asertQueue('PRODUCT');

}
connect();


// Start the server
app.listen(port, () => {
    console.log(`product-service running on port ${port}`);
});
