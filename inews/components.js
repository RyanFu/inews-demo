import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	Text,
	Navigator,
	ToolbarAndroid,
	Dimensions,
	Image,
	ListView,
	RefreshControl,
	ActivityIndicator,
	TouchableHighlight,
	ScrollView,
	TouchableNativeFeedback
} from 'react-native';
var ViewPager = require('react-native-viewpager'),		//获取ViewPager模块
	{height,width} = Dimensions.get('window'),			//获取屏幕的宽度和高度
	NEWS = [],											//存储ListView中的新闻信息
	NEWSVP = [],										//存储ViewPager中的新闻信息
	ind;												//用于在组件之间传递参数

export class ContentPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.id,
			content: ''
		};
		this._fetchContent();
	}
	_fetchContent(){
		fetch('http://127.0.0.1:8080/content?link='+NEWS[this.state.id].link,{
			method: 'GET'
		}).then((response)=>{
			if(response.ok){
				return response.json();
			}
			else{
				alert('服务器繁忙，请稍后再试！');
			}
		}).then((data)=>{
			this.setState({
				content: data.content
			});
		}).catch((err)=>{
			alert(err);
		});
	}
	_close(){
		var navigator = this.props.navigator;
		if(navigator){
			navigator.pop();
		}
	}
	render(){
		return(
			<View style={{flex:1}}>
			  <View style={styles.titleView}>
				  <TouchableNativeFeedback onPress={this._close.bind(this)} underlayColor='#C7C7C7'>
					<Text style={{fontSize:20,fontWeight:'500',textAlign:'center',marginBottom:10,marginTop:30,marginLeft:30,marginRight:30}}>{NEWS[this.state.id].title}</Text>
				  </TouchableNativeFeedback>
				  <View style={{flexDirection:'row'}}>
					  <Text style={{fontSize:13,fontWeight:'200'}}>来源：{NEWS[this.state.id].author}</Text>
					  <Text style={{fontSize:13,fontWeight:'200'}}>时间：{NEWS[this.state.id].pubDate}</Text>
				  </View>
			  </View>
			  <ScrollView style={styles.contentView}>
				  <Text style={{fontSize:17,fontWeight:'300'}}>{this.state.content}</Text>
			  </ScrollView>
			</View>
		);
	}
}

export class Slide extends Component {
	constructor(props) {
		super(props);
		const ds = new ViewPager.DataSource({pageHasChanged: (p1, p2) => p1 !== p2});
		this.state = {
		  dataSource: ds.cloneWithPages([])
        };
		ind = this;
	}
	_renderPage(data,pageID) {
		let imgURL = (data.imgUrl!='')?data.imgUrl:'http://mat1.qq.com/news/rss/logo_news.gif';
		return (
				<Image style={{flex:1}} source={{uri: imgURL}}/>
		)
	}
	render() {
		return (
			<View style={styles.focus}>
				<ViewPager 
					dataSource={this.state.dataSource}
					renderPage={this._renderPage}
					autoPlay={true}
					isLoop={true}
				/>
			</View>
		);
	}
}

