const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.satt96b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err) => {
            if (err) {
                console.error(err);
                return;
            }
        });

        const toyCollection = client.db('toddlershop').collection('alltoy');
        app.get('/alltoy', async (req, res) => {
            const limit = parseInt(req.query?.limit);
            const checkSearch = req.query?.search;
            
            if(checkSearch) {
                const query = {toy_name:checkSearch};
                const result = await toyCollection.findOne(query);
                const resultArray = [result] ;
                res.send(resultArray);
            } else {
                const cursor = toyCollection.find().limit(limit);
                const result = await cursor.toArray();
                res.send(result);
            }
            // console.log(limit);
           
        })
        // specific id wise toy
        app.get('/alltoy/just/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })
        // sub-category
        app.get('/alltoy/:sub_category', async (req, res) => {
            const subCategory = req.params.sub_category;
            const query = { sub_category: subCategory };
            const options = {
                projection: { _id: 1, img_url: 1, toy_name: 1, price: 1, rating: 1 },
            }
            const result = await toyCollection.find(query, options).toArray();
            res.send(result);
        })

        // mytoy list after login
        app.get('/mytoy', async (req, res) => {
            const userEmail = req.query?.userEmail;
            console.log(userEmail);
            const query = { seller_email: userEmail };
            const result = await toyCollection.find(query).toArray();
            res.send(result);

        })
        // add new toy 

        app.post('/add-a-toy', async (req, res) => {
            const newToyAdded = req.body;
            const result = await toyCollection.insertOne(newToyAdded);
            res.send(result);
        })

        // delete 
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })
        // update toy
        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            console.log('Hello');
            const filter = { _id: new ObjectId(id) };
            const updateToy = req.body;
            // console.log(updateToy);
            const updatedDocument = {
                $set: {
                    toy_name: updateToy.toy_name,
                    picture_url: updateToy.img_url,
                    sub_category: updateToy.sub_category,
                    price: updateToy.price,
                    rating: updateToy.rating,
                    quantity: updateToy.available_quantity,
                    detail_description: updateToy.details_descriptions
                }
            }
            const result = await toyCollection.updateOne(filter,updatedDocument);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //  await client.close();
    }
}
run().catch(console.dir);



//root 
app.get('/', (req, res) => {
    res.send('ToddlerShops running');
})

//app listen
app.listen(port, () => {
    console.log(`ToddlerShop Running on port ${port}`);
})
