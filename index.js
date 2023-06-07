const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const jwt = require('jsonwebtoken');

// middlware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zbzvmu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('bistroDB').collection('users');
    const menuCollection = client.db('bistroDB').collection('menu');
    const reviewCollection = client.db('bistroDB').collection('reviews');
    const cartCollection = client.db('bistroDB').collection('carts');

    // JWT
    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, env.process.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res.send(token)
    })

    // users related API

    app.get('/users', async(req, res) => {
      const result = await  usersCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already existing in database' });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/admin/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)

    })
    // Menu related API
    // get all items in database collection "menu"     <<========
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // Review related API
    // get all reviews from database collection "reviews"   <<=======
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // cart collection api
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item);
      result = await cartCollection.insertOne(item);
      res.send(result);
    });

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Bistro boss is running');
});

app.listen(port, () => {
  console.log(`Bistro boss is running on port: ${port}`);
});
