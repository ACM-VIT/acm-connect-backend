const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

const port = process.env.PORT || 3001;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL,
});

const database = admin.firestore();
const groups = database.collection("groups");

app.post("/data", async (req, res) => {
  const docRef = groups.doc(req.body.name);
  await docRef.set({
    name: req.body.name,
    joiningLink: req.body.joiningLink,
    maxLimit: req.body.maxLimit,
    currentCount: req.body.currentCount,
    allow_more: req.body.allow_more,
  });
  res.json({ Message: "Action Completed" });
});

app.post("/update", async (req, res) => {
  const docRef = groups.doc(req.body.name);
  await docRef.update({
    currentCount: req.body.currentCount,
  });
  res.json({ Message: "Action Completed" });
});

app.get("/display", async (req, res) => {
  const groupData = await groups.get();
  const data = [];
  groupData.forEach((doc) => {
    const obj = doc.data();
    obj.id = doc.id;
    data.push(obj);
  });
  res.json({ arr: data });
});

app.listen(port, () => {
  console.info(`Running on ${port}`);
});
