const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');

const packageDefinitionReci = protoLoader.
    loadSync(path.join(__dirname, '../protos/product.proto'));
const packageDefinitionProc = protoLoader.
    loadSync(path.join(__dirname, '../protos/order.proto'));
const productProto = grpc.loadPackageDefinition(packageDefinitionReci);
const orderProto = grpc.loadPackageDefinition(packageDefinitionProc);


const productStub = new productProto.Products('0.0.0.0:50051',
    grpc.credentials.createInsecure());
const orderStub = new orderProto.Orders('0.0.0.0:50052',
    grpc.credentials.createInsecure());


const app = express();
app.use(express.json());

const restPort = 5000;
let orders = {};

function processAsync(order) {
    productStub.find({ id: order.productId }, (err, product) => {
        if (err) return;

        orders[order.id].product = product;
        const call = orderStub.findOrder({
            orderId: order.id,
            productId: product.id
        });
        call.on('data', (statusUpdate) => {
            orders[order.id].status = statusUpdate.status;
        });
    });
}

app.post('/orders', (req, res) => {
    if (!req.body.productId) {
        res.status(400).send('Product identifier is not set');
        return;
    }
    let orderId = Object.keys(orders).length + 1;
    let order = {
        id: orderId,
        status: 0,
        productId: req.body.productId,
        createdAt: new Date().toLocaleString()
    };
    orders[order.id] = order;
    processAsync(order);
    res.send(order);
});

app.get('/orders/:id', (req, res) => {
    console.log('ll');
    if (!req.params.id || !orders[req.params.id]) {
        res.status(400).send('Order not found');
        return;
    }
    res.send(orders[req.params.id]);
});

app.listen(restPort, () => {
    console.log(`RESTful API is listening on port ${restPort}`)
});