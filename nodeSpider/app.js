var service = require("./service.js")    

var DataPort = [
   {  
       name: "国内新闻",
       category: "civilnews",
       url: "http://news.qq.com/newsgn/rss_newsgn.xml"
   }
];


service
.getData(DataPort,function ($self) {
  console.log("\n===== 接收阶段结束， 准备存储数据 =====");

  $self.saveData(function () {
    console.log("\n===== 存储数据结束 =====");
  });
})