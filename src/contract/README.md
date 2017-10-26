# 矩阵元区块链智能合约开发指南

# 1 适用范围

本规范描述了矩阵元区块链系统智能合约的开发约束与规范，用以指导DAPP开发者按照本规范开发基于矩阵元区块链运行的应用。

# 2 术语解释

|术语|术语解释|
|------|------------|
|DAPP|去中心化应用|
|Truffle|智能合约开发IDE|

# 3 Quick Start

本章节描述一个简单的智能合约开发样例，用以描述基于矩阵元区块链的智能合约开发标准与规范。给DAPP应用的开发提供参考。

## 3.1 合约功能描述

此合约开发用例用来管理学生数据，并给不同用户分配不同的数据处理权限，实现数据
的访问控制。

## 3.2 合约规划与列表说明

### 3.2.1 合约存储规划

学生数据在合约的存储属性为：

|id|学生id(对应于钱包地址)|
|------|------------|
|name|学生名字|
|classId|学生所属班级id|
|status|标记学生数据是否开除： 0 未开除 1 已开除|

### 3.2.2 合约接口规划

```bash
//新增学生
func addStudent(string _studentJson) public returns{};

//开除学生
func deleteStudentById0(string id) public{};

//根据Id查询用户
func findStudentById(string id) constant public returns{};
```

### 3.2.3 合约权限规划

|角色列表|角色具有的权限|
|------|------------|
|校长|deleteStudentById, addStudent, findStudentById|
|班主任|addStudent, findStudentById|
|学生|findStudentById|

### 3.2.4 合约文件规划

LibStudent.sol: 学生的数据结构合约；

StudentManager.sol: 实现对学生数据的各种处理；

ModuleManager.sol: 实现对合约、角色、权限的模块化处理。

## 3.3 合约代码样例

### LibStudent.sol:
```bash
pragma solidity ^0.4.2;

import "LibInt.sol";
import "LibString.sol";
import "LibJson.sol";

library LibStudent {
    using LibJson for *;
    using LibString for *;
    using LibInt for *;
    using LibStudent for *;     //引入库的语法

    //student对象结构体
    struct Student{
         address     id;        //学生Id  
         string      name;      //学生名称
         string      classId;   //学生班级Id      
         uint        status;    //学生状态 0 未开除 1 开除
    }     
   
    //将student对象转换成json字符串
    function toJson(Student storage _self) internal returns(string _strjson){
        _strjson = "{";
        string memory strAddr = "0x";
        strAddr  = strAddr.concat(_self.id.addrToAsciiString());
        _strjson = _strjson.concat(strAddr.toKeyValue("id"), ",")
        _strjson = _strjson.concat(_self.name.toKeyValue("name"), ",");
        _strjson = _strjson.concat(_self.classId.toKeyValue("classId"), ",");
        _strjson = _strjson.concat(uint(_self.status).toKeyValue("status"), " ");
        _strjson = _strjson.concat("}");
     }

    //从student的json字符串中提取相应值
    function fromJson(Student storage _self, string _stuJson) internal returns(bool) {
         _self.clear();

        string memory strAddr = _stuJson.getStringValueByKey("id");
        strAddr = _stuJson.getStringValueByKey("id");
        _self.id= strAddr.toAddress();
        _self.name = _stuJson.jsonRead("name");
        _self.classId= _stuJson.jsonRead("classId");
        _self.status = _stuJson.jsonRead("status").toUint();
        return true;
     }

    //将student对象置空
    function clear(Student storage _self) internal {
        _self.id= address(0);
        _self.name = ""; 
        _self.classId= "";
        _self.status = 1;
    }

    //重置student对象
    function reset(Student storage _self) internal {
        clear(_self);
        _self.clear();
    }
}
```

