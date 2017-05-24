var http = require('http'),
	url = require('url'),
	request = require('request'),
	iconv = require("iconv-lite"),
	express = require('express'),
	router = express.Router(), 
	news = require('../moudules/moudule.js'),
	cheerio = require("cheerio");

router.get('/', function(req, res) {
  news.find({'category':'国内新闻'},function(err, docs){
		var nw = [],
			vp = [];
		for(var i=0;i<7;i++){
			var ind = Math.round(Math.random()*(docs[0].data.length-1));
			nw.push(docs[0].data[ind]);
		}
		for(i=0;i<3;i++){
			ind = Math.round(Math.random()*(docs[0].data.length-1));
			vp.push(docs[0].data[ind]);
		}
		res.send({
			"news":nw,
			"viewPager":vp
		});
	});
});

router.get('/list', function(req, res) {
  news.find({'category':'国内新闻'},function(err, docs){
		var nw = [];
		for(var i=0;i<7;i++){
			var ind = Math.round(Math.random()*(docs[0].data.length-1));
			nw.push(docs[0].data[ind]);
		}
		res.send({
			"news":nw
		});
	});
});

router.get('/content',function(req,res){
	var parse = url.parse(req.url,true).query;
	request({url:parse.link,encoding:null},function(error,response,body){
		var body = iconv.decode(body,'gb2312');
		var $ = cheerio.load(body);
		res.send({
			"content": $("#Cnt-Main-Article-QQ p").text()
		});
	});
});

module.exports = router;
