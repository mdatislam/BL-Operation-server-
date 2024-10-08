require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { group } = require("console");
const { pipeline } = require("stream");
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



// const corsOptions = {
//   origin: 'https://bl-operation.web.app',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: 'Content-Type,Authorization',
// }; 



//https://bl-operation-server-8udwslvjt-mdatislam.vercel.app
//https://backend.bloperation.com
// https://serverom.bl-operation.com/

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

const run = async () => {

  try {
    await client.connect();

    console.log("The mongodb connect");

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
    const powerShutDownCollection = client
      .db("BL-Operation")
      .collection("powerShutDown");
    const NewAddSpareCollection = client
      .db("BL-Operation")
      .collection("NewAddSpare");
    const OwnSpareCollection = client
      .db("BL-Operation")
      .collection("OwnSpare");
    const returnSpareCollection = client
      .db("BL-Operation")
      .collection("returnSpare");
    const spareListCollection = client
      .db("BL-Operation")
      .collection("spareList");

    /* Collection Part End */

    // get user info API & token issue API during login

    app.post('/jwt', async (req, res) => {
      //console.log('jwt hit korese')
      const userEmail = await req.body
      //console.log(userInfo)
      const token = jwt.sign({
        email: userEmail,
      }, process.env.ACCESS_TOKEN, { expiresIn: "1hr" })
      res.json({ token: token })
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
      res.json(result);
    });

    // pgRunData update into data base API
    app.post("/pgRunData", verifyJWT, async (req, res) => {
      const pgData = req.body;
      //console.log(pgData)
      const result = await pgRunDataCollection.insertOne(pgData);
      res.json(result);
    });

    app.put("/pgRunData/:id", verifyJWT, async (req, res) => {
      const Id = req.params.id;
      //console.log(Id)
      const pgRunDataInfo = req.body;
      const filter = { _id: new ObjectId(Id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: pgRunDataInfo,
      };
      const result = await pgRunDataCollection.updateOne(filter, updateDoc, options)
      res.json(result);

    })

    app.post("/fuelData", verifyJWT, async (req, res) => {
      const fuelData = req.body;
      // console.log(fuelData)
      const fuelSlipNo = fuelData.slipNo;
      const slipExist = await fuelDataCollection.findOne({
        slipNo: fuelSlipNo,
      });
      if (!slipExist) {
        const result = await fuelDataCollection.insertOne(fuelData);
        return res.json(result);
      } else {
        return res.json({ msg: "This Slip Already Used" });
      }
    });
    app.post("/fuelDataOncall", verifyJWT, async (req, res) => {
      const fuelData = req.body;
      //console.log(fuelData)
      const fuelSlipNo = fuelData.slipNo;
      const slipExist = await fuelDataOncallCollection.findOne({
        slipNo: fuelSlipNo,
      });
      if (!slipExist) {
        const result = await fuelDataOncallCollection.insertOne(fuelData);
        return res.json(result);
      } else {
        return res.json({ msg: "This Slip Already Used" });
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
      res.json(result);
    });
    app.get("/fuelListAllOncall", verifyJWT, async (req, res) => {
      const result = await fuelDataOncallCollection
        .find({})
        .sort({ slipNo: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/onCall/fuelListAll/count", verifyJWT, async (req, res) => {
      const totalPgRunData = await fuelDataOncallCollection.estimatedDocumentCount()
      res.json({ lengthOfData: totalPgRunData })
    })

    app.get("/onCall/fuelListAll", verifyJWT, async (req, res) => {
      const { page, size } = req.query
      //console.log(size)
      const skipPage = (+page * size)
      const result = await fuelDataOncallCollection
        .find({}).skip(skipPage).limit(+size)
        .sort({ date: -1, })
        .toArray();
      res.json(result);
    });

    app.get("/fuelListAll/count", verifyJWT, async (req, res) => {
      const { firstDay, lastDay } = req.query
      const filter = {
        date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };
      const totalFuelReceived = await fuelDataCollection.find(filter).toArray()
      const dataLength = totalFuelReceived.length
      res.json({ lengthOfData: dataLength })
    })

    app.get("/fuelListAll", verifyJWT, async (req, res) => {
      const { page, size, firstDay, lastDay } = req.query
      const filter = {
        date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };
      const skipPage = (+page * size)
      const result = await fuelDataCollection
        .find(filter).skip(skipPage).limit(+size)
        .sort({ date: 1, slipNo: 1 })
        .toArray();
      res.json(result);
    });

    app.delete("/receivedFuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await fuelDataCollection.deleteOne(filter);
      res.json(result);
    });

    app.delete("/onCall/receivedFuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await fuelDataOncallCollection.deleteOne(filter);
      res.json(result);
    });

    app.get("/pgRunAllList", verifyJWT, async (req, res) => {
      const email = req.query.email;
      //console.log(email)
      const filter = { pgRunnerEmail: email };
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });
    app.get("/ApprovedAllPgRun/pageCount", verifyJWT, async (req, res) => {
      const { firstDay, lastDay } = req.query
      const filter = {
        status: "Approved", date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };

      const totalPgRunData = await pgRunDataCollection.find(filter).toArray()
      const lengthData = totalPgRunData.length
      res.json({ lengthPgRunData: lengthData })
    })
    app.get("/ApprovedAllPgRun", verifyJWT, async (req, res) => {
      const { page, size, firstDay, lastDay } = req.query
      //console.log(firstDay)
      const skipPage = (+page * size)
      const filter = {
        status: "Approved", date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };
      const result = await pgRunDataCollection
        .find(filter).skip(skipPage).limit(+size)
        .sort({ date: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/PendingAllPgRun", verifyJWT, async (req, res) => {
      const filter = { status: "Pending" };
      const result = await pgRunDataCollection
        .find(filter)
        .sort({ date: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/chartPendingAllPgRun", async (req, res) => {
      const approvalPendingPipeline = [
        {
          $match: {
            status: "Pending"
          }
        },
        {
          $group: {
            _id: "$onCallName",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            pendingCount: "$count"
          }
        }
      ]
      const approvalPgRunPending = await pgRunDataCollection.aggregate(approvalPendingPipeline).toArray()
      res.send(approvalPgRunPending)
    })

    app.put("/pgRunList/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const approvalInfo = req.body;
      //console.log(approvalInfo)
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
      res.json(result);
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
      res.json(result);
    });

    app.get("/fuelBalance", verifyJWT, async (req, res) => {
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
            fuelReceived: { $toDouble: "$fuelBalanceInfo.fuelQuantity" },

          }
        },
        {
          $group: {
            _id: "$_id",
            fuelConsume: { $avg: "$totalFuelConsume" },
            fuelQuantity: { $sum: "$fuelReceived" },

          }
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            fuelQuantity: 1,
            fuelConsume: { $round: ["$fuelConsume", 2] },
            /* balance: { $round: [{ $subtract: ["$fuelQuantity", "$fuelConsume"] }, 2] } */

          }
        },
        /* {
          $sort: { balance: 1 }
        } */

      ]

      const result = await pgRunDataCollection.aggregate(pipeline).toArray()
      res.json(result)
    })

    app.get("/receiveFuelOncall", verifyJWT, async (req, res) => {

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
      res.json(receivedFuel)
    })

    app.get("/emInfo/count", verifyJWT, async (req, res) => {
      const totalEmData = await EMDataCollection.estimatedDocumentCount()
      //console.log(totalEmData)
      res.json({ lengthOfData: totalEmData })
    })
    app.get("/emInfo", verifyJWT, async (req, res) => {
      const { page, size } = req.query
      //console.log(page,size)
      const skipPage = (+page * size)
      const result = await EMDataCollection
        .find({}).skip(skipPage).limit(+size)
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });

    app.get("/emInfo/all", verifyJWT, async (req, res) => {
      const result = await EMDataCollection
        .find({})
        .toArray();
      res.json(result);
    });

    app.put("/emInfo/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updaterEmail = updateInfo.updaterEmail
      const updateUser = {
        $push: {
          EmUpdate: siteNo
        }
      }
      const emInfoInsert = await userCollection.updateOne({ email: updaterEmail }, updateUser, options)
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await EMDataCollection.updateOne(filter, updateDoc, options
      );
      res.json(result);
    });

    app.delete("/emInfo/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await EMDataCollection.deleteOne(filter);
      res.json(result);
    });

    //For  DgService Part API from here

    app.get("/dgServiceInfo", verifyJWT, async (req, res) => {
      const result = await dgServicingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });

    app.get("/dgServiceInfo/planSite/:target", verifyJWT, async (req, res) => {

      const targetDate = new Date(req.params.target)
      const pipeline = [
        {
          $addFields: {
            parsedDate: {
              $dateFromString: {
                dateString: '$nextPlanDate',

              }
            }
          }
        },
        {
          $match: {
            parsedDate: {
              $lte: targetDate
            }
          }
        },
        {
          $project: {
            parsedDate: 0
          }
        }
      ]
      //console.log("dg",targetDate)
      const result = await dgServicingCollection.aggregate(pipeline).sort({ date: 1 }).toArray()
      res.json(result)
      /* const targetDate = req.params.target
      console.log("dg", targetDate)
      const result = await dgServicingCollection.find({ date: { $lt: targetDate } }).sort({ date: 1 }).toArray()
      res.json(result) */
    })

    app.get("/dgAllServiceInfo", verifyJWT, async (req, res) => {
      const result = await dgAllServicingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });

    app.get("/countAllDgServiceInfo", verifyJWT, async (req, res) => {
      const totalDgService = await dgAllServicingCollection.estimatedDocumentCount()
      res.json({ countOfDgService: totalDgService })
    })

    //For  Dg all Servicing collection api
    app.post("/dgAllServicing", verifyJWT, async (req, res) => {
      const servicing = req.body;
      const result = await dgAllServicingCollection.insertOne(servicing);
      res.json(result);
    });

    app.put("/dgServiceInfo/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updaterEmail = updateInfo.updaterEmail
      const updateUser = {
        $push: {
          DgService: siteNo
        }
      }
      const serviceInfoInsert = await userCollection.updateOne({ email: updaterEmail }, updateUser, options)
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await dgServicingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //DG service record multi delete api

    app.delete("/dgServiceInfo/multiDelete", verifyJWT, async (req, res) => {
      const sites = req.body;
      //console.log(ids)
      const result = await dgServicingCollection.deleteMany({
        siteId: { $in: sites },
      });
      res.json(result);
    });

    app.delete("/dgServiceInfo/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await dgServicingCollection.deleteOne(filter);
      res.json(result);
    });

    //DG AllService record multi delete api

    app.delete("/dgAllServiceInfo/multiDelete", verifyJWT, async (req, res) => {
      const sites = req.body;
      //console.log(ids)
      const result = await dgAllServicingCollection.deleteMany({
        siteId: { $in: sites },
      });
      res.json(result);
    });

    //DG All ReFueling collection api
    app.get("/dgAllRefueling", verifyJWT, async (req, res) => {
      const result = await dgAllRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });
    //DG Last ReFueling collection api
    app.get("/dgRefuelingInfo", verifyJWT, async (req, res) => {
      const result = await dgRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
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
      res.json(result);
    });

    app.delete("/dgRefuel/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await dgRefuelingCollection.deleteOne(filter);
      res.json(result);
    });

    //For  Dg all ReFueling collection api
    app.post("/dgAllRefueling", verifyJWT, async (req, res) => {
      const refuel = req.body;
      //console.log(refuel)
      const result = await dgAllRefuelingCollection.insertOne(refuel);
      res.json(result);
    });

    //DG All ReFueling collection api
    app.get("/dgAllRefueling", verifyJWT, async (req, res) => {
      const result = await dgAllRefuelingCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });

    app.put("/rectifier", verifyJWT, async (req, res) => {
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
      res.json(result);
    });

    app.delete("/rectifier/:brand", verifyJWT, async (req, res) => {
      const filter = { brand: req.params.brand }
      const result = await rectifierCollection.deleteOne(filter)
      res.json(result)
    })

    //For Use DG Material collection api
    app.post("/dgMaterialInfo", verifyJWT, async (req, res) => {
      const refuel = req.body;
      //console.log(refuel)
      const result = await dgUseMaterialCollection.insertOne(refuel);
      res.json(result);
    });

    app.get("/dgMaterialInfo", verifyJWT, async (req, res) => {
      const result = await dgUseMaterialCollection
        .find({})
        .sort({ date: -1 })
        .toArray();
      res.json(result);
    });

    app.delete("/dgMaterial/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await dgUseMaterialCollection.deleteOne(filter)
      res.json(result)
    })

    app.get("/rectifier", verifyJWT, async (req, res) => {
      const result = await rectifierCollection.find({}).toArray();
      res.json(result);
    });

    app.delete("/pgRun/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(id)
      const filter = { _id: ObjectId(id) };
      const result = await pgRunDataCollection.deleteOne(filter);
      res.json(result);
    });

    app.get("/user/admin/:email", async (req, res) => {
      const requesterEmail = req.params.email;
      const filter = { email: requesterEmail };
      const user = await userCollection.findOne(filter);
      const isAdmin = user.role === "Admin";
      //console.log(isAdmin)
      res.json({ admin: isAdmin });
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
      res.json(result);
    });

    app.get("/userList", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });

    app.get("/userList/performance", async (req, res) => {
      const pipeline = [
        {
          $project: {
            _id: 0,
            email: 1,
            name: 1,
            FCU: { $size: { $ifNull: ["$FCU", []] } },
            EmUpdate: { $size: { $ifNull: ["$EmUpdate", []] } },
            DgService: { $size: { $ifNull: ["$DgService", []] } },

          }
        }
      ]
      //console.log(pipeline)
      const result = await userCollection.aggregate(pipeline).toArray();
      res.json(result);
    });
    app.get("/userList/users", async (req, res) => {
      const userEmail = req.query.email;
      //console.log(userEmail);
      const result = await userCollection.find({ email: userEmail }).toArray();
      res.json(result);
    });

    /* pg runner filter */
    app.get("/userList/pgRunner", verifyJWT, async (req, res) => {
      const result = await userCollection
        .find({ otherRole: "PG Runner" })
        .sort({ pgRunnerName: 1 })
        .toArray();
      res.json(result);
    });

    app.delete('/user/delete/:email', verifyJWT, async (req, res) => {
      const userEmail = req.params.email
      //console.log(userEmail)
      const result = await userCollection.deleteOne({ email: userEmail })
      res.json(result)
    })

    /* PG collection section */

    app.get("/pgList", verifyJWT, async (req, res) => {
      const result = await PgCollection.find().sort({ pgNo: 1 }).toArray();
      res.json(result);
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
      res.json(result);
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
      res.json(result);
    });

    // Site ID collection API
    app.get("/siteInfo", verifyJWT, async (req, res) => {
      const result = await siteDataCollection
        .find()
        .project({ siteId: 1 })
        .sort({ siteId: 1 })
        .toArray();
      res.json(result);
    });

    // Site info collection API
    app.get("/siteData/count", verifyJWT, async (req, res) => {
      const totalPgRunData = await siteDataCollection.estimatedDocumentCount()
      res.json({ lengthOfData: totalPgRunData })
    })
    app.get("/siteData", verifyJWT, async (req, res) => {
      const { page, size } = req.query
      const skipPage = (+page * size)
      const result = await siteDataCollection
        .find({}).skip(skipPage).limit(+size)
        .sort({ siteId: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/searchSite", verifyJWT, async (req, res) => {
      const query = req.query.site;
      //console.log(query)
      const result = await siteDataCollection.find({ siteId: query }).toArray();
      res.json(result);
    });

    app.delete("/siteData/:siteNo", verifyJWT, async (req, res) => {
      const siteId = req.params.siteNo
      const result = await siteDataCollection.deleteOne({ siteId: siteId })
      res.json(result)
    })

    // LubOil Receive Record API
    app.post("/lubOil", verifyJWT, async (req, res) => {
      const lubOilData = req.body;
      // console.log(lubOilData)
      const result = await lubOilCollection.insertOne(lubOilData);
      res.json(result);
    });

    app.get("/lubOil", verifyJWT, async (req, res) => {
      const result = await lubOilCollection
        .find({})

        .toArray();
      res.json(result);
    });

    app.put("/lubOil/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(siteNo);
      const updateInfo = req.body;
      //console.log(updateInfo)
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await lubOilCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.delete("/lubOilList/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      //console.log(pgNo)
      const filter = { _id: ObjectId(id) };
      const result = await lubOilCollection.deleteOne(filter);
      res.json(result);
    });

    app.delete("/pgList/:pgNo", verifyJWT, async (req, res) => {
      const pgNo = req.params.pgNo;
      //console.log(pgNo)
      const filter = { pgNo: pgNo };
      const result = await PgCollection.deleteOne(filter);
      res.json(result);
    });

    /* FCU Part start */

    app.get("/fcuFilterChangeLatestRecord", verifyJWT, async (req, res) => {
      const result = await fcuFilterChangeLatestRecord
        .find({})
        .sort({ latestServiceDate: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/fcuFilterChangeLatestRecord/:siteCode", verifyJWT, async (req, res) => {
      const site = req.params.siteCode
      const result = await fcuFilterChangeLatestRecord
        .find({ siteId: site })
        .toArray();
      res.json(result);
    });

    app.get("/fcuFilterChangeAllRecord", verifyJWT, async (req, res) => {
      const result = await fcuFilterChangeAllRecord
        .find({})
        .sort({ nextPlanDate: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/fcuFilterChangeLatestRecord/plan/:target", verifyJWT, async (req, res) => {
      const targetDate = new Date(req.params.target)
      const pipeline = [
        {
          $addFields: {
            parsedDate: {
              $dateFromString: {
                dateString: '$nextPlanDate',

              }
            }
          }
        },
        {
          $match: {
            parsedDate: {
              $lte: targetDate
            }
          }
        },
        {
          $sort: {
            nextPlanDate: -1
          }
        },

        {
          $project: {
            parsedDate: 0
          }
        }

      ]
      //console.log(targetDate)
      const result = await fcuFilterChangeLatestRecord.aggregate(pipeline).sort({ date: 1 }).toArray()
      res.json(result)
    })

    //For  FCU filter change all record collection api
    app.post("/fcuFilterChangeAllRecord", verifyJWT, async (req, res) => {
      const fcuFilter = req.body;
      const result = await fcuFilterChangeAllRecord.insertOne(fcuFilter);
      res.json(result);
    });
    //For  FCU filter change Latest record collection api
    app.put("/fcuFilterChangeLatestRecord/:siteID", verifyJWT, async (req, res) => {
      const siteNo = req.params.siteID;
      //console.log(siteNo);
      const updateInfo = req.body;
      const updaterEmail = updateInfo.updaterEmail
      //console.log(updateInfo)
      const filter = { siteId: siteNo };
      const options = { upsert: true };
      const updateUser = {
        $push: {
          FCU: siteNo
        }
      }
      const fcuInfoInsert = await userCollection.updateOne({ email: updaterEmail }, updateUser, options)
      const updateDoc = {
        $set: updateInfo,
      };
      const result = await fcuFilterChangeLatestRecord.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    }
    );

    // FCU filter Receive Record API
    app.post("/fcuFilter", verifyJWT, async (req, res) => {
      const fcuFilterData = req.body;
      // console.log(fcuData)
      const result = await fcuFilterCollection.insertOne(fcuFilterData);
      res.json(result);
    });

    app.get("/fcuFilter", verifyJWT, async (req, res) => {
      const result = await fcuFilterCollection.find().toArray();
      res.json(result);
    });

    app.delete("/fcu/:id", verifyJWT, async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await fcuFilterChangeLatestRecord.deleteOne(filter);
      res.json(result);
    });

    /* FCU Part End */

    /* Vehicle Api Start */
    app.put("/vehicle", verifyJWT, async (req, res) => {
      const vehicleInfo = req.body
      const vehicleNo = vehicleInfo.vehicleNo
      const filter = { vehicleNo: vehicleNo }
      const options = { upsert: true }
      const updateDoc = {
        $set: vehicleInfo
      }
      const newVehicle = await vehicleCollection.updateOne(filter, updateDoc, options)
      res.json(newVehicle)
    })

    app.get("/vehicle", verifyJWT, async (req, res) => {
      const result = await vehicleCollection.find({}).toArray()
      res.json(result)
    })

    app.delete("/vehicle/:vehicleNo", verifyJWT, async (req, res) => {
      const filter = { vehicleNo: req.params.vehicleNo }
      const result = await vehicleCollection.deleteOne(filter)
      res.json(result)
    })

    /* Site Issue Part start */

    app.post("/siteIssues", verifyJWT, async (req, res) => {
      const siteIssue = req.body
      const result = await siteIssueCollection.insertOne(siteIssue)
      res.json(result)
    })

    app.put("/siteIssues/:siteId", verifyJWT, async (req, res) => {
      const feedback = req.body
      const siteCode = req.params.siteId
      const filter = { siteId: siteCode }
      //console.log(filter)
      const options = { upsert: true }
      const updateDoc = {
        $set: feedback
      }
      const result = await siteIssueCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })

    app.get("/siteIssues", verifyJWT, async (req, res) => {
      const result = await siteIssueCollection.find({}).toArray()
      res.json(result)
    })

    app.get("/siteIssues/pending", verifyJWT, async (req, res) => {
      const filter = { status: "pending" }
      const result = await siteIssueCollection.find(filter).sort({ date: -1 }).toArray()
      res.json(result)
    })

    app.delete("/siteIssues/:id", verifyJWT, async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await siteIssueCollection.deleteOne(filter)
      res.json(result)
    })

    // Power shut down APi

    app.post("/powerShutDown", async (req, res) => {
      const alarmInfo = req.body
      //console.log(alarmInfo)
      const result = await powerShutDownCollection.insertOne(alarmInfo)
      res.json(result)
    })

    app.get("/powerShutDown", async (req, res) => {
      const priorityPipeLine = [
        {
          $match: {
            Alarm_Slogan: "CSL Fault"
          }
        },
        {
          $group: {
            _id: "$Priority",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            count: 1
          }
        },
        {
          $project: {
            _id: 0,
            Priority: "$_id",
            count: 1
          }
        }
      ]
      const priorityCount = await powerShutDownCollection.aggregate(priorityPipeLine).toArray()

      const downPipeLine = [
        {
          $match: {
            Alarm_Slogan: "CSL Fault"
          }
        },
        {
          $group: {
            _id: "$Power_Status",
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            Power_Status: {
              $cond: {
                if: { $eq: ["$Power_Status", "CP+DG"] },
                then: "DGPart",
                else: "$Power_Status"
              }
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },

        {
          $project: {
            _id: 0,
            Power_Status: "$_id",
            count: -1,

          }
        }
      ]
      const siteDownCount = await powerShutDownCollection.aggregate(downPipeLine).toArray()
      const downDurationPipeLine = [
        {
          $match: {
            Alarm_Slogan: "CSL Fault"
          }
        },
        {
          $bucket: {
            groupBy: "$Active_for",
            boundaries: [0, 60, 120, 180, 300],
            default: "SD>6",
            output: { count: { $sum: 1 } }
          }
        },
        {
          $addFields: {
            bucketName: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 0] }, then: "SD<1hr" },
                  { case: { $eq: ["$_id", 60] }, then: "1<SD<2" },
                  { case: { $eq: ["$_id", 120] }, then: "2<SD<3" },
                  { case: { $eq: ["$_id", 180] }, then: "3<SD<5" },
                  /*   { case: { $eq: ["$_id", 300] }, then: "3<SD<5" }, */
                ],
                default: "SD>5"
              }
            }
          }
        },
        {
          $project: {
            _id: 0, // Exclude the original _id field
            bucketName: 1,
            count: 1
          }
        }
      ]
      const downDurationCount = await powerShutDownCollection.aggregate(downDurationPipeLine).toArray()
      const powerAlarmDurationPipeLine = [
        {
          $match: {
            Alarm_Slogan: { $in: ["MAINS FAIL", "MAINS FAIL DELAY CKT ON"] }
          }
        },
        {
          $bucket: {
            groupBy: "$Active_for",
            boundaries: [0, 120, 240, 360],
            default: "PW>6",
            output: { count: { $sum: 1 } }
          }
        },
        {
          $addFields: {
            bucketName: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 0] }, then: "PW<2" },
                  { case: { $eq: ["$_id", 120] }, then: "2<PW<4" },
                  { case: { $eq: ["$_id", 240] }, then: "4<PW<6" },
                  /*  { case: { $eq: ["$_id", 360] }, then: "4<PW<6" }, */

                ],
                default: "SW>6"
              }
            }
          }
        },
        {
          $project: {
            _id: 0, // Exclude the original _id field
            bucketName: 1,
            count: 1
          }
        }

      ]
      const powerDurationCount = await powerShutDownCollection.aggregate(powerAlarmDurationPipeLine).toArray()
      const powerAlarmPipeLine = [
        {
          $match:
          {
            Alarm_Slogan:
            {
              $in: ["MAINS FAIL", "MAINS FAIL DELAY CKT ON", "Genset On", "LOW VOLTAGE"],

            }
          }
        },
        {
          $group: {
            _id: "$Alarm_Slogan",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            count: 1
          }
        },
        {
          $project: {
            _id: 0,
            powerAlarm: "$_id",
            count: 1
          }
        }
      ]
      const powerAlarmCount = await powerShutDownCollection.aggregate(powerAlarmPipeLine).toArray()

      const pgUtilize = await powerShutDownCollection.findOne({ pgType: "pgRun" })

      res.json({
        pgUtilization: pgUtilize, priorityCount: priorityCount,
        siteDownCount, downDurationCount, powerDurationCount,
        powerAlarmCount,
      })
    })

    app.get("/thanaWisePowerAlarm/:delay", async (req, res) => {
      const delayTime = req.params.delay
      //console.log(delayTime,districtName)
      const delayTimeMints = (+delayTime) * 60
      /* const powerAlarmThanaPipeLine = [
        {
          $match: {
            Alarm_Slogan: {

              $in: ["MAINS FAIL", "MAINS FAIL DELAY CKT ON"],
            },
            Active_for: {
              $gt: delayTimeMints
            }
          }
        },
        {
          $group: {
            _id: {
              Thana: "$Thana",
              District: "$District",
              Office: "$In_house_Office"
            },
            count: { $sum: 1 }
          },

        },
        {
          $group: {
            _id: "$_id.District",
            Thanas: {
              $push: {
                Thana: "$_id.Thana",
                count: "$count"
              }
            },
            distCount: { $sum: "$count" }
          }
        },

        {
          $unwind: "$siteOffice"
        },
        {
          $sort: {
            "Thanas.Thana": 1
          }
        },
        {
          $project: {
            _id: 0,
            Thana: "$Thanas.Thana",
            thanaCount: "$Thanas.count",
            District: "$_id",
            distCount: "$distCount"
          }
        } 

      ] */
      const powerAlarmThanaPipeLine = [
        {
          $match: {
            Alarm_Slogan: {
              $in: ["MAINS FAIL", "MAINS FAIL DELAY CKT ON"],
            },
            Active_for: {
              $gt: delayTimeMints,
              $lt: 3000
            }
          }
        },
        {
          $group: {
            _id: {
              Thana: "$Thana",
              District: "$District",
              Office: "$In_house_Office"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              District: "$_id.District",
              Office: "$_id.Office"
            },
            Thanas: {
              $push: {
                Thana: "$_id.Thana",
                count: "$count"
              }
            },
            officeCount: { $sum: "$count" }
          }
        },
        {
          $group: {
            _id: "$_id.District",
            Offices: {
              $push: {
                Office: "$_id.Office",
                Thanas: "$Thanas",
                officeCount: "$officeCount"
              }
            },
            distCount: { $sum: "$officeCount" }
          }
        },
        {
          $unwind: "$Offices"
        },
        {
          $unwind: "$Offices.Thanas"
        },
        {
          $sort: {
            "Offices.Office": 1,
            "Offices.Thanas.Thana": 1
          }
        },
        {
          $project: {
            _id: 0,
            District: "$_id",
            distCount: "$distCount",
            Office: "$Offices.Office",
            officeCount: "$Offices.officeCount",
            Thana: "$Offices.Thanas.Thana",
            thanaCount: "$Offices.Thanas.count"
          }
        }
      ];

      const powerAlarmThanaWise = await powerShutDownCollection.aggregate(powerAlarmThanaPipeLine).toArray()
      // console.log(powerAlarmThanaWise)
      res.send(powerAlarmThanaWise)
    })

    app.get("/lockRequest", async (req, res) => {
      const { lowTime, highTime } = req.query
      const lowTimeMints = +lowTime
      const highTimeMints = +highTime
      //console.log(lowTimeMints,highTimeMints)
      const pipeline = [
        {
          $match: {
            Alarm_Slogan: {

              $in: ["MAINS FAIL", "MAINS FAIL DELAY CKT ON"],
            },
            Active_for: {
              $lt: highTimeMints,
              $gt: lowTimeMints
            }
          }
        },
        {
          $project: {
            _id: 0
          }
        }
      ]
      const alarmData = await powerShutDownCollection.aggregate(pipeline).toArray()
      //console.log(alarmData)
      res.send(alarmData)
    })

    app.get("/thanaWiseDown", async (req, res) => {
      const thanaWiseDownPipeline = [
        {
          $match: {
            Alarm_Slogan: {

              $in: ["CSL Fault"],
            },
          }
        },
        {
          $group: {
            _id: "$Thana",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            thana: "$_id",
            downCount: "$count"
          }
        }

      ]
      const thanaWiseDown = await powerShutDownCollection.aggregate(thanaWiseDownPipeline).toArray()
      res.send(thanaWiseDown)
    })

    app.delete("/powerShutDown", async (req, res) => {
      const result = await powerShutDownCollection.deleteMany({})
      res.send(result)
    })

    /* Spare Api start from Here */

    app.post("/spare", async (req, res) => {
      const spareInfo = req.body
      const spareAdd = await NewAddSpareCollection.insertOne(spareInfo)
      res.send(spareAdd)
    })

    app.post("/ownSpare", async (req, res) => {
      const spareInfo = req.body
      const spareAdd = await OwnSpareCollection.insertOne(spareInfo)
      res.send(spareAdd)
    })

    app.post("/returnSpare", async (req, res) => {
      const spareInfo = req.body
      const spareAdd = await returnSpareCollection.insertOne(spareInfo)
      res.send(spareAdd)
    })
    app.get("/spare/spareBomList", async (req, res) => {
      const spareList = await spareListCollection.find({}).sort({ spareName: 1 }).toArray()
      res.send(spareList)
    })

    app.get("/spare", async (req, res) => {
      const spareList = await NewAddSpareCollection.find({}).sort({requisitionDate:-1 }).toArray()
      res.send(spareList)
    })

    app.get("/ownSpare", async (req, res) => {
      const spareList = await OwnSpareCollection.find({}).sort({ date: -1 }).toArray()
      res.send(spareList)
    })

    app.get("/returnSpare", async (req, res) => {
      const spareList = await returnSpareCollection.find({}).sort({ date: 1 }).toArray()
      res.send(spareList)
    })

    app.get("/ownSpare/stock", async (req, res) => {
      const ownStockPipeLine = [
        {
          $group: {
            _id: "$bomNo",
            ownGoodQuantity: { $sum: { $toInt: "$ownGoodStock" } },
            ownFaultyQuantity: { $sum: { $toInt: "$ownFaultyStock" } }
          }
        },
        {
          $project: {
            _id: 0,
            BOM_No: "$_id",
            ownGoodQuantity: 1,
            ownFaultyQuantity: 1
          }
        }
      ]
      const ownStock = await OwnSpareCollection.aggregate(ownStockPipeLine).toArray()
      res.send(ownStock)
    })

    app.get("/newSpare/stock", async (req, res) => {
      const newStockPipeLine = [
        {
          $group: {
            _id: "$bomNo",
            newGoodQuantity: { $sum: { $toInt: "$spmsGoodQuantity" } },
            newFaultyQuantity: { $sum: { $toInt: "$spmsFaultyQuantity" } }
          }
        },
        {
          $project: {
            _id: 0,
            BOM_No: "$_id",
            newGoodQuantity: 1,
            newFaultyQuantity: 1
          }
        }
      ]
      const newStock = await NewAddSpareCollection.aggregate(newStockPipeLine).toArray()
      res.send(newStock)
    })

    app.get("/returnSpare/pending", async (req, res) => {

      const returnPipeLine = [
        {
          $group: {
            _id: "$bomNo",
            faultyReturnQuantity: {
              $sum: {
                $cond: [{ $eq: ["$spareStatus", "Faulty"] }, { $toInt: "$returnQuantity" }, 0]
              }
            },
            goodReturnQuantity: {
              $sum: {
                $cond: [{ $eq: ["$spareStatus", "Good_Return"] }, { $toInt: "$returnQuantity" }, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            bomNo: "$_id",
            faultyReturnQuantity: 1,
            goodReturnQuantity: 1
          }
        }
      ];
      const spareReturn = await returnSpareCollection.aggregate(returnPipeLine).toArray()
      res.send(spareReturn)
    })

    app.put("/spare/spareList", async (req, res) => {
      const modifyData = req.body
      const newBomNo = modifyData.bomNo
      //console.log(newBomNo)
      const filter = { bomNo: newBomNo }
      const options = { upsert: true }
      const updateSpare = {
        $set: modifyData

      }
      const modifySpare = await spareListCollection.updateOne(filter, updateSpare, options)
      res.send(modifyData)
    })

    app.put("/spare", async (req, res) => {
      const modifyData = req.body
      const spareId = new ObjectId(modifyData.id)
      const filter = { _id: spareId }
      const options = { upsert: true }
      const finalQuantity = modifyData.goodQuantity
      //console.log(modifyData)
      const updateSpare = {
        $set: {
          spmsGoodQuantity: modifyData.goodQuantity,
          spmsFaultyQuantity: modifyData.faultyQuantity,
        },
        $push: { replacement: modifyData }
      }
      const modifySpare = await NewAddSpareCollection.updateOne(filter, updateSpare, options)
      res.send(modifyData)
    })

    app.put("/ownSpare", async (req, res) => {
      const modifyData = req.body
      //console.log(modifyData);
      const spareBomNo = modifyData.bomNo
      const filter = { bomNo: spareBomNo }
      const options = { upsert: true }
      const updateSpare = {
        $set: {
          ownGoodStock: modifyData.goodStock,
          ownFaultyStock: modifyData.faultyStock
        },
        $push: { replacement: modifyData }
      }
      const modifySpare = await OwnSpareCollection.updateOne(filter, updateSpare, options)
      res.send(modifyData)
    })

    app.get("/replacement/:id", async (req, res) => {
      const queryId = req.params.id
      const filter = { _id: new ObjectId(queryId) }
      const replacementList = await NewAddSpareCollection.findOne(filter)
      res.send(replacementList)
    })

    app.get("/spare/spareSummary", async (req, res) => {
      const spareSummaryPipeLine = [

        {
          $group: {
            _id: "$bomNo",
            SpmsGood: { $sum: { $toInt: "$spmsGoodQuantity" } },
            SpmsFaulty: { $sum: { $toInt: "$spmsFaultyQuantity" } },
          }
        },

        {
          $lookup: {
            from: "returnSpare",
            localField: "_id",
            foreignField: "bomNo",
            as: "returnSpareInfo"

          }
        },
        {
          $unwind: "$returnSpareInfo"
        },
        {
          $addFields:
          {
            returnInfo:{
              totalReturn: { $sum: { $toInt: "$returnSpareInfo.returnQuantity" } },
          totalGoodReturn:{$sum: {
            $cond: [{ $eq: ["$returnSpareInfo.spareStatus", "Good_Return"] }, { $toInt: "$returnSpareInfo.returnQuantity" }, 0]
          }},
          totalFaultyReturn:{$sum: {
            $cond: [{ $eq: ["$returnSpareInfo.spareStatus", "Faulty"] }, { $toInt: "$returnSpareInfo.returnQuantity" }, 0]
          }}
            }
          }
        },

         {
        $group:{
          _id:"$_id",
          totalSpmsGood: {$avg: "$SpmsGood" },
          totalSpmsFaulty: {$avg:"$SpmsFaulty" },
          totalReturn: { $sum: "$returnInfo.totalReturn" },
          totalGoodReturn:{$sum:"$returnInfo.totalGoodReturn"},
          totalFaultyReturn:{$sum: "$returnInfo.totalFaultyReturn" }
          }
      },
   
      
        {
          $project: {
          _id: 0,
          bomNo: "$_id",
          totalSpmsGood: 1,
          totalSpmsFaulty: 1,
          totalReturn: 1,
          totalGoodReturn:1,
          totalFaultyReturn:1
         
        }
      }   
      ]

      result = await NewAddSpareCollection.aggregate(spareSummaryPipeLine).toArray()
      res.send(result)
    })

    
    app.delete("/spare/returnSpare/:id", async (req, res) => {
      //console.log(req.params.id);
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await returnSpareCollection.deleteOne(filter)
      res.json(result)
    })

    app.delete("/spare/newSpare/:id", async (req, res) => {
      //console.log(req.params.id);
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await NewAddSpareCollection.deleteOne(filter)
      res.json(result)
    })
    app.delete("/spare/ownSpare/:id", async (req, res) => {
      //console.log(req.params.id);
      const filter = { _id: new ObjectId(req.params.id) }
      const result = await OwnSpareCollection.deleteOne(filter)
      res.json(result)
    })


    /* Spare Api End from Here */

  } finally {
  }

}



app.get("/", (req, res) => {
  res.json("we are tiger from Rangpur");
});

app.get("/xxx", (req, res) => {
  res.json("This is xxx route");
});
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`BL Operation listening on port ${port}`);
});

