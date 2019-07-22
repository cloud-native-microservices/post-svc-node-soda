const oracledb = require('oracledb');
const uuidv4 = require('uuid/v4');

oracledb.outFormat = oracledb.OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.autoCommit = true;

module.exports = class PostService {

    constructor(){ }

    static async init() {
        console.log('Creating connection pool...')
        await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.CONNECT_STRING,
        });
        console.log('Connection pool created')
        return new PostService();
    }

    async getById(postId) {
        let connection, post, result;

        try {
            connection = await oracledb.getConnection();

            const soda = connection.getSodaDatabase();
            const postCollection = await soda.createCollection(process.env.POST_COLLECTION);
            post = await postCollection.find().key(postId).getOne();
            result = {
                id: post.key,
                createdOn: post.createdOn,
                lastModified: post.lastModified,
                document: post.getContent(),
            };

        }
        catch(err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async save(post) {
        let connection, newPost, result;

        try {
            connection = await oracledb.getConnection();
            const soda = connection.getSodaDatabase();
            const postCollection = await soda.createCollection(process.env.POST_COLLECTION);
            /*
                insertOneAndGet() does not return the doc
                for performance reasons
                see: http://oracle.github.io/node-oracledb/doc/api.html#sodacollinsertoneandget
            */
            newPost = await postCollection.insertOneAndGet(post);
            result = {
                id: newPost.key,
                createdOn: newPost.createdOn,
                lastModified: newPost.lastModified,
            };
        }
        catch(err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async update(id, post) {
        let connection, result;

        try {
            connection = await oracledb.getConnection();
            const soda = connection.getSodaDatabase();
            const postCollection = await soda.createCollection(process.env.POST_COLLECTION);
            post = await postCollection.find().key(id).replaceOneAndGet(post);
            result = {
                id: post.key,
                createdOn: post.createdOn,
                lastModified: post.lastModified,
            };
        }
        catch(err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async deleteById(postId) {
        let connection;
        let removed = false;

        try {
            connection = await oracledb.getConnection();

            const soda = connection.getSodaDatabase();
            const postCollection = await soda.createCollection(process.env.POST_COLLECTION);
            removed = await postCollection.find().key(postId).remove();

        }
        catch(err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                    console.error(err);
                }
            }
        }
        return removed;
    }

    async getByUserId(userId, offset, max) {
        let connection;
        const result = [];

        try {
            connection = await oracledb.getConnection();

            const soda = connection.getSodaDatabase();
            const postCollection = await soda.createCollection(process.env.POST_COLLECTION);
            let posts;
            let filter = {
                "$query": {"userId": userId},
                "$orderby": [
                    {
                        "path": "postedOn",
                        "order": "desc",
                    }
                ]
            };
            if( offset && max ) {
                posts = await postCollection.find().filter(filter).skip(+offset).limit(+max).getDocuments();
            }
            else {
                posts = await postCollection.find().filter(filter).getDocuments();
            }
            posts.forEach(function(element) {
                result.push( {
                    id: element.key,
                    createdOn: element.createdOn,
                    lastModified: element.lastModified,
                    document: element.getContent(),
                } );
            });
        }
        catch(err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                    console.error(err);
                }
            }
        }
        return result;
    }

    async closePool() {
        console.log('Closing connection pool...');
        try {
            await oracledb.getPool().close(10);
            console.log('Pool closed');
        } catch(err) {
            console.error(err);
        }
    }
}
