const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

module.exports = class ObjectService{

    constructor(config) {

        // update the client config
        AWS.config.update({
            region: config.storageRegion,
            credentials: new AWS.Credentials(config.accessToken, config.secretKey),
            s3ForcePathStyle: true,
        });
        // set the Object Storage endpoint
        AWS.config.s3 = { endpoint: `${config.storageUrl}` };

        this.s3 = new AWS.S3({
            params: { Bucket: config.storageBucket }
        });
    }

    async upload(object, mime) {
        return await this.s3.upload({
            Key: uuidv4(),
            Body: object,
            ContentType: mime,
        }).promise();
    }

}