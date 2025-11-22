const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v9x5iie.mongodb.net/?appName=Cluster0`;

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

        const productCollection = client.db('Assignment-12').collection('Products');

        // Post Product
        app.post('/products', async (req, res) => {
            const data = req.body;// Getting the data form the request
            data.votedUsers = []
            const result = await productCollection.insertOne(data) // Sending the data to the database and saving the confirmation message here

            res.send(result) // Sending the confirmation message to the client
        })

        // Handle Like/vote count
        app.patch('/products/:id/vote', async (req, res) => {
            const id = req.params.id; // Getting id from the req URL
            const { userEmail } = req.body; // Getting the email from the request

            const query = { _id: new ObjectId(id) }; // Converting the id into mongoDB ObjectId
            const product = await productCollection.findOne(query); // Finding the document with the matching query

            if (product.votedUsers?.includes(userEmail)) {
                return res.status(400).send({ message: 'User already voted' });
            }

            const updateDoc = {
                $inc: { votes: 1 }, // Increase votes key by 1
                $push: { votedUsers: userEmail } // add this userEmail into votedUsers array 
            };

            const updatedProduct = await productCollection.findOneAndUpdate(
                query, // help to find the document
                updateDoc, // updates with that
                {returnDocument:'after'}
            ) // Commanding to update with the updatedDoc and saving the updated document here

            res.send(updatedProduct) // Sending the updated document to the client
        })

        // Get all products
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result)
        })

        // Get products by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id; // Getting the id from the 
            const query = { _id: new ObjectId(id) }; // converting the id into mongodbId
            const result = await productCollection.findOne(query) // getting the data matching with the query and saving here
            res.send(result) // Sending the data back to the client
        })

        // Get Products by email
        app.get('/products/byEmail/:email',async(req,res)=> {
            const email = req.params.email;
            const query = {ownerEmail: email};// Converting as in mongoDb
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })

        // delete document
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query);// commanding to delete data matching with query and saving the confirmation message here
            res.send(result) // 
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Hurrah! Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Assignment-12 server is running on local host');
})

app.listen(port, () => {
    console.log(`Assignment 12 server is running on port ${port}`);
})