const {ChatModel}=require('../db/models')
module.exports=function (server) {
//    产生socketio的管理对象
    const io=require('socket.io')(server)
//    监听与浏览器的连接，接受到一个连接对象
    io.on('connection',function (socket) {//与某个浏览器的连接
        console.log('有一个客户端连接上了')
        //监视当前scoket对应浏览器像服务器发送消息
        socket.on('sendMsg',function ({from,to,content}) {//浏览器发送的消息
        //    存数据（没有id）
            console.log('接收到一个聊天消息: ', from, to, content)
           const chat={
               from,
               to,
               content,
               chat_id:[from,to].sort().join('_'),
               create_time:Date.now()
           }
           new ChatModel(chat).save(function (error,chatMsg) {
               //发数据给浏览器（chat对象）
               console.log(chatMsg)
               io.emit('receiveMsg',chatMsg)
           })



        })

    })
}