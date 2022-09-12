const express = require("express");

const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bzozooi.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("BL-Operation").collection("user");
    const pgRunDataCollection = client
      .db("BL-Operation")
      .collection("pgRunData");

    // get user info API & token issue API
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userUpdate = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: userUpdate,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        {
          email: email,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1h" }
      );
      res.send({ result, accessToken: token });
    });

    // pgRunData update into data base API
    app.post("/pgRunData", async (req, res) => {
      const pgData = req.body;
      //console.log(pgData)
      const result = await pgRunDataCollection.insertOne(pgData);
      res.send(result);
    });

    app.get("/pgRunAllList",async (req,res) => {
      const email = req.query.email;;
      //console.log(email)
      const filter = { pgRunnerEmail: email };
      const result = await pgRunDataCollection.find(filter).toArray();
      res.send(result);
    });

    app.put("/pgRunList/:id", async (req, res) => {
      const id = req.params.id;
      const approvalInfo = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: approvalInfo,
      };
      const result = await pgRunDataCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/ApprovalList", async (req, res) => {
      const email = req.query.email;
      const filter = {
        onCallEmail: email,
        status: "Pending",
      };
      //console.log(filter)
      const result = await pgRunDataCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/userList", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("we are tiger from Rangpur");
});

app.listen(port, () => {
  console.log(`BL Operation listening on port ${port}`);
});
