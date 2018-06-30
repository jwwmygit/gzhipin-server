let mongoose=require('mongoose');
//加密包
const md5=require('blueimp-md5');
mongoose.connect('mongodb://localhost:27017/gzhipin_test2')
//获取连接对象
const comn=mongoose.connection;
//绑定连接完成的监听（用来提示连接成功）
comn.on('connected',function () {
   console.log('数据库连接成功')
});
//得到对应集合的model
//描述文档结构
const userSchema=mongoose.Schema({
    username:{type:String,require:true},
    password:{type:String,require:true},
    type:{type:String,require:true}
});
//定义model
const UserModel=mongoose.model('user',userSchema);
//通过model实例的save()添加数据
function testSave() {
//    user数据对象
    const user={
        username:"张三",
        password:md5("sjsj"),
        type:"dashen"
    }
    const userModel=new UserModel(user);
//    保存到数据库
    userModel.save(function (error,user) {
        console.log("save()",error,user)
    })//返回一个数组
}
// testSave()
//数据的查找
function testFind() {
    UserModel.find(function (err,user) {
        console.log("find()",err,user)


    })
    /*UserModel.findOne(function (err,user) {
        console.log("findOne()",err,user)


    })*/
//    返回一个对象

}
testFind()
/*function testUpdata() {
  UserModel.findByIdAndUpdate({_id:'5b2c87a8bc32ba258cdb0a61'},{username:"李四"},function (err,user) {
      console.log(err,user)
  })*/
// }testUpdata()
function textDelete() {
    UserModel.remove({_id: '5b2c87a8bc32ba258cdb0a61'},function (err,data) {
        console.log("remove",err,data)
    })
}
// textDelete()