const express = require("express");

const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bzozooi.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("BL-Operation").collection("user");
    const serviceCollection = client.db("BL-Operation").collection("service");

    app.get("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    // get user info API
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
  } finally {
  }
}
run().catch(console.dir);

/* client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
    console.log('cccc')
  client.close();
}); */

app.get("/", (req, res) => {
  res.send("we are tiger from Rangpur");
});

app.listen(port, () => {
  console.log(`BL Operation listening on port ${port}`);
});
