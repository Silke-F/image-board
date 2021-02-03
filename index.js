const express = require("express");
const db = require("./db.js");
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3.js")
const {s3Url} = require("./config.json");

const app = express();
app.use(express.static("./public"));
app.use(express.json());


const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});


// ------------------- GET IMAGES ------------------- 
app.get("/images", (req, res) => {
    db.getImages().then(result => {
        res.json(result);
    })
});


// ------------------- GET IMAGEBYID ------------------- 
app.get("/images/:id", (req, res) => {    
    const {id} = req.params;
    db.getImageById(id).then(result => {
        res.json(result.rows[0]);
        console.log("result", result.rows[0]);
    })
});


// ------------------- GET COMMENT ------------------- 
app.get("/comments/:id", (req,res) => {
    const {id} = req.params;
    db.getCommentByImageId(id).then(result => {
        console.log("comment", result);
        res.json(result.rows);
    })
});


// ------------------- INSERT COMMENT ------------------- 
app.post("/comments/", (req, res) => {
    const {comment, username, imageId} = req.body;
    db.insertComment(username, comment, imageId).then(result => {
        res.json(result);
        console.log("insert comments result", result);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
})


// ------------------- LOAD MORE IMAGES ------------------- 
app.get("/loadImages/:id", (req, res) => {
    console.log("THE REQ OF LOAD IMAGES", req.body);
    const {id} = req.params;
    console.log(id);
    db.getMoreImages(id).then((result) => {
        res.json(result);   
    });
});




// ------------------- UPLOAD/STORE IMAGES ------------------- 

app.post("/upload", uploader.single('file'), s3.upload, (req, res) => {
    console.log(req.body, req.file);
    const {username, title, desc} = req.body;
    const filename = req.file.filename;
    db.uploadImage(s3Url + filename, username, title, desc).then(result => {
        res.json(result);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});


// before AWS/S3 setup
/* app.post('/upload', uploader.single('file'), function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    if (req.file) {
        res.json({
            success: true
        });
    } else {
        res.json({
            success: false
        });
    }
});
 */



app.listen(8080);