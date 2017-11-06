/**
 * Created by zjw on 2017/10/23.
 */
/**
 * Created by zjw on 2017/5/26.
 */
const [fs,path] = [require('fs-extra'),require('path')];
const{dialog} = require('electron').remote;

// id标识文件的类型 save标识是否保存
class file {
	constructor() {
	
	}
	//遍历文件夹，获取所有文件夹里面的文件信息
	/*
	 * @param pathArray 路径数组
	 *
	 */
	getFileList(pathArray){
		let filesList = [];
		pathArray.forEach((item,index)=>{
			let rootItem , keyId ;
			keyId = this.keyIdFn(item.value,item.keyId);
			if(this.isDir(item.value)){
				rootItem = {
					name:item.name,
					value:item.value,
					children:[],
					id:1,
					save:true,
					keyId:keyId
				}
			}else{
				rootItem = {
					name:item.name,
					value:item.value,
					id:2,
					save:true,
					keyId:keyId
				}
			}
			if(this.exists(item.value) || (!this.exists(item.value) && item.name)){
				filesList.push(rootItem);
			}
		});
		
		filesList.forEach((item,index)=>{
			let targetObj = {};
			if(item.children){
				this.readFile(item.value,item.children,targetObj);
			}
		});
		console.log(JSON.stringify(filesList))
		return filesList;
	}

	//遍历读取文件
	readFile(path,filesList,targetObj) {
		const that = this;
		function walk(file){
			const states = fs.statSync(path+'/'+file);
			const filePath = path+'/'+file;
			const preId = states.ino;
			if(states.isDirectory()){
				var item ;
				if(targetObj["children"]){
					item = {name:file,children:[],value:filePath,id:1,save:true,keyId:preId};
					targetObj["children"].push(item);
				}
				else{
					item = {name:file,children:[],value:filePath,id:1,save:true,keyId:preId};
					filesList.push(item);
				}
				
				that.readFile(path+'/'+file,filesList,item);
			}else{
				//创建一个对象保存信息
				var obj = new Object();
				obj.size = states.size;//文件大小，以字节为单位
				obj.name = file;//文件名
				obj.path = path+'/'+file; //文件绝对路径
				
				if(targetObj["children"]){
					var item = {name:file,value:obj.path,id:2,save:true,keyId:preId}
					targetObj["children"].push(item);
				}
				else{
					var item = {name:file,value:obj.path,id:2,save:true,keyId:preId};
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
	
	fsReadFile(fileName,fn){
		fs.readFile(fileName,'utf-8',fn);
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
	
	// 通过路径获取文件名
	basename(filePath){
		const name = path.basename(filePath);
		return name;
	}
	
	//编辑器新建文件
	newFile (activePath,fileName,fn){
		if(activePath){
			let newFilePath = this.isDir(activePath) ?
				activePath + '/'+fileName:
				path.dirname(activePath) + '/'+fileName;
			newFilePath = this.uffixName(newFilePath);
			if(this.exists(newFilePath)){
				const stat = this.fileDetail(newFilePath);
				fn && fn({
					code:1, // 文件已经存在
					value:newFilePath,
					keyId:stat.ino
				});
			}else{
				this.writeFile(newFilePath,'',(err)=>{
					if (err) throw err;
					const stat = this.fileDetail(newFilePath);
					fn && fn({
						code:0, // 文件不存在
						value:newFilePath,
						keyId:stat.ino
					});
				});
			}
		}else{
			// 更新路径数组的vuex状态
			const keyId = this.keyIdFn(activePath);
			fn && fn({
				code:2,  // 没有路径
				value:'',
				keyId:keyId
			});
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
	filterFile (data, id) {
		const that = this;
		console.log(data)
		let newData = data.filter(x => {
			console.log(x);
			if(x.id === 1|| x.save === false){
				return true
			}
		})
		newData.forEach(x => x.children && (x.children = that.filterFile(x.children, id)))
		return newData
	}
	
	// 保存文件
	saveFile(path,name,source,fn){
		if(path){
			this.writeFile(path,source,(err)=>{
				fn && fn(err,'')
			})
		}else{
			dialog.showSaveDialog({
				defaultPath:name
			},(filename)=>{
				const filepath = filename ? filename.replace(/\\/g,'/') :'';
				if(filepath){
					this.writeFile(filepath,source,(err)=>{
						fn && fn(err,filepath)
					})
				}
			})
		}
	}
	
	
	// 保存所有文件
	saveAllHaveFile(fileData,fn){
		fileData.forEach(x => {
			if(x.children){
				this.saveAllHaveFile(x.children)
			}else{
				if(x.save === false){
					// 保存文件
					this.saveFile(x.value,x.name,'2222333',(err)=>{
						fn && fn(err);
						if(err){
							console.log('保存失败'+ x.value)
						}else{
							console.log('保存成功'+ x.value)
						}
					});
				}
			}
		})
	}
	
	saveAllNoFile(dialogFile){
		console.log(dialogFile);
		if(dialogFile.length>0){
			dialog.showSaveDialog({
				defaultPath:dialogFile[0].name
			},(filename)=>{
				const filepath = filename ? filename.replace(/\\/g,'/') :'';
				if(filepath){
					this.writeFile(filepath,'dsa222',(err)=>{
						if(err){
						
						}else{
						
						}
					})
				}
				dialogFile.splice(0,1);
				this.saveAllNoFile(dialogFile)
			})
		}
	}
	
	// 文件重命名
	renameFile(oldpath,newpath,fn){
		fs.rename(oldpath,newpath, function(err) {
			if (err) {
				throw err;
			}
			fn && fn();
		})
	}
	
	// 导入文件
	exportFile(type,fn){
		let properties;
		if(type == 'dir'){
			properties = ['openFile', 'openDirectory', 'multiSelections']
		}else if(type == 'file'){
			properties = []
		}
		dialog.showOpenDialog({
			properties:properties,
			filters:[{name: 'Custom File Type', extensions: ['js']},]
		},(filename)=>{
			const filepath = filename ? path.normalize(filename[0]).replace(/\\/g,'/') :'';
			fn && fn(filepath)
		})
	}
	
	// 更新文件的状态
	updateFile(data,obj){
		const that = this;
		data.forEach((item,index)=>{
			if(!item.children){
				if(obj.keyId == item.keyId){
					for (var key in obj){
						item[key] = obj[key]
					}
					return false;
				}
			}
		})
		data.forEach(x => x.children && (x.children = that.updateFile(x.children, obj)))
		return data;
	}
	
	// 获取文件的信息
	fileDetail(path){
		const stat = fs.statSync(path);
		return stat
	}
	
	// 获取时间戳
	timestampFn(){
		const timestamp=new Date().getTime()
		return timestamp
	}
	
	//添加文件名后缀
	uffixName(name,suffix){
		suffix = suffix || '.sol';
		name = name + suffix;
		return name;
	}
	
	keyIdFn(path,id){
		let keyId;
		if(path){
			const stat = this.fileDetail(path)
			keyId = stat.ino
		}else{
			keyId =  id || this.timestampFn();
		}
		return keyId;
	}
}


//导出一个对象
export default new file();
