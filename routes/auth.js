var express = require('express');
var router = express.Router();

var db = require('../services/chatlog');

router.post('/login', function(req, res){
    if (!req.body.username || !req.body.password) {
        return res.status(401).send('login failed');
    }
    return db.getUser(req.body.username)
        .then(user => {
            if(user.password === req.body.password){
                req.session.okma = 'syl';
                return res.status(200).send('login success');
            }
            else{
                res.status(401).send('login failed');
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(401).send('login failed');
        });
});

router.get('/logout', function(req, res){
    req.session.destroy();
    res.send("logout success!");
});

module.exports = router;