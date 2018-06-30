const express = require('express');
const router = express.Router();
const md5=require('blueimp-md5')
// const {UserModel}=require('../db/models');

// 引入UserModel,ChatModel
const models = require('../db/models')
const UserModel = models.UserModel
const ChatModel = models.ChatModel

// console.log(UserModel);
const filter = {password: 0}
//注册路由
router.post('/register',function (req,res) {
//    获取请求参数
    const {username,password,type}=req.body;
// 处理数据
//    查找数据库中的数据
UserModel.findOne({username},function (err,user) {
   if(user){
      res.send({code:1,msg:'用户名已存在'})
   }else {
   //    保存数据
       new UserModel({username,password:md5(password),type}).save(function (err,user) {
       //    返回响应生成一个cookie并提交给浏览器保存
           res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
           res.send({code:0,data:{_id:user._id,username,type}})//返回的数据中不要携带pwd
       })
   }
})
//    返回响应
})
//登陆路由
router.post('/login',function (req,res) {
//  获取请求数据
const {username,password}=req.body;
//查找数据
    UserModel.findOne({username,password:md5(password)},filter,function (err,user) {
        // 3. 返回响应数据
        // 3.1. 如果user没有值, 返回一个错误的提示: 用户名或密码错误
   if(!user){
       // console.log("sasasss");
       res.send({code: 1, msg: '用户名或密码错误'})
   }else {
       // 生成一个cookie(userid: user._id), 并交给浏览器保存
       res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
   //    返回user值
       res.send({code:0,data:user})//user中没有pwd
   }
    })
})
//更新用户信息路由
// 根据cookie获取对应的user
router.post('/update', function (req, res) {
    // console.log(req.body)
    // 取出cookie中的userid
    const userid = req.cookies.userid
    if(!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }

    // 查询对应的user
    UserModel.findByIdAndUpdate({_id: userid}, req.body, function (err, user) {
        // console.log(user)
        const {_id,username,type}=user;
        const data=Object.assign(req.body,{_id,username,type})
        return res.send({code: 0, data: data})
    })
})
// 根据cookie获取对应的user
router.get('/user', function (req, res) {
    // 取出cookie中的userid
    const userid = req.cookies.userid
    if(!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }

    // 查询对应的user
    UserModel.findOne({_id: userid}, filter, function (err, user) {
        return res.send({code: 0, data: user})
    })
})
//用户列表
router.get('/userlist',function(req, res){
    const { type } = req.query
    UserModel.find({type},filter,function(err,users){
        console.log(users)
        return res.json({code:0, data: users})
    })
})



/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
    // 获取cookie中的userid
    const userid = req.cookies.userid
    // 查询得到所有user文档数组
    UserModel.find(function (err, userDocs) {
        console.log(userDocs)
        // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
        const users = {} // 对象容器
        userDocs.forEach(doc => {
            users[doc._id] = {username: doc.username, header: doc.header}
        })
        /*
        查询userid相关的所有聊天信息
         参数1: 查询条件
         参数2: 过滤条件
         参数3: 回调函数
        */
        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
            // 返回包含所有用户和当前用户相关的所有聊天消息的数据
            res.send({code: 0, data: {users, chatMsgs}})
        })
    })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
    // 得到请求中的from和to
    const from = req.body.from
    const to = req.cookies.userid
    /*
    更新数据库中的chat数据
    参数1: 查询条件
    参数2: 更新为指定的数据对象
    参数3: 是否1次更新多条, 默认只更新一条
    参数4: 更新完成的回调函数
     */
    ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
        console.log('/readmsg', doc)
        res.send({code: 0, data: doc.nModified}) // 更新的数量
    })
})




module.exports = router;
