const express = require('express')
const bodyParser = require('body-parser');
const compression = require('compression')
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

require('dotenv').config()

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(compression())

const port = process.env.PORT || 3001
console.log(process.env.DATABASEURL)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASEURL
});

let db = admin.firestore();
let a = db.collection('groups')

app.post('/data', async (req, res) => {
    let docRef = a.doc(req.body.name)
    await docRef.set({
        name: req.body.name,
        joiningLink: req.body.joiningLink,
        maxLimit: req.body.maxLimit,
        currentCount: req.body.currentCount,
        allow_more: req.body.allow_more
    });
    res.send('done');
})

app.post('/update', async (req, res) => {
    let docRef = a.doc(req.body.name)
    await docRef.update({
        currentCount: req.body.currentCount
    });
    res.send('done');
})

app.get('/display', async (req, res) => {
    const snapshot = await a.get();
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
})

app.listen(port, (req, res) => {
    console.info(`Running on ${port}`)
})