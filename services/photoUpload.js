/**
 * use multer to save picture locally
 * remember to create a tmp file in the root of this project
 */

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({storage: storage}).single('uploadimg');

module.exports = upload;