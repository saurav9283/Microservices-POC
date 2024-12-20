const express = require('express');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const amqp = require('amqplib');
const Product = require('./model/Product');
const isAuthenticated = require('../isAuth');

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.json());

var channel, connection;
var order;

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

async function connect() {
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('PRODUCT');
}
connect();

//Create a new product 
//Buy a product
app.post('/product/create', isAuthenticated, async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const newProduct = new Product({
            name, description, price
        })
        newProduct.save();
        return res.json(newProduct);
    } catch (error) {
        console.log(error)

    }
});

// User send list of product id to buy
// creating an order for the product and total value of sun of product's price

app.post('/product/buy', isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    // console.log('ids: ', ids);
    const products = await Product.find({ _id: { $in: ids } });
    // console.log('products: ', products);
    channel.sendToQueue('ORDER', Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email
    })));

    channel.consume("PRODUCT", (data) => {
        console.log("consuming product service", data.content.toString());
        order = JSON.parse(data.content);
        channel.ack(data);
    });
    return res.json(order);


});

// Start the server
app.listen(port, () => {
    console.log(`product-service running on port ${port}`);
});
