const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const Seat  = require('./seat.model');
const User = require('./user.model');
const Library  = require('./library.model');
const MongoServerFuncs = require("./db");
const Str = require('@supercharge/strings');
const db = require('./db');

router.post("/add", auth, async(req, res) => {
    const libName = req.body.libName;
    const isAvailable = req.body.isAvailable;
    const ipAdress = req.body.ipAdress; 

    const seatCollectionName = req.body.libName+"_seats"
    try{
        let  library  = await db.deliLibdb.collection('library').findOne({
            libName,
        });
        if(library){
            res.status(404).json({
                msg: "Library Already Exists"
            })
        }

        else{

            MongoServerFuncs.CreateSeatCollection(seatCollectionName);

            library = new Library({
                libName,
                seatCollectionName,
                isAvailable,
                seatCount  : 0,
                groupCount : 0,
                virtualSeatCount: 0,
                password: Str.random(4),


            });
            await library.save()
            .then(result => {
                res.status(200).json({
                    msg: "Library added succesfully"
                })
            })
            .catch(err => {
                console.log(err)
            })
            
            
        }
    } catch (err) {
        // console.log(err);
        console.log(err);
    }
})

router.get('/all', auth, async (req, res)=> {
    try{
        await db.deliLibdb.collection('libraries').find().sort({
            libName: 1
        }).toArray(function(err, result){
            if(err){
                throw(err)
            }
            res.status(200).send(result)
        })
    }
    catch(err){
        throw(err)
    }
})

router.get('/password', auth, async (req, res) => {
    try{
        let lib = await db.deliLibdb.collection('libraries').findOne({
            libName : req.body.library
        })
        // console.log(lib)
        res.status(200).json({
            password : lib.password
        })

    }
    catch(err){
        throw(err)
    }
})



module.exports = router;
