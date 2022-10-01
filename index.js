const express = require("express");

const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//https://enigmatic-eyrie-94440.herokuapp.com
// http://localhost:5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bzozooi.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader)
  if (!authHeader) {
 return res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
     if (err) {
       return res.status(403).send({ message: "access forbidden" });
     }
     req.decoded = decoded;
     next();
  });
}
async function run() {
  try {
    await client.connect();
    const userCollection = client.db("BL-Operation").collection("user");
    const pgRunDataCollection = client
      .db("BL-Operation")
      .collection("pgRunData");
       const fuelDataCollection = client
         .db("BL-Operation")
      .collection("fuelData");
     const EMDataCollection = client
       .db("BL-Operation")
      .collection("EMData");
    const rectifierCollection = client.db("BL-Operation").collection("rectifier");
     const dgServicingCollection = client
       .db("BL-Operation")
       .collection("dgService");
    

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
      const accessToken = jwt.sign(
        {
          email: email,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "3h" }
      );
      res.send({ result, accessToken: accessToken });
    });

    // pgRunData update into data base API
    app.post("/pgRunData", verifyJWT,async (req, res) => {
      const pgData = req.body;
      //console.log(pgData)
      const result = await pgRunDataCollection.insertOne(pgData);
      res.send(result);
    });

    app.post("/fuelData", verifyJWT,async (req, res) => {
      const fuelData = req.body;
      //console.log(pgData)
      const result = await fuelDataCollection.insertOne(fuelData);
      res.send(result);
    });

    app.get("/pgRunAllList",verifyJWT,async (req,res) => {
      const email = req.query.email;;
      //console.log(email)
      const filter = { pgRunnerEmail: email };
      const result = await pgRunDataCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/pgRunAll",verifyJWT,async (req,res) => {
      const filter ={status:"Approved"}
      const result = await pgRunDataCollection.find(filter).toArray();
      res.send(result);
    });


    app.get("/fuelList",verifyJWT, async (req,res) => {
      const email = req.query.email;
      //console.log(email)
      const filter = {fuelReceiverEmail: email };
      const result = await fuelDataCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/fuelListAll",verifyJWT, async (req,res) => {
      const result = await fuelDataCollection.find({}).toArray();
      res.send(result);
    });

    app.put("/pgRunList/:id",verifyJWT, async (req, res) => {
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

    app.get("/ApprovalList",verifyJWT, async (req, res) => {
      const email = req.query.email;
      const filter = {
        onCallEmail: email,
        status: "Pending",
      };
      //console.log(filter)
      const result = await pgRunDataCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/emInfo",verifyJWT, async (req, res) => {
      const result = await EMDataCollection.find({}).toArray()
      res.send(result)
    })

    app.put("/emInfo/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await EMDataCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

     app.get("/dgServiceInfo", verifyJWT, async (req, res) => {
       const result = await dgServicingCollection.find({}).toArray();
       res.send(result);
     });
    
     app.put("/dgServiceInfo/:siteID", verifyJWT, async (req, res) => {
       const siteNo = req.params.siteID;
       //console.log(siteNo);
       const updateInfo = req.body;
       //console.log(updateInfo)
       const filter = { siteId: siteNo };
       const options = { upsert: true };
       const updateDoc = {
         $set: updateInfo,
       };
       const result = await dgServicingCollection.updateOne(
         filter,
         updateDoc,
         options
       );
       res.send(result);
     });

    app.put("/rectifier", verifyJWT, async(req,res)=> {
      const brandInfo = req.query.brand
      //console.log(brandInfo)
      const rectifierInfo = req.body
     // console.log(rectifierInfo)
     const filter={brand:brandInfo}
     const options = { upsert: true };
       const updateDoc = {
         $set: rectifierInfo,
       };
       const result =await rectifierCollection.updateOne(
         filter,
         updateDoc,
         options
       );
      res.send(result)
    })
    
    

     app.get("/rectifier", verifyJWT, async (req, res) => {
      const result = await rectifierCollection.find({}).toArray()
      res.send(result)
    })

    app.delete("/pgRun/:id", verifyJWT, async (req, res) => {
      const id = req.params.id 
      //console.log(id)
      const filter = { _id: ObjectId(id) }
      const result = await pgRunDataCollection.deleteOne(filter)
      res.send(result)
    })

    app.delete("/receivedFuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id 
      //console.log(id)
      const filter = { _id: ObjectId(id) }
      const result = await fuelDataCollection.deleteOne(filter)
      res.send(result)
    })

    app.get("/user/admin/:email", async (req, res) => {
      const requesterEmail = req.params.email 
      const filter = { email: requesterEmail }
      const user = await userCollection.findOne(filter)
      const isAdmin = user.role === "Admin"
      res.send({admin:isAdmin})
    })

    app.get("/userList",verifyJWT, async (req, res) => {
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