### StudentManager.sol:
```bash
pragma solidity ^0.4.2;

import "LibStudent.sol";
import "LibString.sol";
import "LibInt.sol";

contract StudentManager {
 
    using LibStudent for *;
    using LibString for *;
    using LibInt for *;                         //引入所需库合约

    event Notify(uint _errno, string _info);    //定义事件处理
    
    //此mapping对象将地址映射到对象本身
    mapping(address=>LibStudent.Student)       studentMap;
    address[]                                  addrList;
    address[]                                  tempList;

    LibStudent.Student internal                student;
    string[]                                   tmpArray;

    //错误码定义
    enum StudentError {
        NO_ERROR,
        BAD_PARAMETER,
        NAME_EMPTY,
        CLASS_NOT_EXISTS,
        STUDENT_NOT_EXISTS
    }

    uint errno = 0;

    //构造函数
    function StudentManager() {
    }

     //新增学生
    function addStudent(string _studentJson) public returns(uint) {
        log("insert", "StudentManager");

        if (student.fromJson(_studentJson) == false) {
            log("insert bad json", "StudentManager");
            errno = 9000 + uint(StudentError.BAD_PARAMETER);
            Notify(errno, "insert bad json");
            return errno;
        }

        if (student.name.equals("")) {
            log("student name is invalid", "StudentManager");
            errno = 9000 + uint(StudentError.NAME_EMPTY);
            Notify(errno, "student name is invalid");
           return errno;
        }

        if (student.classId.equals("")) {
            log("student classId is invalid", "StudentManager");
            errno = 9000 + uint(StudentError.CLASS_NOT_EXISTS);
            Notify(errno, "student classId is invalid");
           return errno;
        }

        student.status = uint(0);

        studentMap[student.id] = student;
        addrList.push(student.id);

        errno = uint(StudentError.NO_ERROR);

        log("add a student succcess", "StudentManager");
        Notify(errno, "insert a student succcess");
        student.reset();
        return errno;
    }

    //根据学生Id查找学生
    function findStudentById(address _id) constant public returns(string _ret) {
        _ret = "{\"ret\":0,\"data\":{"; 

        if (studentMap[_id].status != 1) {
            _ret = _ret.concat(studentMap[_id].toJson());
        } else {
            _ret = _ret.concat(""));
        }
        _ret = _ret.concat("}}");
    }

    //根据学生Id删除学生
    function deleteStudentById(address _id) public {

        if (studentMap[_id].status == 1) {
            log("student not exists: ", _id);
            errno = 9000 + uint(StudentError.STUDENT_NOT_EXISTS);
            Notify(errno, "student not exists");
            return;
        } 
        delete tempList;
        for (uint i = 0; i < addrList.length; i++)  {
            if(_id == studentMap[addrList[i]].id) {
                continue;
            }
            else {
                tempList.push(addrList[i]);
            }
        }

        delete addrList;
        for (uint j = 0; j < tempList.length; ++j) {
            addrList.push(tempList[j]);
        }

        studentMap[_id].status = 1;
        Notify(errno, "fire student success");
    }
}
```

### ModuleManager.sol:
```bash
pragma solidity ^0.4.2;

import "LibModule.sol";
import "LibContract.sol";
import "BaseModule.sol";

contract ModuleManager is BaseModule{
    
    //构造module对象
    LibModule.Module      tmpModule;
    
    //构造contract对象
    LibContract.Contract tmpContract;

    //构造函数，发布入链即自动执行
    func ModuleManager(){
        register("ModuleManager","0.0.1.0");
        tmpModule.reset();
        string[] memory tmpArr;

        tmpModule = LibModule.Module({moduleId:"systemModule001",moduleName:"系统模块",moduleVersion:"0.0.1.0",deleted:false,moduleEnable:1,moduleDescription:"系统模块管理",moduleCreateTime:nowTime,moduleUpdateTime:nowTime,moduleCreator:msg.sender,contractIdList:tmpArr,roleIds:tmpArr});
        addModule(tmpModule);    //添加此模块
        initContractData();      //添加合约
        initActionData();        //添加权限
        initRoleData();          //添加角色

    }
    
    //添加合约数据
    func initContractData() private returns(uint){
        address userAddr = rm.getContractAddress("UserManager","0.0.1.0");
        tmpContract.moduleId = sysModuleId;
        tmpContract.cctId = innerContractMapping["UserManager"];
        tmpContract.cctName = "用户管理"; 
        tmpContract.cctVersion = "0.0.1.0"; 
        tmpContract.deleted = false;
        tmpContract.enable = 1;
        tmpContract.description = "用户管理合约";
        tmpContract.createTime = nowTime;
        tmpContract.updateTime = nowTime;
        tmpContract.creator = msg.sender;
        tmpContract.cctAddr = userAddr;
        addContract(tmpContract.toJson());
        return 1;
    }

    //添加权限数据
    func initActionData() private returns(uint){
        string memory actionStr = "";
        
        //权限数据对象     
        jsonStr="{\"id\":\"action1000\",\"moduleId\":\"module001\",\"name\":\"addStudent\",\"resKey\":\"StudentManager\",\"opKey\":\"addStudent(string)\"}";
        addAction(jsonStr);
        jsonStr="{\"id\":\"action1001\",\"moduleId\":\"module001\",\"name\":\"findStudentById\",\"resKey\":\"StudentManager\",\"opKey\":\"findStudentById(string)\"}";
        addAction(jsonStr);
        jsonStr="{\"id\":\"action1002\",\"moduleId\":\"module001\",\"name\":\"deleteStudentById\",\"resKey\":\"StudentManager\",\"opKey\":\"deleteStudentById(string)\"}";
        addAction(jsonStr);
        return 1;
    }
    
    //添加角色数据
    func initRoleData() private returns(uint){
        string memory roleJsonStr="";
       
       //角色数据对象
        roleJsonStr="{\"id\":\"role1000\",\"name\":\"校长\",\"status\":1,\"moduleId\":\"systemModule001\",\"actionIdList\":[\"action1000\",\"action1001\",\"action1002\"]}";
        addRole(roleJsonStr);
        roleJsonStr="{\"id\":\"role1001\",\"name\":\"班主任\",\"status\":1,\"moduleId\":\"systemModule001\",\"actionIdList\":[\"action1000\",\"action1001\"]}";
        addRole(roleJsonStr);
        roleJsonStr="{\"id\":\"role1002\",\"name\":\"学生\",\"status\":1,\"moduleId\":\"systemModule001\",\"actionIdList\":[\"action1001\",]}";
        addRole(roleJsonStr);
        return 1;
    }
}
```

