/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const admin = require("firebase-admin");
const passport = require("passport");
const cors = require("cors");
const nodemailer = require("nodemailer");
const serviceAccountObject = require("./src/firebase");
const { verifyToken } = require("./src/middleware/auth");
require("dotenv").config();

const emails = require("./src/services/sendemailsto");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const mailOptions = {
  from: 'noreply.acmvit@gmail.com', // sender address
  to: emails, // list of receivers
  subject: "Whatsapp groups ACM-CONNECT-VIT", // Subject line
  text: `Hello, all the groups for acm-connect is about to fill, please add new groups!`, // plain text body
};


// Passport config
require("./src/auth/passport")(passport);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache");
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use("/auth", require("./src/auth/auth"));

const {
  getMemory,
  setMemory,
  setMemoryArray,
  triggerLastUpdated,
  isMemoryEmpty,
  clearMemory,
} = require("./src/services/memory");

const port = process.env.PORT || 3001;
console.log(serviceAccountObject);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountObject),
  databaseURL: process.env.DATABASEURL,
});

const database = admin.firestore();
const groups = database.collection("groups");

app.post("/data", verifyToken, async (req, res) => {
  const docRef = groups.doc(req.body.name);
  await docRef.set({
    name: req.body.name,
    joiningLink: req.body.joiningLink,
    maxLimit: req.body.maxLimit,
    currentCount: req.body.currentCount,
    allowMore: req.body.allowMore,
  });
  res.json({ Message: "Action Completed" });
});

app.post("/update", verifyToken, async (req, res) => {
  const docRef = groups.doc(req.body.name);
  await docRef.update({
    joiningLink: req.body.joiningLink,
    maxLimit: req.body.maxLimit,
    currentCount: req.body.currentCount,
    allowMore: req.body.allowMore
  });
  res.json({ Message: "Action Completed" });
});

app.post("/delete", verifyToken, async (req, res) => {
  const docRef = groups.doc(req.body.name);
  await docRef.delete();
  res.json({ Message: "Action Completed" });
});

app.get("/display", verifyToken, async (req, res) => {
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
    const groupList = [];
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
  if (isMemoryEmpty()) {
    /** check if memory is empty and fetch data from database and set it in memory */
    try {
      const groupData = await groups.get();
      const groupList = [];
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
    const lastGroup = groupList[groupList.length - 1];
    if (lastGroup.currentCount > lastGroup.maxLimit / 2) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        return console.log("Message sent: %s", info.messageId);
      });
    }
  } catch (e) {
    return res.json({ success: false, step: 105, error: e.message });
  }

  /** loop over the array to find vacant groups */
  for (let i = 0; i < groupList.length; i += 1) {
    const group = groupList[i];
    const { name, joiningLink, maxLimit } = group;
    let { currentCount, allowMore } = group;

    if (allowMore) {
      currentCount += 1;

      if (currentCount >= maxLimit) {
        allowMore = false;
      }

      try {
        const docRef = groups.doc(name);
        await docRef.update({
          currentCount: currentCount,
          allowMore: allowMore,
        });
      } catch (e) {
        return res.json({ success: false, step: 116, error: e.message });
      }

      setMemory(i, {
        name,
        maxLimit,
        joiningLink,
        currentCount,
        allowMore,
      });
      return res.status(302).redirect(joiningLink);
    }
  }
  return res.json({ success: false, error: "All groups are full" });
});

app.listen(port, () => {
  console.info(`Running on ${port}`);
});
