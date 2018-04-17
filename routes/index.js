var express = require('express');
var aes=require('../services/aes');
var service = require('../services/netCell_service');
var app = require('../app');
var crypto = require('crypto');


var router = express.Router();

var KEY="bXlEZWFyTFdX132df6bVGhlV2FudGVy";
var vi=new Buffer("1234567812345678");
var SALT="QWER!@#$ASDF";

/**
 * 请求解密及token认证
 */
router.use(function (req, res, next) {
    if(req.method=="GET"||req.method=="get"){
        next();
    }
    else if(req.method=="post"||req.method=="POST"){
        try{
            var postValue=Object.keys(req.body)[0];
            if((typeof postValue)==="string"){
                var value=aes.decrypt(KEY,vi,postValue)
                value=JSON.parse(value);
                req.body=value;

                //请求合法性判断
                var headToken=req.headers.authorization;
               // var appToken=value.token;
                var serverToken=getMd5();
                if(headToken==serverToken){
                    next();
                }else{
                    res.send("0");
                }
            }else{
                res.send("0");
            }

        }catch(err){
            app.logger.info(err);
            res.send("0");
        }
    }else{
        res.render("error",{message:"404"});
    }
});

router.post('/getSingleNetColl', function (req, res, next) {
    try {
        var value = req.body;
        service.saveNetCollData(value, function (flag) {
            if (flag == 1)
                res.send('1');
            else
                res.send('0')
        });
    } catch (err) {
        app.logger.info("getSingleNetColl-"+err);
        res.send('0');
    }
});

var i=0;
var sum=0;
router.post('/getAllNetColl', function (req, res, next) {
    try{
        i=0;
        sum=0;
        var values=req.body;
        service.execAllcollDataSave(values,function (err,message) {
            app.logger.info(err);
            app.logger.info(message);
            if(message!=null)
                res.send("1");
            else
                res.send("0");
        });
    }catch(err){
        app.logger.info("getAllNetColl-"+err);
        res.send("0");
    }
});

router.post('/getStatusData',function (req,res,next) {
    try{
        var value=req.body;
        var phoneNumber=value.phoneNumber;

        app.logger.info("状态变更查询-手机号："+phoneNumber);
        service.queryStatus(phoneNumber,function (result) {
            var data=aes.aesEncrypt(JSON.stringify(result),KEY);
            res.send(data);
        });
    }catch (err){
        app.logger.info("getStatusData-"+err);
        res.send("0");
    }
});


function getMd5() {
    Date.prototype.format = function(fmt) {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    var str = new Date().format("yyyy-MM-dd-hh");
    try{
        return crypto.createHash('md5').update(SALT+str+SALT).digest('hex');
    }catch(err){
        app.logger.info("create md5 token-"+err);
        return "0";
    }

}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '本端口不支持web访问' });
});

module.exports = router;







