var sa              = require("superagent"),
    charsetCompoent = require('superagent-charset'),
    superagent      = charsetCompoent(sa),
    eventproxy      = require("eventproxy"),
    feedparser      = require("feedparser"),
    iconv           = require("iconv-lite"),
    fs              = require("fs"),
    DAO             = require("./database/dao.js"),
	request 		= require("request"),
	cheerio 		= require("cheerio");

var {
    model,
    schema,
    db
} = DAO;

var ep = new eventproxy(),
    count = 0;

class service {
    constructor() {
        this.result = [];
    }

    getData(valueList, callback) {
        var $self = this;

        valueList.forEach(function(value, idx) {
            var fp              = new feedparser(),
                category        = {
                    "category": value.name,
                    "data": []
                }

            console.log("Catching < "+ value.name + " > from:" + value.url);
            superagent.get(value.url)
                .type("xml")
                .on("error", function (err) {
                   console.log("===== %s 获取数据失败 =====",value.name) 
                   console.log(err);
                })    
                .pipe(iconv.decodeStream("gb2312"))
                .pipe(fp)
                .on("error", function (err) {
                    console.log("===== %s 解析数据失败 =====",value.name);
                    console.error(err);
                })
                .on("readable", function () {
                    var $stream = this,
                        obj = null,
                        item;

                    while(item = $stream.read()) {                         
                        obj = {
                            "title" : item.title,
                            "link" : item.link,
                            "pubDate": item.pubDate.toString().split('GMT')[0],
                            "author": item.author,
							"imgUrl": ''
                        }
                    }
					if(obj != null){
						count++;
						category.data.push(obj);
					}					
                })
                .on("end", function (err) {
                    if(err) {
                        console.log(">>>>>> 出现错误!!!");
                        console.log(err);
                    } else {
						var epx = new eventproxy();
						epx.after('get_img',category.data.length,function(){
							$self.result.push(category);
							console.log("===== %s 已解析完数据 =====",value.name);
							ep.emit("get_data");
						})
						//爬取图片的URL
						category.data.forEach(function(objItem,objId,array){
							request(objItem.link,function(error,response,body){
								if(!error && response.statusCode == 200){
									var $ = cheerio.load(body);
									if($('#Cnt-Main-Article-QQ img').attr('src') != undefined)
										array[objId].imgUrl = $('#Cnt-Main-Article-QQ img').attr('src');
									else
										array[objId].imgUrl = '';
								}
								epx.emit('get_img');
							});
						});
                    }
                })
        })
        
        ep.after("get_data", valueList.length, function () {
            console.log("所有结果：%s 组 共 %s 条",$self.result.length,count);
            callback && callback($self);
        })
    }

    saveData(callback) {
        var $self = this;
        var ep = eventproxy();
        for(var i = 0; i<$self.result.length; i++) {
             new model($self.result[i]).save(function (err) {
                if(err) {
                    console.log(err)
                } else {
                    console.log("数据存储成功!");
                    ep.emit("save_Data");
                }
            });
        }

        ep.after("save_Data", $self.result.length , function () {
            db.close();
        })

        callback && callback();    
    }
}

module.exports = new service;