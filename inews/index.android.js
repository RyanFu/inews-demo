import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator
} from 'react-native';
import { LaunchPage } from './components';

class inews extends Component {
  render() {
    return (
      <Navigator 
		//初始化路由
    	initialRoute = {{name:'LaunchPage',component:LaunchPage}}
		
		//配置切换动画
		configureScene = {(route) => {
			return Navigator.SceneConfigs.FadeAndroid;
		}} 
		
		//渲染第一个页面
		//传递当前导航器对象作为props
		//{...route.params}用来将navigator对象中的params属性中的每一个key展开为props
		renderScene = {(route,navigator) => {
		    return <route.component {...route.params} navigator={navigator}/>
		}}
	  />
    );
  }
}

AppRegistry.registerComponent('inews', () => inews);