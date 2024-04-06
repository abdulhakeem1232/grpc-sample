const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/order.proto'))
const orderProto = grpc.loadPackageDefinition(packageDefinition);

function process(call) {
    console.log('kkkvannu00');
    let orderRequest = call.request;
    let time = orderRequest.orderId * 1000 + orderRequest.productId * 10;
    console.log('kkkvannu');
    call.write({ status: 2 });
    setTimeout(() => {
        call.write({ status: 3 });
        setTimeout(() => {
            call.write({ status: 4 });
            call.end();
        }, time);
    }, time);
}

const server = new grpc.Server();
server.addService(orderProto.Orders.service, { process: process });
server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('order running');
});