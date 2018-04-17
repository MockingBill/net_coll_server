// 导入MySQL模块


var sd = require('silly-datetime');
var async = require("async");
var mysql = require('mysql');
var app = require('../app');
var model = mysql.createPool({
    host     : 'mysqlIP',
    user     : 'root',
    password : 'root',
    database : 'netCell'
});
/**
 * 保存单个采集记录
 * @param value
 * @param cb
 */
exports.saveNetCollData = function (value,cb) {
    var ID = value.ID;
    var ECI = value.ECI;
    var TAC = value.TAC;
    var BSSS = value.BSSS;
    var GPS = value.GPS;
    var phoneNumber = value.phoneNumber;
    var phoneType = value.phoneType;
    var overlayScene = value.overlayScene;
    var district = value.district;
    var address = value.address;
    var NetworkOperatorName = value.NetworkOperatorName;
    var collTime = value.collTime;
    var sql = 'INSERT INTO netcellnet(ID,ECI ,TAC ,BSSS ,GPS ,phoneNumber ,phoneType ,overlayScene ,district ,address ,NetworkOperatorName,city,collTime,solveStatus,solveTime,createPersion,createTime,alterpersion,alterTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    model.getConnection(function (err, con) {
        if (err) {
            app.logger.info("saveNetCollData-"+err);
        };
        con.query(sql, [ID, ECI, TAC, BSSS, GPS, phoneNumber, phoneType,
                overlayScene, district, address, NetworkOperatorName, '黔东南', collTime,
                '未处理', '', 'app', sd.format(new Date(), 'YYYY-MM-DD HH:mm'), '', ''],
            function (err, rows) {
            var flag=0;
                if (err) {
                    app.logger.info("saveNetCollData-"+err);
                    flag= 0;
                }
                else {
                    flag= 1;
                }
                con.release();
                cb(flag);
            });
    });
};

/**
 * 查询某个手机号下的变更记录状态
 * @param phoneNumber
 * @param cb
 */
exports.queryStatus=function (phoneNumber,cb){
    model.getConnection(function (err, con) {
        if (err) {
            app.logger.info("queryStatus-"+err);
        }else{
            var sql="SELECT * FROM netcellnet WHERE solveStatus <> '未处理' AND phoneNumber like ?";
            con.query(sql, [phoneNumber],
                function (err, rows) {
                var res="0";
                    if(err){
                        app.logger.info("queryStatus-"+err);
                    }
                    else{
                        res=rows;
                    }
                    con.release();
                    cb(res);
                });
        }

    });
};




/**
 * 保存多个采集记录
 * @param values
 * @param cb
 */
exports.execAllcollDataSave =function(values, cb) {
    var sqlParamsEntity = [];
    for (var u in values) {
        var ID = values[u].ID;
        var ECI = values[u].ECI;
        var TAC = values[u].TAC;
        var BSSS = values[u].BSSS;
        var GPS = values[u].GPS;
        var phoneNumber = values[u].phoneNumber;
        var phoneType = values[u].phoneType;
        var overlayScene = values[u].overlayScene;
        var district = values[u].district;
        var address = values[u].address;
        var NetworkOperatorName = values[u].NetworkOperatorName;
        var collTime = values[u].collTime;
        var sql = 'INSERT INTO netcellnet(ID,ECI ,TAC ,BSSS ,GPS ,phoneNumber ,phoneType ,overlayScene ,district ,address ,NetworkOperatorName,city,collTime,solveStatus,solveTime,createPersion,createTime,alterpersion,alterTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        var param = [ID, ECI, TAC, BSSS, GPS, phoneNumber, phoneType,
            overlayScene, district, address, NetworkOperatorName, '黔东南', collTime,
            '未处理', '', 'app', sd.format(new Date(), 'YYYY-MM-DD HH:mm'), '', ''];
        sqlParamsEntity.push({sql: sql, params: param});
    }

    try{
        execTrans(sqlParamsEntity, function (err,message) {
            cb(err,message);

        });
    }catch(err){
        app.logger.info("execAllcollDataSave-"+err);
        cb(err,null);
    }

};


/**
 * 事务
 * @param sqlparamsEntities
 * @param callback
 */
function execTrans (sqlparamsEntities, callback) {

        model.getConnection(function (err, connection) {
            if (err) {
                app.logger.info(err);
                return callback(err, null);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    app.logger.info(err);
                    return callback(err, null);
                }
                app.logger.info("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
                var funcAry = [];
                sqlparamsEntities.forEach(function (sql_param) {
                    var temp = function (cb) {
                        var sql = sql_param.sql;
                        var param = sql_param.params;
                        connection.query(sql, param, function (tErr, rows, fields) {
                            if (tErr) {
                                connection.rollback(function () {
                                    app.logger.info("事务失败，" + sql_param + "，ERROR：" + tErr);
                                    return cb(tErr, null);
                                });
                            } else {
                                return cb(null, 'ok');
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    app.logger.info("transaction error: " + err);
                    if (err) {
                        connection.rollback(function (err) {
                            app.logger.info("transaction error: " + err);
                            connection.release();
                            return callback(err, null);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            app.logger.info("transaction info: " + JSON.stringify(info));
                            if (err) {
                                app.logger.info("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    app.logger.info("transaction error: " + err);
                                    connection.release();
                                    return callback(err, null);
                                });
                            } else {
                                connection.release();
                                return callback(null, info);
                            }
                        })
                    }
                })
            });
        });
}






