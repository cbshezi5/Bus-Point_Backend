const express = require('express');
const app = express();
const Router = express.Router();
const mariadb = require('../../connection');
const bodyParser = require('body-parser');
var CryptoJS = require("crypto-js");

app.use(bodyParser.json());



Router.post('/', (req, res, next) => {

    let email;
    let password;

    //Checking of body elements 
    if (Object.keys(req.body).length != 0) {
        if (req.body.email) {
            email = req.body.email
        } else {
            res.send({
                "error": true,
                "code": "L003",
                "message": "Error administrator email not supplied",
            })
            return
        }
        if (req.body.password) {
            password = req.body.password
        } else {
            res.send({
                "error": true,
                "code": "L002",
                "message": "Error administrator password not supplied",
            })
            return
        }
    } else {
        res.send({
            "error": true,
            "code": "L001",
            "message": "Error administrator credintials were not supplied",
        })
        return
    }




    mariadb.query(`SELECT * FROM Administrator WHERE Email = "${req.body.email}"`, (err, rows, fields) => {
        if (!err) {
            if (rows.length < 1) {
                res.send({
                    "error": true,
                    "code": "L004",
                    "message": "Email doesn't exist on the system",
                })
                return
            }

            mariadb.query(`SELECT * FROM Administrator WHERE Email = "${req.body.email}"`, (err, rows, fields) => {
                
                var bytes = CryptoJS.AES.decrypt(rows[0].Password, '123');
                var originalText = bytes.toString(CryptoJS.enc.Utf8);

               

                if (!err) {
                    if (originalText != req.body.password) {
                        res.send({
                            "error": true,
                            "code": "L005",
                            "message": "Password is incorrect",
                        })
                        return
                    } else {
                        res.send({
                            "error": false,
                            "data": rows,
                        });
                      
                    }
                }
            });
        } else {
            console.log(err);
        }
    })
});

module.exports = Router;