## 3.4 合约编译发布

### 3.4.1 前提要求

本地矩阵元区块链平台已经启动运行。
矩阵元区块链平台搭建请参考《矩阵元区块链环境安装部署》文档；

本地已搭建好Truffle环境。
Truffle编译发布环境搭建请参考《矩阵元区块链Truffle环境搭建》文档。

### 3.4.2 合约编译与发布

#### 1）Truffle环境初始化
```bash
新建合约目录DAPP
在新建的合约目录DAPP下执行truffle init初始化目录结构

修改truffle.js文件中RPC地址为平台地址
删除示例合约ConvertLib.sol，MetaCoin.sol，Migrations.sol
```

#### 2）上传应用智能合约
```bash
将编写的上述智能合约上传到truffle init生成目录结构下的contract中
```

#### 3）合约编译
```bash
在新建的Dapp目录下执行命令truffle compile完成合约的编译
```

#### 4）合约发布
```bash
修改部署配置文件：
在migrations目录下修改migrations/1_initial_migration.js
注释掉deployer.deploy(Migrations);

在migrations目录下修改migrations/2_deploy_contracts.js
添加自己要发布的合约，例：
module.exports = function(deployer) {
    deployer.deploy(StudentManager);
    deployer.deploy(ModuleManager);
};

在新建的Dapp目录下执行命令truffle migrate完成合约的发布。
```

### 3.4.3 合约测试

进入truffle控台： truffle console

实例化待测合约对象，如StudentManager.sol
```bash
> var stu = StudentManager.deployed();
undefined
```
或者：
```bash
> var stu = StudentManager.at(“0x002b4f09741a896e757f276d8f5f0c24bca870bf”);
undefined
```
注：该处此地址为合约发布时输出的对应地址。

调用合约函数：
```bash
> stu.addStudent(‘{“id”: “0x006d8f5f0c24bca870bf2b4f09741a896e757f27”, “name”: “juzix”,     “classId”: “SuperClass”,“status”: 0}’);
“0x00aa1676c77bb7861ef115652715671880aa1677”
```
```bash
> stu.findStudentById(“0x006d8f5f0c24bca870bf2b4f09741a896e757f27”);
‘{“id”: “0x006d8f5f0c24bca870bf2b4f09741a896e757f27”, “name”: “juzix”, “classId”: “SuperClass”,“status”: 0}’
```

```bash
> stu.deleteStudentById(“0x006d8f5f0c24bca870bf2b4f09741a896e757f27”);
“0x5652715671880aa00aa1676c77bb7861ef11ba21”
```

# 4 系统合约接口说明
系统Library库合约以及系统合约接口说明请参考[智能合约开发指南_矩阵元区块链](http://192.168.9.66/Juzix-ethereum/inner-contracts/blob/develop/docs)文档

## 4.3 系统角色与权限说明

系统内置四种角色以及每个角色对应的权限，分别为：节点管理员、链管理员、系统管理员、权限管理员，每个角色为相关合约下的所有接口，四大角色所有权限如下：

|角色名称|**节点管理员**| |
|------|------|----------|
|角色权限|权限描述|四大合约权限以及节点信息管理权限|
|   |所有权限|UserManager, DepartmentManager, ActionManager, RoleManager, NodeInfoManager|
|角色名称|**链管理员**| |
|角色权限|权限描述|四大合约权限、链文件以及节点申请权限|
|   |所有权限|UserManager, DepartmentManager, ActionManager, RoleManager, NodeApplyManager, FileInfoManager, FileServerManager|
|角色名称|**系统管理员**| |
|角色权限|权限描述|四大合约权限以及系统配置权限|
|   |所有权限|UserManager, DepartmentManager, ActionManager, RoleManager, SystemConfig|
|角色名称|**权限管理员**| |
|角色权限|权限描述|机构、用户、角色权限管理员，四大合约权限以及权限控制|
|   |所有权限|UserManager, DepartmentManager, ActionManager, RoleManager, RoleFilterManager|

# 5 合约业务开发流程介绍

使用智能合约开发业务，需按照以下5个步骤进行：

1）完成合约基础数据的处理；

2）实现注册合约；

3）定义业务数据的结构，并实现对业务数据的处理；

4）根据接口文档实现业务合约的业务逻辑；

5）模块化管理。

流程详情请参考[智能合约开发指南_矩阵元区块链](http://192.168.9.66/Juzix-ethereum/inner-contracts/blob/develop/docs)文档