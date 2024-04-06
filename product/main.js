const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/product.proto'))
const productProto = grpc.loadPackageDefinition(packageDefinition);

const PRODUCTS = [
    {
        id: 101,
        productId: 1001,
        name: 'shirt',
        category: 'dress'
    },
    {
        id: 102,
        productId: 1002,
        name: 'pant',
        category: 'dress'
    },
    {
        id: 103,
        productId: 1003,
        name: 'biriyani',
        category: 'food'
    }
]

function findProduct(call, callback) {
    let product = PRODUCTS.find((product) => product.productId == call.request.id)
    console.log('camehere');
    if (product) {
        callback(null, product)
    } else {
        callback({
            message: 'product not found',
            code: grpc.status.INVALID_ARGUMENT
        })
    }
}

const server = new grpc.Server();
server.addService(productProto.Products.service, { find: findProduct })
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('product running');
});