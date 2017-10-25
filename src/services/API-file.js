/**
 * Created by zjw on 2017/10/23.
 */
/**
 * Created by zjw on 2017/5/26.
 */
// const fs = require('path');
// console.log(fs);


class file {
	constructor() {
	
	}
	//遍历文件夹，获取所有文件夹里面的文件信息
	/*
	 * @param path 路径
	 *
	 */
	geFileList(path){
		let [filesList,targetObj] =[[],{}];
		this.readFile(path,filesList,targetObj);
		return filesList;
	}

	//遍历读取文件
	readFile(path,filesList,targetObj) {
		const files = fs.readdirSync(path);//需要用到同步读取
		files.forEach(walk);
		function walk(file){
			states = fs.statSync(path+'/'+file);
			if(states.isDirectory())
			{
				var item ;
				if(targetObj["children"])
				{
					item = {name:file,children:[]};
					targetObj["children"].push(item);
				}
				else
				{
					item = {name:file,children:[]};
					filesList.push(item);
				}
				
				readFile(path+'/'+file,filesList,item);
			}
			else
			{
				//创建一个对象保存信息
				var obj = new Object();
				obj.size = states.size;//文件大小，以字节为单位
				obj.name = file;//文件名
				obj.path = path+'/'+file; //文件绝对路径
				
				if(targetObj["children"])
				{
					var item = {name:file,value:obj.path}
					targetObj["children"].push(item);
				}
				else
				{
					var item = {name:file,value:obj.path};
					filesList.push(item);
				}
			}
		}
	}

	//写入文件utf-8格式
	writeFile(fileName,data){
		fs.writeFile(fileName,data,'utf-8',complete);
		function complete(){
			console.log("文件生成成功");
		}
	}
}


//导出一个对象
export default new file();
