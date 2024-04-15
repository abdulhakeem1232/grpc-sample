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

app.post('/orders', (req, res) => {
    if (!req.body.productId) {
        res.status(400).send('Product identifier is not set');
        return;
    }
    const { productId, quantity } = req.body
    orderStub.PlaceOrder({ productId, quantity }, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(response);
        res.json(response);
    });
});

app.get('/orders/:id', (req, res) => {
    console.log('ll');
    console.log(req.params, 'srg');
    if (!req.params.id) {
        res.status(400).send('Order not found');
        return;
    }
    const id = req.params
    orderStub.findOrder({ id }, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(response);
    });
});
app.get('/products/:id', (req, res) => {
    console.log('ll');
    console.log(req.params, 'srg');
    if (!req.params.id) {
        res.status(400).send('Product not found');
        return;
    }
    const id = req.params
    productStub.Find({ id }, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(response);
    });
});
app.listen(restPort, () => {
    console.log(`RESTful API is listening on port ${restPort}`)
});