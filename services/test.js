/**
 *Created by fungdong on 2018/3/26
 *
 */

/*

var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../model/netCell_model1');
 var userSQL = require('../model/netCell_model1');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );
// 响应一个JSON数据
var responseJSON = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({     code:'-200',     msg: '操作失败'
        });
    } else {
        res.json(ret);
    }};
// 添加用户
router.get('/getNetCell', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var param = req.query || req.params;

        var testData = ['','aaa','aaa','111','aaa','aaa','aaa','aaa','aaa','aaa','ddddd'];
// 建立连接 增加一个用户信息
        connection.query(userSQL.insert, testData, function(err, result) {
            if(result) {
                result = {
                    code: 200,
                    msg:'增加成功'
                };
            }

            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);

            console.log(result);

            // 释放连接
            connection.release();

        });
    });
});
*/
var mysql = require('mysql');
var model = mysql.createPool({
    host     : 'mysqlIP',
    user     : 'root',
    password : 'root',
    database : 'netCell'
});
function isConn () {
    model.getConnection(function (err, con) {
        if (err) {
            console.log(err);
        };
        con.query("select * from netcellnet", [],
            function (err, rows) {

                if (err) {
                    console.log(err);
                }
                else {
                    console.log("success"+rows);
                }
                con.release();
            });
    });
};
isConn();

