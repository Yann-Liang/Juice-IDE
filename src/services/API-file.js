/**
 * Created by zjw on 2017/10/23.
 */
/**
 * Created by zjw on 2017/5/26.
 */
const [fs,path,os] = [require('fs-extra'),require('path'),require('os')];
const{dialog} = require('electron').remote;
const chokidar = require('chokidar');


// id标识文件的类型 save标识是否保存
class file {
	constructor() {
		const watcher = ''
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
					value:this.formatPath(item.value),
					children:[],
					id:1,
					save:true,
					keyId:keyId
				}
			}else{
				rootItem = {
					name:item.name,
					value:this.formatPath(item.value),
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
		filesList = this.filterFile(filesList);
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
			const str = file.substr(0,1);
			if(str.indexOf('.') == -1){
				return;
			}
			const files = fs.readdirSync(path);//需要用到同步读取
			files.forEach(walk);
		}
	}

	//异步读写文件
	readFileSync(path){
		const result = fs.readFileSync(path);
		return result;
	}
	
	
	
	copeFn(oldPath,newPath){
		fs.copy(oldPath, newPath, err => {
			if (err) return console.error(err)
		})
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
		fs.remove(path, function(err) {
			if (err) return console.error(err)
			fn && fn();
		})
	}

	// 过滤非sol文件
	filterFile (data) {
		const that = this;
		let newData = data.filter(x => {
			let a = x.name.substring(x.name.length-4);
			if(x.id === 1|| a.indexOf('.sol') !== -1){
				return true
			}
		})
		newData.forEach(x => x.children && (x.children = that.filterFile(x.children)))
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
		fileData.forEach((item,index)=>{
			this.saveFile(item.value,item.name,item.source,(err)=>{
				fn && fn(err,item);
			});
		})
	}
	saveAllNoFile(dialogFile){
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
	renameFile(oldpath,name,fn){
		name = this.isDir(oldpath) ? name : this.uffixName(name);
		const newFilePath = oldpath ? path.dirname(oldpath).replace(/\\/g,'/') + '/'+name :'';
		if(newFilePath){
			fs.rename(oldpath,newFilePath, function(err) {
				fn && fn(newFilePath,err);
			})
		}else{
			fn && fn(newFilePath);
		}
		
	}

	// 导入文件
	exportFile(type,data,fn){
		let properties;
		if(type == 'dir'){
			properties = ['openFile', 'openDirectory', 'multiSelections']
		}else if(type == 'file'){
			properties = []
		}
		dialog.showOpenDialog({
			properties:properties,
			filters:[{name: 'Custom File Type', extensions: ['sol']},]
		},(filename)=>{
			let filepath,item;
			if(filename){
				filepath = path.normalize(filename[0]).replace(/\\/g,'/');
				const keyId = this.keyIdFn(filepath);
				item = this.GetByKeyId(data,keyId);
			}else{
				filepath = '';
			}
			if(item){
				fn && fn(item)
			}else{
				fn && fn(filepath)
			}
		})
	}
	
	// 格式化路径
	formatPath(filepath){
		const iPath = filepath ? filepath.replace(/\\/g,'/') :'';
		return iPath;
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
					if(item.value){
						item.keyId = this.keyIdFn(item.value)
					}
					return false;
				}
			}
		})
		data.forEach(x => x.children && (x.children = that.updateFile(x.children, obj)))
		return data;
	}
	
	// 根据value来获取树结构的值
	GetByKeyId(Data,keyId){
		var Deep,T,F;
		for (F = Data.length;F;)
		{
			T = Data[--F]
			if (keyId === T.keyId) return T
			if (T.children)
			{
				Deep = this.GetByKeyId(T.children,keyId)
				if (Deep) return Deep
			}
		}
	}
	
	// 根据value来获取树结构的值
	GetById(Data,id){
		var Deep,T;
		var blo = true;
		for (let F = 0 ;F < Data.length;F++)
		{
			T = Data[F]
			if (id == T.id) {
				blo = false;
				return T
			}
			if (T.children && blo)
			{
				Deep = this.GetById(T.children,id)
				if (Deep) return Deep
			}
		}
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
	
	isObject(OBJ){
		return typeof OBJ == "object" && OBJ.constructor == Object;
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

	// 监听文件变化
	watchFile(pathArr,fn){
		pathArr.forEach((item,index)=>{
			if(item.value){
				this.watcher = chokidar.watch(item.value, {
					ignored: /(^|[\/\\])\../,
					persistent: true
				});
				this.watcher
					.on('add', path => {
						fn && fn({
							type:'add',
							path:this.formatPath(path),
						})
					})
					.on('addDir', path => {
						fn && fn({
							type:'addDir',
							path:this.formatPath(path),
						})
					})
					.on('change', path => {
						fn && fn({
							type:'change',
							path:this.formatPath(path),
						})
					})
					.on('unlink', path => {
						fn && fn({
							type:'unlink',
							path:this.formatPath(path),
						})
					})
					.on('unlinkDir',  path => {
						fn && fn({
							type:'unlinkDir',
							path:this.formatPath(path),
						})
					})
			}
		})

	}

	// 另存为
	saveOtherPath(activeFile,source){

	}
	
	originName(name){
		if(name.indexOf('.sol')){
			name = name.substr(0,name.length-4);
			return name;
		}else{
			return name;
		}
	}
	
	//获取当前用户的home目录,返回默认新建文件夹地址；
	homeDirFn(){
		const homedirPath = os.homedir().replace(/\\/g,'/') + '/juice-temp';
		return homedirPath;
	}
	
	//创建文件夹
	newDirFn(tempPath,fn){
		fs.mkdir(tempPath,(err)=>{
			if (err) throw err;
			fn && fn();
		});
	}
	
	
	// 创建临时目录
	creatTempDir(name,fn){
		const tempPath = this.homeDirFn();
		const dirPath = tempPath + '/' + name;
		if(this.isDir(tempPath)){
			this.newDirFn(dirPath,fn)
		}else{
			this.newDirFn(tempPath,()=>{
				this.newDirFn(dirPath,fn)
			})
		}
	}
	
	// 获取上一级文件夹目录
	dirnameFn(activePath){
		const dirnamePath = path.dirname(activePath).replace(/\\/g,'/');
		return dirnamePath;
	}
	
	// 获取选取文件的路径
	dialogFn(fn){
		dialog.showOpenDialog({
			properties:['openDirectory', 'multiSelections']
		},(filename)=>{
			const filepath = filename ? filename[0].replace(/\\/g,'/') :'';
			console.log(filepath)
			fn && fn(filepath);
		})
	}
	
	// 删除数组的某一项
	deleteArrItem(arr,delItem){
		const newArr = arr.filter((item,index)=>{
			return item.keyId !== delItem.keyId;
		})
		return newArr;
	}
	
	//获取solc路径
	getTemplatePath(name) {
		const app = require('electron').remote.app;
		let exmPath = path.join(__static,'..',`src/services/compile-exe/solcs/${name}`);
		exmPath = this.formatPath(exmPath);
		return process.env.NODE_ENV === 'development' ? exmPath : path.join(app.getPath('exe'), '..', `/solcs/${name}`);
	}
}


//导出一个对象
export default new file();