export class MainPage extends Component {
	constructor(props) {
		super(props);
		var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1!==r2});
		this.state = {
		  dataSource: ds.cloneWithRows([]),
		  animating: false
        };
		
		//获取数据，初始化主页
		this._fetchPage();
				
	}

	//用来刷新整个页面
	_fetchPage(){
		
		//获取数据前显示loading
		this.setState({
			animating: true
		});
		
		fetch('http://127.0.0.1:8080/',{
			method: 'GET'
		}).then((response)=>{
			if(response.ok){
				
				//将返回结果转换成JS对象
				return response.json();
				
			}
			else{
				alert('服务器繁忙，请稍后再试！');
			}
		}).then((data)=>{
			
			//隐藏loading
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows([]),
				animating: false
			});

			NEWS.splice(0,NEWS.length);
			data.viewPager.forEach(function(item){
				NEWS.push(item);
			});
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(NEWS)
			})
			NEWSVP.splice(0,NEWSVP.length);
			data.viewPager.forEach(function(item){
				NEWSVP.push(item);
			});
			ind.setState({
				dataSource: ind.state.dataSource.cloneWithPages(NEWSVP)
			})
		}).catch((err)=>{
			alert(err);
		});
	}
	
	//用于下拉刷新
	_fetchListDown(){
		fetch('http://127.0.0.1:8080/list',{
			method: 'GET'
		}).then((response)=>{
			if(response.ok){
				
				//将返回结果转换成JS对象
				return response.json();
				
			}
			else{
				alert('服务器繁忙，请稍后再试！');
			}
		}).then((data)=>{
			data.news.forEach(function(item){
				NEWS.push(item);
			});
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(NEWS)
			});
		}).catch((err)=>{
			alert(err);
		});
	}
	
	//用于上拉刷新
	_fetchListUp(){
		fetch('http://127.0.0.1:8080/list',{
			method: 'GET'
		}).then((response)=>{
			if(response.ok){
				
				//将返回结果转换成JS对象
				return response.json();
				
			}
			else{
				alert('服务器繁忙，请稍后再试！');
			}
		}).then((data)=>{
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows([])
			});
			NEWS.splice(0,NEWS.length);
			data.news.forEach(function(item){
				NEWS.push(item);
			});
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(NEWS)
			});
		}).catch((err)=>{
			alert(err);
		});
	}
	
	//切换到内容页
	_mainContent(){
		const navigator = this.props.navigator;
			if(navigator){
				navigator.push({
					name: 'ContentPage',
					component: ContentPage,
					params:{
						id: arguments[0]
					}
				})
			}
	}
	
	//渲染ListView
	_renderRow(rowData,sectionID,rowID) {
		let imgURL = (rowData.imgUrl!='')?rowData.imgUrl:'http://mat1.qq.com/news/rss/logo_news.gif';
		return (
				<View style={styles.row}>
					<TouchableHighlight onPress={this._mainContent.bind(this,rowID)} underlayColor='#C7C7C7'>
						<View style={styles.row1}>
							<Image style={styles.img} source={{uri: imgURL}} />
							<View style={styles.font}>
								<Text style={{fontSize:17}}>{rowData.title}</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
		);
	}

	render() {
		return (
			<View style={{flex:1}}>
			  <ToolbarAndroid 
				  title='  新闻热点'
				  logo={require('./img/logo.png')}
				  style={styles.toolbar}
				  actions={[{title:'refresh',icon:require('./img/refresh.jpg'),show:'always',showWithText:false}]}
				  onActionSelected={this._fetchPage.bind(this,0)}//刷新整个页面
			  />
			  {this.state.animating == true?(
			  <ActivityIndicator color='#4F4F4F' size='large' style={styles.act}/>
			  ):(
			  <View>
				<Slide />
				<ListView
					dataSource={this.state.dataSource}
					renderRow={this._renderRow.bind(this)}
					onEndReached={this._fetchListDown.bind(this)}//下拉刷新
					onEndReachedThreshold={1}
					refreshControl={		//上拉刷新
						<RefreshControl 
						enabled={true}
						refreshing={false}
						onRefresh={this._fetchListUp.bind(this)}
						/>
					}
				/>
			  </View>
			  )}
			</View>
		);
	}
}

export class LaunchPage extends Component {
	constructor(props) {
        super(props);
        this.state = {};
		
		//设置3秒延时后切换到主页
		setTimeout(() => {
			const navigator = this.props.navigator;
			if(navigator){
				navigator.push({
					name: 'MainPage',
					component: MainPage
				})
			}
		},3000);
		
    }
	render() {
		return (
		  <View style={styles.container}>
		    <Text style={styles.content}>inews</Text>
			<Image source={require('./img/LG.png')}/>
			<Text style={styles.time}>Finshed in 2017/3/10</Text>
		  </View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#48C254',
		alignItems:'center'
	},
	content: {
		color: '#FFF',
		fontWeight: '600',
		fontSize: 100,
		fontStyle: 'italic'
	},
	time: {
		color: '#FFF',
		fontWeight: '200',
		fontSize: 24,
		fontStyle: 'italic',
		fontFamily: 'Times New Roman'
	},
	toolbar: {
		backgroundColor: '#FFF',
        height: 50,
        width: width
	},
	focus: {
		width: width,
		height: 150,
	},
	row: {
		width: width,
		height: 70,
		marginBottom: 5,
	},
	row1: {
		width: width,
		height: 70,
		flexDirection: 'row',
		backgroundColor: '#FFF'
	},
	img: {
		width: 60,
		height: 60,
		margin: 5
	},
	font: {
		width: width-70,
		height: 50,
		marginTop: 10,
		marginBottom: 10
	},
	act: {
		marginTop: height/4
	},
	titleView: {
		width: width,
		height: 65,
		marginBottom: 20,
		paddingLeft: 10,
		paddingRight: 10
	},
	contentView: {
		flex: 1,
		paddingLeft: 15,
		paddingRight: 15,
		marginTop: 50
	}
});
