const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors())
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wugjgdu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect to the MongoDB server
    // await client.connect();
    console.log("Connected to MongoDB");

    // Get reference to the database and collection
    const database = client.db("publicDB");
    const countryDB = client.db("countryData");
    const spotCollection = database.collection("spotCollection");
    const countryCollection = countryDB.collection("countryCollection");
    // Define routes
    app.get("/countries" , async (req,res)=>{
      const data = await countryCollection.find().toArray();
      res.send(data);
    })

    app.get("/alltouristspot", async (req, res) => {
      const data = await spotCollection.find().toArray();
      res.send(data);
    });

    app.get("/alltouristspot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await spotCollection.findOne(query);
      res.send(cursor); 
    });

    app.put("/alltouristspot/:id", async(req,res)=>{
      const id = req.params.id;
      const spotData = await req.body; 
      const query = {_id : new ObjectId(id)};
      const option = {upsert: true}
      const updatedSpot = {
        $set : {
          spotName : spotData.spotName,
          image : spotData.image,
          countryName : spotData.countryName,
          location : spotData.location,
          shortDescription : spotData.shortDescription,
          averageCost : spotData.averageCost,
          seasonality : spotData.seasonality,
          travelTime : spotData.travelTime,
          totalVisitorsPerYear : spotData.totalVisitorsPerYear,
          userEmail : spotData.userEmail,
          userName : spotData.userName

        }
      }
      const result = await spotCollection.updateOne(query,updatedSpot,option);
      res.send(result);
    })

    app.delete("/alltouristspot/:email/:id", async(req,res)=>{
      const id = req.params.id;
      const email = req.params.email;
      const query = {_id : new ObjectId(id),email : email};
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    })

    app.get("/alltouristspot/mylist/:email",async(req,res)=>{
      const email = req.params.email;
      console.log(email);
      const query = {userEmail:email}
      const cursor = spotCollection.find(query)
      const result = await cursor.toArray();
      res.send(result);

      // const cursor = await 
    })

    app.get("/alltouristspot/mylist/:email/:id",async(req,res)=>{
      const email = req.params.email;
      const id = req.params.id;
      const query = {userEmail : email , _id : new ObjectId(id)}
      const cursor = await spotCollection.findOne(query);
      res.send(cursor)
    })

    app.post("/touristspot", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await spotCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    // Close the MongoDB client
    // await client.close();
  }
}

// Run the application
run().catch(console.error);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
