const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
// Middleware
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4ckn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const herotravels = async () => {
    try {
        await client.connect();
        const packagesCollection = client.db('herotravel').collection('packages');
        const bookingCollection = client.db('herotravel').collection('bookings');

        app.post('/packages', async (req, res) => {
            const tourpackage = req.body;
            const result = await packagesCollection.insertOne(tourpackage);
            res.send(result);
        })
        app.post('/booking', async (req, res) => {
            const tourpackage = req.body;
            const result = await bookingCollection.insertOne(tourpackage);
            res.send(result);
        })

        app.get('/user/tour', async (req, res) => {
            const bookingId = req.query.bookingid;
            const query = { _id: ObjectId(bookingId) };
            const packages = await bookingCollection.findOne(query);
            res.send(packages);
        })

        app.put('/user/tour/:bookingID', async (req, res) => {
            const bookingId = req.params.bookingID;
            const bookingStatus = req.query.action;
            const filter = { _id: ObjectId(bookingId) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    bookingStatus
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/user/tour/:bookingID', async (req, res) => {
            const bookingId = req.params.bookingID;
            const query = { _id: ObjectId(bookingId) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/user/tour/update/:bookingID', async (req, res) => {
            const bookingId = req.params.bookingID;
            const userRole = req.query.role;
            const updateData = req.body;
            const filter = { _id: ObjectId(bookingId) };
            const options = { upsert: false };
            let updateDoc;
            if (userRole === 'admin') {
                updateDoc = {
                    $set: {
                        userCountry: updateData.userCountry,
                        fullName: updateData.fullName,
                        email: updateData.email,
                        bookingStatus: updateData.bookingStatus,
                        finalPrice: updateData.finalPrice,
                        journeyDate: updateData.journeyDate,
                        adults: updateData.adults,
                        children: updateData.children,
                        contactNo: updateData.contactNo,
                    },
                };
            }
            else {
                updateDoc = {
                    $set: {
                        journeyDate: updateData.journeyDate,
                        adults: updateData.adults,
                        children: updateData.children,
                        contactNo: updateData.contactNo,
                        message: updateData.message,
                    },
                };
            }
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/admin/tour/:bookingID', async (req, res) => {
            const bookingId = req.params.bookingID;
            console.log(bookingId)
            const query = { _id: ObjectId(bookingId) };
            const packages = await bookingCollection.deleteOne(query);
            res.send(packages);
        })

        app.post('/user/tour', async (req, res) => {
            const packageIds = req.body;
            const query = { packageID: { $in: packageIds } };
            const packages = await bookingCollection.find(query).toArray();
            res.send(packages);
        })

        app.get('/packages', async (req, res) => {
            const packages = packagesCollection.find({});
            const result = await packages.toArray();
            res.send(result);
        })

        app.get('/tours', async (req, res) => {
            const bookings = bookingCollection.find({});
            const result = await bookings.toArray();
            res.send(result);
        })

        app.get('/titles', async (req, res) => {
            const packages = packagesCollection.find({}).project({ title: 1 });;
            const result = await packages.toArray();
            res.send(result);
        })

        app.get('/user/bookingshistory', async (req, res) => {
            const email = req.query.q;
            const query = { email };
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/packages/:tourPackageID', async (req, res) => {
            const packageId = req.params.tourPackageID;
            const query = { _id: ObjectId(packageId) };
            const result = await packagesCollection.findOne(query);
            res.send(result);
        })
    }
    finally {
    }
}
herotravels().catch(() => console.dir());
app.listen(PORT, () => console.log('Connect'));