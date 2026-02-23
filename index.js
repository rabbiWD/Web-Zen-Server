const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;


// Middleware
app.use(cors());
app.use(express.json());

//  4oTDagM87LskZGYB  webZen


// const uri = `mongodb+srv://${process.env.SITE_USER}:${process.env.SITE_PASS}@cluster0.tachgq7.mongodb.net/?appName=Cluster0`;
const uri = `mongodb+srv://${process.env.SITE_USER}:${process.env.SITE_PASS}@cluster0.vuj5cyn.mongodb.net/?appName=Cluster0`;

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
    const db = client.db("WebZenDB");
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
  app.get('/api/users', async (req, res) => {
    const cursor = usersCollention.find();
    const result = await cursor.toArray();
    res.send(result);
  })

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



        // GET all best seller products
    app.get('/api/products/best-sellers', async (req, res) => {
      try {
        const bestSellers = await productsCollention.find({ bestSeller: true }).limit(8).toArray();
        res.send(bestSellers);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch best seller products" });
      }
    });


    // GET all new arrival products (limit 8)
    app.get('/api/products/new-arrivals', async (req, res) => {
      try {
        const newArrivals = await productsCollention
          .find({})
          .sort({ createdAt: -1 }) // newest first
          .limit(8)                 // limit to 8 products
          .toArray();

        res.send(newArrivals);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch new arrival products" });
      }
    });


    // GET all testimonials (sorted by newest first)
    app.get('/api/testimonials', async (req, res) => {
      try {
        const testimonials = await testimonialsCollection
          .find({})
          .sort({ createdAt: -1 }) // newest first
          .toArray();

        res.send(testimonials);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch new arrival products" });
      }
    });


   // GET single product by ID
   app.get('/api/products/:id', async (req, res) => {
    try {
    const id = req.params.id;
    const product = await productsCollention.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.send(product);

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch product" });
  }
});


  // Add Product API
  app.post('/api/products', async (req, res) => {
   try {
    // Get product data from request body
    const { title, image, category, sizes, price, color, description } = req.body;

    // Basic validation
    if (!title || !image || !category || !price) {
      return res.status(400).send({ error: "Title, image, category, and price are required" });
    }

    // Create new product object
    const newProduct = {
      title,
      image,
      category,
      sizes: sizes || [],
      price,
      color: color || [],
      description: description || "",
      createdAt: new Date() // optional: track creation date
    };

    // Insert product into MongoDB
    const result = await productsCollention.insertOne(newProduct);

    // Return success response with the inserted product
    res.status(201).send({ message: "Product added successfully", product: newProduct });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to add product" });
  }
});

// DELETE a challenge (by ID)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await productsCollention.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).send({ message: "Failed to delete challenge" });
  }
});

// UPDATE a product by ID
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    const result = await productsCollention.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({ message: "Failed to update product" });
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
  res.send('webzen server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})