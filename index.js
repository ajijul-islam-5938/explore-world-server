const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

// Middleware
app.use(cors());
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
    const spotCollection = database.collection("spotCollection");

    // Define routes
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
