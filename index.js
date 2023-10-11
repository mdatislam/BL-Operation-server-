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
//https://backend.bloperation.com/
//https://blserver.bloperation.com/

//.htaccess file
/* IfModule mod_rewrite.c>

  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]

</IfModule> */

//https://bl-operation-server-production.up.railway.app
// npm install react-csv --save

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
  const token = authHeader.split(" ")[1];
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

    /* Collection Part Start */

    const userCollection = client.db("BL-Operation").collection("user");
    const pgRunDataCollection = client
      .db("BL-Operation")
      .collection("pgRunData");
    const fuelDataCollection = client.db("BL-Operation").collection("fuelData");
    const fuelDataOncallCollection = client
      .db("BL-Operation")
      .collection("fuelDataOncall");
    const EMDataCollection = client.db("BL-Operation").collection("EMData");
    const rectifierCollection = client
      .db("BL-Operation")
      .collection("rectifier");
    const dgServicingCollection = client
      .db("BL-Operation")
      .collection("dgService");
    const dgAllServicingCollection = client
      .db("BL-Operation")
      .collection("dgAllService");
    const dgRefuelingCollection = client
      .db("BL-Operation")
      .collection("dgRefueling");
    const dgAllRefuelingCollection = client
      .db("BL-Operation")
      .collection("dgAllRefueling");
    const dgUseMaterialCollection = client
      .db("BL-Operation")
      .collection("dgUseMaterial");
    const PgCollection = client.db("BL-Operation").collection("PgList");

    const siteDataCollection = client.db("BL-Operation").collection("siteData");
    const lubOilCollection = client
      .db("BL-Operation")
      .collection("LubOilRecord");

    const fcuFilterChangeAllRecord = client
      .db("BL-Operation")
      .collection("fcuFilterChangeAllRecord");
    const fcuFilterChangeLatestRecord = client
      .db("BL-Operation")
      .collection("fcuFilterChangeLatestRecord");
    const fcuFilterCollection = client
      .db("BL-Operation")
      .collection("fcuReceiveFilter");
    const vehicleCollection = client
      .db("BL-Operation")
      .collection("vehicleList");

    const siteIssueCollection = client
      .db("BL-Operation")
      .collection("siteIssues");

    /* Collection Part End */

    // get user info API & token issue API during login

    app.post('/jwt', async (req, res) => {
      console.log('jwt hit korese')
      const userEmail = await req.body
      //console.log(userInfo)
      const token = jwt.sign({
        email: userEmail,
      }, process.env.ACCESS_TOKEN, { expiresIn: "1hr" })
      res.send({ token: token })
    })

    // get user info API & token issue API when user create
    app.put("/user", async (req, res) => {
      const userUpdate = req.body;
      const email = userUpdate.email;
      //console.log(email)
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: userUpdate,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options)
      res.send(result);
    });

    // pgRunData update into data base API
    app.post("/pgRunData", verifyJWT, async (req, res) => {
      const pgData = req.body;
      //console.log(pgData)
      const result = await pgRunDataCollection.insertOne(pgData);
      res.send(result);
    });

    app.post("/fuelData", verifyJWT, async (req, res) => {
      const fuelData = req.body;
      // console.log(fuelData)
      const fuelSlipNo = fuelData.slipNo;
      const slipExist = await fuelDataCollection.findOne({
        slipNo: fuelSlipNo,
      });
      if (!slipExist) {
        const result = await fuelDataCollection.insertOne(fuelData);
        return res.send(result);
      } else {
        return res.send({ msg: "This Slip Already Used" });
      }
    });
    app.post("/fuelDataOncall", verifyJWT, async (req, res) => {
      const fuelData = req.body;
      //console.log(pgData)
      const fuelSlipNo = fuelData.slipNo;
      const slipExist = await fuelDataOncallCollection.findOne({
        slipNo: fuelSlipNo,
      });
      if (!slipExist) {
        const result = await fuelDataOncallCollection.insertOne(fuelData);
        return res.send(result);
      } else {
        return res.send({ msg: "This Slip Already Used" });
      }
    });
    app.get("/fuelList", verifyJWT, async (req, res) => {
      const email = req.query.email;
      //console.log(email)
      const filter = { fuelReceiverEmail: email };
      const result = await fuelDataCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });
    app.get("/fuelListAllOncall", verifyJWT, async (req, res) => {
      const result = await fuelDataOncallCollection
        .find({})
        .sort({ slipNo: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/onCall/fuelListAll", verifyJWT, async (req, res) => {
      const result = await fuelDataOncallCollection
        .find({})
        .sort({ date: 1, slipNo: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/fuelListAll", verifyJWT, async (req, res) => {
      const result = await fuelDataCollection
        .find({})
        .sort({ date: 1, })
        .toArray();
      res.send(result);
    });

    app.delete("/receivedFuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await fuelDataCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/onCall/receivedFuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await fuelDataOncallCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/pgRunAllList", verifyJWT, async (req, res) => {
      const email = req.query.email;
      //console.log(email)
      const filter = { pgRunnerEmail: email };
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/ApprovedAllPgRun", verifyJWT, async (req, res) => {
      const filter = { status: "Approved" };
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/PendingAllPgRun", verifyJWT, async (req, res) => {
      const filter = { status: "Pending" };
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });

    app.put("/pgRunList/:id", verifyJWT, async (req, res) => {
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

    app.get("/ApprovalList", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const filter = {
        onCallEmail: email,
        status: "Pending",
      };
      //console.log(filter)
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });

    app.get('/fuelBalance', verifyJWT, async (req, res) => {
      const pipeline = [
        {
          $addFields: {
            fuelConsume: { $toDouble: "$fuelConsume" },

          }
        },
        {
          $group: {
            _id: "$pgRunnerName",
            totalFuelConsume: { $sum: "$fuelConsume" }

          }
        },
        {
          $lookup: {
            from: "fuelData",
            localField: "_id",
            foreignField: "fuelReceiverName",
            as: "fuelBalanceInfo"
          }
        },
        {
          $unwind: "$fuelBalanceInfo"
        },
        {
          $addFields: {
            fuelReceived: { $toInt: "$fuelBalanceInfo.fuelQuantity" },

          }
        },
        {
          $group: {
            _id: "$_id",
            fuelConsume: { $avg: "$totalFuelConsume" },
            fuelQuantity: { $sum: "$fuelReceived" }
          }
        },
        {
          $project: {
            name: "$_id",
            fuelQuantity: 1,
            fuelConsume: { $round: ["$fuelConsume", 2] },

          }
        },

      ]

      const result = await pgRunDataCollection.aggregate(pipeline).toArray()
      res.send(result)
    })

    app.get("/receiveFuelOncall", async (req, res) => {

      const pipeline = [
        {
          $addFields: {
            receiveFuel: { $toInt: "$fuelQuantity" }
          }
        },
        {
          $group: {
            _id: "$fuelReceiverName",
            receiveOnCall: { $sum: "$receiveFuel" }
          }
        },
        {
          $project: {
            name: "$_id",
            receiveOnCall: 1,

          }
        }
      ]
      const receivedFuel = await fuelDataOncallCollection.aggregate(pipeline).toArray()
      res.send(receivedFuel)
    })

    app.get("/emInfo", verifyJWT, async (req, res) => {
      const result = await EMDataCollection.find({})
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });

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

    //For  DgService Part API from here

    app.get("/dgServiceInfo", verifyJWT, async (req, res) => {
      const result = await dgServicingCollection
        .find({})
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/dgServiceInfo/planSite/:target", async (req, res) => {
      const targetDate = req.params.target
      //console.log(targetDate)
      const result = await dgServicingCollection.find({ date: { $lt: targetDate } }).sort({ date: 1 }).toArray()
      res.send(result)
    })

    app.get("/dgAllServiceInfo", verifyJWT, async (req, res) => {
      const result = await dgAllServicingCollection
        .find({})
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });

    //For  Dg all Servicing collection api
    app.post("/dgAllServicing", verifyJWT, async (req, res) => {
      const servicing = req.body;
      const result = await dgAllServicingCollection.insertOne(servicing);
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

    //DG service record multi delete api

    app.delete("/dgServiceInfo/multiDelete", verifyJWT, async (req, res) => {
      const sites = req.body;
      //console.log(ids)
      const result = await dgServicingCollection.deleteMany({
        siteId: { $in: sites },
      });
      res.send(result);
    });

    //DG AllService record multi delete api

    app.delete("/dgAllServiceInfo/multiDelete", verifyJWT, async (req, res) => {
      const sites = req.body;
      //console.log(ids)
      const result = await dgAllServicingCollection.deleteMany({
        siteId: { $in: sites },
      });
      res.send(result);
    });

    //DG All ReFueling collection api
    app.get("/dgAllRefueling", verifyJWT, async (req, res) => {
      const result = await dgAllRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });
    //DG Last ReFueling collection api
    app.get("/dgRefuelingInfo", verifyJWT, async (req, res) => {
      const result = await dgRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    app.put("/dgRefuelingInfo/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await dgRefuelingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //For  Dg all ReFueling collection api
    app.post("/dgAllRefueling", verifyJWT, async (req, res) => {
      const refuel = req.body;
      //console.log(refuel)
      const result = await dgAllRefuelingCollection.insertOne(refuel);
      res.send(result);
    });

    //DG All ReFueling collection api
    app.get("/dgAllRefueling", verifyJWT, async (req, res) => {
      const result = await dgAllRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    app.put("/rectifier", verifyJWT, verifyJWT, async (req, res) => {
      const brandInfo = req.query.brand;
      //console.log(brandInfo)
      const rectifierInfo = req.body;
      // console.log(rectifierInfo)
      const filter = { brand: brandInfo };
      const options = { upsert: true };
      const updateDoc = {
        $set: rectifierInfo,
      };
      const result = await rectifierCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/rectifier/:brand", verifyJWT, async (req, res) => {
      const filter = { brand: req.params.brand }
      const result = await rectifierCollection.deleteOne(filter)
      res.send(result)
    })

    //For Use DG Material collection api
    app.post("/dgMaterialInfo", verifyJWT, async (req, res) => {
      const refuel = req.body;
      //console.log(refuel)
      const result = await dgUseMaterialCollection.insertOne(refuel);
      res.send(result);
    });

    app.get("/dgMaterialInfo", verifyJWT, async (req, res) => {
      const result = await dgUseMaterialCollection
        .find({})
        .sort({ date: 1 })
        .toArray();
      res.send(result);
    });
    app.get("/rectifier", verifyJWT, async (req, res) => {
      const result = await rectifierCollection.find({}).toArray();
      res.send(result);
    });

    app.delete("/pgRun/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await pgRunDataCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/user/admin/:email", async (req, res) => {
      const requesterEmail = req.params.email;
      const filter = { email: requesterEmail };
      const user = await userCollection.findOne(filter);
      const isAdmin = user.role === "Admin";
      //console.log(isAdmin)
      res.send({ admin: isAdmin });
    });

    app.put("/profileChange/:email", verifyJWT, async (req, res) => {
      const userEmail = req.params.email;
      const userProfile = req.body;
      const filter = { email: userEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: userProfile,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get("/userList", verifyJWT, async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/userList/users", async (req, res) => {
      const userEmail = req.query.email;
      //console.log(userEmail);
      const result = await userCollection.find({ email: userEmail }).toArray();
      res.send(result);
    });

    /* pg runner filter */
    app.get("/userList/pgRunner", verifyJWT, async (req, res) => {
      const result = await userCollection
        .find({ otherRole: "PG Runner" })
        .sort({ pgRunnerName: 1 })
        .toArray();
      res.send(result);
    });

    app.delete('/user/delete/:email', verifyJWT, async (req, res) => {
      const userEmail = req.params.email
      console.log(userEmail)
      const result = await userCollection.deleteOne({ email: userEmail })
      res.send(result)
    })

    /* PG collection section */

    app.get("/pgList", verifyJWT, async (req, res) => {
      const result = await PgCollection.find().sort({ pgNo: 1 }).toArray();
      res.send(result);
    });

    app.put("/pgList/:PgNo", verifyJWT, async (req, res) => {
      const pNo = req.params.PgNo;
      const updateInfo = req.body;
      //console.log(pNo)
      const filter = { pgNo: pNo };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await PgCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // siteData collection API

    app.put("/siteInfo/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await siteDataCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Site ID collection API
    app.get("/siteInfo", verifyJWT, async (req, res) => {
      const result = await siteDataCollection
        .find()
        .project({ siteId: 1 })
        .sort({ siteId: 1 })
        .toArray();
      res.send(result);
    });

    // Site info collection API
    app.get("/siteData", verifyJWT, async (req, res) => {
      //console.log(req.query.size)
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const sites = siteDataCollection.find({});
      const result = await sites
        .skip(page * size)
        .limit(size)
        .sort({ siteId: 1 })
        .toArray();
      const count = await siteDataCollection.estimatedDocumentCount();
      res.send({ result, count: count });
    });

    app.get("/searchSite", async (req, res) => {
      const query = req.query.site;
      //console.log(query)
      const result = await siteDataCollection.find({ siteId: query }).toArray();
      res.send(result);
    });

    // LubOil Receive Record API
    app.post("/lubOil", verifyJWT, async (req, res) => {
      const lubOilData = req.body;
      // console.log(lubOilData)
      const result = await lubOilCollection.insertOne(lubOilData);
      res.send(result);
    });

    app.get("/lubOil", async (req, res) => {
      const result = await lubOilCollection
        .find({})

        .toArray();
      res.send(result);
    });

    app.delete("/lubOilList/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(pgNo)
      const filter = { _id: ObjectId(id) };
      const result = await lubOilCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/pgList/:pgNo", verifyJWT, async (req, res) => {
      const pgNo = req.params.pgNo;
      //console.log(pgNo)
      const filter = { pgNo: pgNo };
      const result = await PgCollection.deleteOne(filter);
      res.send(result);
    });

    /* FCU Part start */

    app.get("/fcuFilterChangeLatestRecord", verifyJWT, async (req, res) => {
      const result = await fcuFilterChangeLatestRecord
        .find({})
        .sort({ latestFilterChangedate: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/fcuFilterChangeAllRecord", verifyJWT, async (req, res) => {
      const result = await fcuFilterChangeAllRecord
        .find({})
        .sort({ nextPlanDate: 1 })
        .toArray();
      res.send(result);
    });

    //For  FCU filter change all record collection api
    app.post("/fcuFilterChangeAllRecord", verifyJWT, async (req, res) => {
      const fcuFilter = req.body;
      const result = await fcuFilterChangeAllRecord.insertOne(fcuFilter);
      res.send(result);
    });
    //For  FCU filter change Latest record collection api
    app.put(
      "/fcuFilterChangeLatestRecord/:siteID",
      verifyJWT,
      async (req, res) => {
        const siteNo = req.params.siteID;
        //console.log(siteNo);
        const updateInfo = req.body;
        //console.log(updateInfo)
        const filter = { siteId: siteNo };
        const options = { upsert: true };
        const updateDoc = {
          $set: updateInfo,
        };
        const result = await fcuFilterChangeLatestRecord.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

    // FCU filter Receive Record API
    app.post("/fcuFilter", verifyJWT, async (req, res) => {
      const fcuFilterData = req.body;
      // console.log(fcuData)
      const result = await fcuFilterCollection.insertOne(fcuFilterData);
      res.send(result);
    });

    app.get("/fcuFilter", async (req, res) => {
      const result = await fcuFilterCollection.find().toArray();
      res.send(result);
    });

    app.delete("/fcuFilter/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(pgNo)
      const filter = { _id: ObjectId(id) };
      const result = await fcuFilterCollection.deleteOne(filter);
      res.send(result);
    });

    /* FCU Part End */

    /* Vehicle Api Start */
    app.put("/vehicle", async (req, res) => {
      const vehicleInfo = req.body
      const vehicleNo = vehicleInfo.vehicleNo
      const filter = { vehicleNo: vehicleNo }
      const options = { upsert: true }
      const updateDoc = {
        $set: vehicleInfo
      }
      const newVehicle = await vehicleCollection.updateOne(filter, updateDoc, options)
      res.send(newVehicle)
    })

    app.get("/vehicle", async (req, res) => {
      const result = await vehicleCollection.find({}).toArray()
      res.send(result)
    })

    app.delete("/vehicle/:vehicleNo", async (req, res) => {
      const filter = { vehicleNo: req.params.vehicleNo }
      const result = await vehicleCollection.deleteOne(filter)
      res.send(result)
    })

    /* Site Issue Part start */

    app.post("/siteIssues", async (req, res) => {
      const siteIssue = req.body
      const result = await siteIssueCollection.insertOne(siteIssue)
      res.send(result)
    })

    app.put("/siteIssues/:siteId", async (req, res) => {
      const feedback = req.body
      const siteCode = req.params.siteId
      const filter = { siteId: siteCode }
      //console.log(filter)
      const options = { upsert: true }
      const updateDoc = {
        $set: feedback
      }
      const result = await siteIssueCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.get("/siteIssues", async (req, res) => {
      const result = await siteIssueCollection.find({}).toArray()
      res.send(result)
    })

    app.get("/siteIssues/pending", async (req, res) => {
      const filter = { status: "pending" }
      const result = await siteIssueCollection.find(filter).toArray()
      res.send(result)
    })

    app.delete("/siteIssues/:id", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await siteIssueCollection.deleteOne(filter)
      res.send(result)
    })

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
