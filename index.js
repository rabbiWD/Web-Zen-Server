const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;


// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.SITE_USER}:${process.env.SITE_PASS}@cluster0.tachgq7.mongodb.net/?appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // All collection and Database
    const db = client.db("FootwearZone");
    const usersCollention = db.collection("users");
    const productsCollention = db.collection("products");
    const testimonialsCollection = db.collection("testimonials");



    // // find  productsCollection all data
    // app.get('/api/products', async (req, res) => {
    //   const cursor = productsCollention.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })

  // ALl Methords 


    app.post('/api/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollention.findOne(query);
      if (existingUser) {
       return  res.send({ message: 'User already exist, Do not need to insert again.' });
      }
      else {
        const result = await usersCollention.insertOne(newUser);
        return  res.send(result);

      }
    })


    app.get('/api/products', async (req, res) => {
      try {
        const category = req.query.category;  // e.g. ?category=kids

        let query = {};
        if (category) {
          query.category = { $regex: `^${category}$`, $options: 'i' };
        }

        const result = await productsCollention.find(query).toArray();
        res.send(result);

      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch products" });
      }
    });






    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('FootWaer Zone server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})