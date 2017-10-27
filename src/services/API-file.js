/**
 * Created by zjw on 2017/10/23.
 */
/**
 * Created by zjw on 2017/5/26.
 */
const [fs,path] = [require('fs-extra'),require('path')];


class file {
	constructor() {
	
	}
	//遍历文件夹，获取所有文件夹里面的文件信息
	/*
	 * @param path 路径
	 *
	 */
	getFileList(path){
		let filesList = [{
			name:path,
			value:path,
			children:[]
		}]
		let targetObj = {}
		this.readFile(path,filesList[0].children,targetObj);
		console.log(JSON.stringify(filesList))
		return filesList;
	}

	//遍历读取文件
	readFile(path,filesList,targetObj) {
		const that = this;
		function walk(file){
			const states = fs.statSync(path+'/'+file);
			const filePath = path+'/'+file;
			if(states.isDirectory()){
				var item ;
				if(targetObj["children"]){
					item = {name:file,children:[],value:filePath,save:true};
					targetObj["children"].push(item);
				}
				else{
					item = {name:file,children:[],value:filePath,save:true};
					filesList.push(item);
				}
				
				that.readFile(path+'/'+file,filesList,item);
			}
			else{
				//创建一个对象保存信息
				var obj = new Object();
				obj.size = states.size;//文件大小，以字节为单位
				obj.name = file;//文件名
				obj.path = path+'/'+file; //文件绝对路径
				
				if(targetObj["children"]){
					var item = {name:file,value:obj.path,save:true}
					targetObj["children"].push(item);
				}
				else{
					var item = {name:file,value:obj.path,save:true};
					filesList.push(item);
				}
			}
		}
		if(this.isDir(path)){
			const files = fs.readdirSync(path);//需要用到同步读取
			files.forEach(walk);
		}
	}

	//写入文件utf-8格式
	writeFile(fileName,data,fn){
		fs.writeFile(fileName,data,'utf-8',fn);
	}
	
	// 文件是否存在
	exists(filePath){
		return fs.existsSync(filePath);
	}
	
	// 是不是文件
	isFile(path){
		return this.exists(path) && fs.statSync(path).isFile();
	}
	
	// 是不是文键夹
	isDir(path){
		return this.exists(path) && fs.statSync(path).isDirectory();
	}
	
	//编辑器新建文件
	newFile (activePath,fileName,fn){
		if(activePath){
			const newFilePath = this.isDir(activePath) ?
				activePath + '/'+fileName+'.sol':
				path.dirname(activePath) + '/'+fileName+'.sol';
			console.log(newFilePath);
			if(this.exists(newFilePath)){
				fn && fn({
					code:1  // 文件已经存在
				});
			}else{
				this.writeFile(newFilePath,'',(err)=>{
					if (err) throw err;
					fn && fn({
						code:0  // 文件不存在
					});
				});
			}
		}else{
			console.log('待定')
		}
	}
	
	//编辑器新建文件夹
	newMkdir(activePath,fileName,fn){
		if(activePath){
			const newFilePath = this.isDir(activePath) ?
				activePath + '/'+fileName :
				path.dirname(activePath) + '/'+fileName;
			if(this.exists(newFilePath)){
				fn && fn({
					code:1  // 文件已经存在
				});
			}else{
				fs.mkdir(newFilePath,(err)=>{
					if (err) throw err;
					fn && fn({
						code:0  // 文件不存在
					});
				});
			}
		}else{
			console.log('待定')
		}
	}
	
	//删除文件
	removeFile(path,fn){
		console.log(path);
		fs.remove(path, function(err) {
			if (err) return console.error(err)
			fn && fn();
		})
	}
	
	// 过滤未保存的文件
	filterFile(path){
	
	}
}


//导出一个对象
export default new file();
