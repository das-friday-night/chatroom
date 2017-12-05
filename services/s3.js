// http://www.joshsgman.com/upload-to-and-get-images-from-amazon-s3-with-node-js/
// https://scotch.io/@cizu/building-a-amazon-s3-api-with-express-and-multer-s3

var multer  = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
var path = require('path');

AWS.config.loadFromPath(path.join(__dirname,'..','s3_config.json'));
var s3 = new AWS.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'chat-room-image',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            console.log(file);
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            // todo conflict key occurs when two same name file uploaded on the same time
            cb(null, file.fieldname + '_' + Date.now().toString())
        }
    })
}).single('uploadimg');

// // ** create a bucket, only needed once **
// s3.createBucket({Bucket: 'chat-room-image'}, function(err, data){
//     if(err) console.log(err);
//     console.log(data);
// });

function uploadImage(req, res, next) {
    upload(req, res, function(err){
        if (err) {
            console.log('Error in multer: ',err);
            return next(err);
        }
        res.status(200).json({url: req.file.location});
    });
}


module.exports = {
    uploadImage: uploadImage,
};