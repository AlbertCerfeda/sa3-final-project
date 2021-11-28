/**
 * Web Atelier 2021  Final Project
 *
 * MongoDB Database
 *
 * The database contains 2 collections:
 *
 *       USERS
 *       { 
 *           {ObjectId} _id, 
 *           {string}   username, 
 *           {string}   password,
 *           {string}   email,
 *           {boolean}  email_verification_status
 *       }
 *
 *
 *       DOCS
 *       {
 *           {String} name,
 *           {ObjectId} _id, 
 *           {URL} path, 
 *           perm_read: [],
 *     	     perm_edit: [],
 *           {ObjectId} owner, 
 *       
 *           {URL} read_link, 
 *           {URL} edit-link, 
 *       
 *           {Date} edit_date, 
 *           {Date} created_date 
 *       }
 *
 */


const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

/**
 * Fetches the database and the collections.
 */

///// PARAMETERS
const mongodb_uri = "mongodb://localhost:27017"
const db_name     = "DoX_db";
const collections = ["users","docs"];
////////////////////


const model = {}
MongoClient
    .connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
        model.db = client.db(db_name);
        collections.forEach(k => {
            model[k] = model.db.collection(k)
        })
        console.log("[+] Fetched MongoDB database and collections")
        // require('./sync').check(model.music, "public/music").then(console.log);
    })

exports.model = model