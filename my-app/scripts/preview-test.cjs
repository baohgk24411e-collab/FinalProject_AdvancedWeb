// Disposable UI test database; never connects to application data.
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const express = require('express');
const fs = require('fs'), path = require('path');
const { createApp } = require('../api/app');
const { prepareDatabase } = require('../api/lib/database');
const { hashPassword } = require('../api/lib/security');
(async () => {
 const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
 const client = await new MongoClient(replica.getUri()).connect(), db = client.db('ui_test_only');
 await prepareDatabase(db);
 for(const [file,key,col] of [['products','MOCK_PRODUCTS','Products'],['categories','MOCK_CATEGORIES','Categories']]) {
  const w={};new Function('window',fs.readFileSync(path.join(__dirname,'../../my-server-mongodb/data/'+file+'.js'),'utf8'))(w);
  await db.collection(col).insertMany(w[key]);
 }
 for(const [id,isAdmin] of [['admin',true],['customer',false]]) await db.collection('Users').insertOne({id,email:id+'@test.local',name:'UI Test '+id,isAdmin,passwordHash:await hashPassword('Preview-test-123'),wishlist:[]});
 const app=createApp(async()=>({client,db})), dist=path.resolve(__dirname,'../dist/my-app');
 app.use(express.static(dist));app.get('/{*path}',(req,res)=>res.sendFile(path.join(dist,'index.html')));
 const server=app.listen(4300,'127.0.0.1',()=>console.log('Disposable preview http://127.0.0.1:4300'));
 async function stop(){server.close();await client.close();await replica.stop();process.exit(0);}
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
})().catch(e=>{console.error(e);process.exit(1)});
