const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");


require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache");
  next();
});

const {
  getMemory,
  setMemory,
  setMemoryArray,
  triggerLastUpdated,
  isMemoryEmpty,
  clearMemory,
} = require("./memory");

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

app.get("/memoryUpdate", async (req, res) => {
  try {
    const groupData = await groups.get();
    let groupList = [];
    clearMemory();
    groupData.forEach((doc) => {
      const obj = doc.data();
      groupList.push(obj);
    });
    setMemoryArray(groupList);
    triggerLastUpdated();
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
});

/** to get the whatsapp link */
app.get("/getLink", async (req, res) => {
  /** if memory is empty, then call database */
  if (isMemoryEmpty()) {
    try {
      const groupData = await groups.get();
      let groupList = [];
      clearMemory();
      groupData.forEach((doc) => {
        const obj = doc.data();
        groupList.push(obj);
      });
      setMemoryArray(groupList);
      console.log("memory was empty, fetched new values : ", getMemory());
    } catch (e) {
      return res.json({ success: false, step: 92, error: e.message });
    }
  }

  const groupList = getMemory();
  console.log("listing all groups", groupList);

  /** If last group is half filled send a mail to the admin */
  try {
    const lastGroup = groupList[groupList.length - 1]
    if (lastGroup.currentCount > 150) {
      //send mail
    }
  }
  catch (e) {
    return res.json({ success: false, step: 105, error: e.message });
  }

  /** loop over the array to find vacant groups */
  groupList.forEach(async ({ maxLimit, currentCount, allow_more, joiningLink, name }, i) => {
    if (allow_more) {
      currentCount += 5;
      if (currentCount >= maxLimit)
        allow_more = false;
      try {
        const docRef = groups.doc(name);
        await docRef.update({
          currentCount: currentCount,
          allow_more: allow_more
        });
      } catch (e) {
        return res.json({ success: false, step: 116, error: e.message });
      }
      setMemory(i, { "maxLimit": maxLimit, "currentCount": currentCount, "allow_more": allow_more, "joiningLink": joiningLink, "name": name });
      return res.json({ success: true, data: { link: joiningLink } })
    }
    else
      return res.json({ success: false, error: "All groups are full" })
  })
})

app.listen(port, () => {
  console.info(`Running on ${port}`);
});
