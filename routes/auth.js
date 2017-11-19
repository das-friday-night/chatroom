var express = require('express');
var router = express.Router();

var db = require('../services/chatlog');

router.post('/login', function(req, res){
    console.log(req.body);
    if (!req.body.username || !req.body.password) {
        return res.send('login failed1');
    }
    return db.getUser(req.body.username)
        .then(user => {
            if(user.password === req.body.password){
                req.session.okma = 'syl';
                return res.status(200).send('login success');
            }
            else{
                res.send('login failed2');
            }
        })
        .catch(err => {
            return res.send('login failed3');
        });
});

router.get('/logout', function(req, res){
    req.session.destroy();
    res.send("logout success!");
});

module.exports = router;