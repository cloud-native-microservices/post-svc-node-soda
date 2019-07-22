const config = {};
config.storageBucket = process.env.BUCKET;
config.accessToken = process.env.ACCESS_TOKEN;
config.secretKey = process.env.SECRET_KEY;
config.storageRegion = process.env.REGION || "us-phoenix-1";
config.storageTenancy = process.env.STORAGE_TENANCY;
config.storageUrl = `${config.storageTenancy}.compat.objectstorage.${config.storageRegion}.oraclecloud.com`;

module.exports = config;