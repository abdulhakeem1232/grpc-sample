const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/order.proto'));
const orderProto = grpc.loadPackageDefinition(packageDefinition);

const productProtoDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/product.proto'));
const productProto = grpc.loadPackageDefinition(productProtoDefinition);
const productClient = new productProto.Products('localhost:50051', grpc.credentials.createInsecure());


let orders = [];

function getProduct(productId, callback) {
    productClient.Find({ id: productId }, (err, response) => {
        if (err) {
            console.error('Error fetching product:', err);
            callback(err, null);
            return;
        }
        const productName = response.name;
        callback(null, productName);
    });
}

function findOrder(call, callback) {
    console.log('findOrder method invoked');
    const orderId = call.request.orderId;
    const order = orders.find(o => o.id === orderId);
    if (order) {
        callback(null, order);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Order not found"
        });
    }
}

function placeOrder(call, callback) {
    console.log('placeOrder method invoked');
    const { productId, quantity } = call.request;
    console.log(call.request);
    getProduct(productId, (err, productName) => {
        if (err) {
            callback(err, null);
            return;
        }
        console.log(productName, 'pn');
        const order = { orderId: orders.length + 1, productId, productName, quantity };
        orders.push(order);
        console.log('ore', orders);
        callback(null, order);
    });
}

const server = new grpc.Server();
server.addService(orderProto.Orders.service, {
    findOrder: findOrder,
    placeOrder: placeOrder
});

const port = '0.0.0.0:50052';
server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server is running on ${port}`);
    server.start();
});
