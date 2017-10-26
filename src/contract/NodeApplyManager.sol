/**
 * @file NodeApplyManager.sol
 * @author Jungle
 * @time 2017-4-13 22:16:20
 * @desc 节点申请信息管理合约
 *
 *
 */
pragma solidity ^0.4.2;

import "./sysbase/OwnerNamed.sol";
import "./library/LibNodeApply.sol";

import "./interfaces/IDepartmentManager.sol";
import "./interfaces/IUserManager.sol";
import "./interfaces/INodeInfoManager.sol";
import "./interfaces/INodeApplyManager.sol";

contract NodeApplyManager is OwnerNamed, INodeApplyManager {

	// 对象库挂载
	using LibString for *;
	using LibInt for *;
	using LibJson for *;
	using LibNodeApply for *;

	// 存储数据结构
	LibNodeApply.NodeApply[] nodeApplys;		// 存储所有申请信息
	LibNodeApply.NodeApply[] tmpNodeApplys;		// 临时存储申请细信息
	LibNodeApply.NodeApply tmpNodeApply;		// 临时转换申请信息
	LibNodeApply.AuditData tmpAuditData;
	uint revision;

	event Notify(uint _error,string _info);

	// defind errorcode for enum , start 0
	enum NodeApplyError {
		NO_ERROR,
        JSON_INVALID,
        PARAMS_ILLEGAL,
        ID_CONFLICTED,
        COMMON_NAME_CONFLICTED,
        ACCOUNT_CONFLICTED,
        ID_NOT_EXISTS,
        NO_PERMISSION,
        STATE_EXCEPTION,
        ADDR_EXCEPTION,
        EMAIL_EXISTS,
        MOBILE_EXISTS
	}

	function NodeApplyManager() {
		revision = 0;
		register("SystemModuleManager","0.0.1.0","NodeApplyManager","0.0.1.0");
	}

	function insert(string _json) public returns(uint){
		log("insert->into insert function ...");
		log("insert->time",now);
		log("insert->address:",this);
		log("insert->owner:",owner);
		log("insert->msg.sender", msg.sender);
		log("insert->paramsjson:",_json);
		log("insert->tx.origin",tx.origin);
		uint errno_prefix = 95270;
		if(!tmpNodeApply.fromJson(_json)){
			log("insert->json invalid ");
			errno = uint256(NodeApplyError.JSON_INVALID);
			Notify(errno,"json invalid");
			return errno;
		}
		// 验证申请信息的有效性
		if(bytes(tmpNodeApply.id).length == 0){
			log("insert->id is empty...");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"apply id is empty");
			return errno;
		}
		if(tmpNodeApply.state != uint256(LibNodeApply.ApplyState.APPLY_INIT)){
			log("insert->state is not right,maybe the current state is 0...");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"the state is not a proper state");
			return errno;
		}

		// check applyDepartment params is validity
		if(bytes(tmpNodeApply.applyDepartment.commonName).length == 0){
			log("insert->commonName is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"commonName is empty");
			return errno;
		}
		if(bytes(tmpNodeApply.applyDepartment.name).length == 0){
			log("insert->name is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"name is empty of department...");
			return errno;
		}
		if(bytes(tmpNodeApply.applyDepartment.id).length == 0){
			log("insert->id is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"id is empty of department...");
			return errno;
		}
		if(bytes(tmpNodeApply.applyDepartment.stateName).length == 0){
			log("insert->stateName is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"stateName is empty of department...");
			return errno;
		}
		
		// check applyUser params is validity
		if(bytes(tmpNodeApply.applyUser.account).length == 0){
			log("insert->account is empty...");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"applyUser:account is empty");
			return errno;
		}
		if(bytes(tmpNodeApply.applyUser.mobile).length == 0){
			log("insert->mobile is empty...");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"applyUser:mobile is empty");
			return errno;
		}
		if(tmpNodeApply.applyUser.userAddr == address(0)){
			log("insert->userAddr is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"userAddr is empty");
			return errno;
		}

		// check applyNodeInfo 
		if(bytes(tmpNodeApply.applyNodeInfo.nodeId).length == 0) {
			log("insert->nodeId is null..");
            errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
            Notify(errno, "nodeId is null..");
            return errno;
		}
		if(bytes(tmpNodeApply.applyNodeInfo.nodeName).length == 0) {
			log("insert->nodeName is null..");
            errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
            Notify(errno, "nodeName is null..");
            return errno;
		}
		if(getIndexByNodeName(tmpNodeApply.applyNodeInfo.nodeName) != uint(-1)) {
			log("insert->nodeName conflicted");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"nodeName conflicted");
			return errno;
		}
		if(getIndexByNodeId(tmpNodeApply.applyNodeInfo.nodeId) != uint(-1)) {
			log("insert->nodeId conflicted");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"nodeId conflicted");
			return errno;
		}
		if(getIndexByNodePubkey(tmpNodeApply.applyNodeInfo.pubkey) != uint(-1)) {
			log("insert->nodeInfo pubkey conflicted");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno,"nodeInfo pubkey conflicted");
			return errno;
		}

		// check nodeIP info 
		for(uint i = 0 ; i < tmpNodeApply.applyNodeIPList.length; ++i){
			if(bytes(tmpNodeApply.applyNodeIPList[i].ip).length == 0){
				log("insert->nodeIP ip format invalid");
				errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
				Notify(errno,"nodeIP ip format invalid");
				return errno;
			}
			if(tmpNodeApply.applyNodeIPList[i]._type == uint(1) || tmpNodeApply.applyNodeIPList[i]._type == uint(0)){
				if(tmpNodeApply.applyNodeIPList[i].RPCPort == 0 
					|| tmpNodeApply.applyNodeIPList[i].RPCPort > 0xFFFF
					|| tmpNodeApply.applyNodeIPList[i].TPort == 0 
					|| tmpNodeApply.applyNodeIPList[i].TPort > 0xFFFF
					|| tmpNodeApply.applyNodeIPList[i].P2PPort == 0 
					|| tmpNodeApply.applyNodeIPList[i].P2PPort > 0xFFFF){

					log("insert->nodeIP port format invalid");
					errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
					Notify(errno,"nodeIP port format invalid");
					return errno;
				}
			}
		}

		// check necessary condition for node apply
		if(getIndexById(tmpNodeApply.id) != uint(-1)) {
			log("insert->id conflicted");
			errno = errno_prefix + uint256(NodeApplyError.ID_CONFLICTED);
			Notify(errno,"id conflicted");
			return errno;
		}

		IUserManager um = IUserManager(rm.getContractAddress("SystemModuleManager","0.0.1.0","UserManager","0.0.1.0"));
		uint errnoResp = um.userExists(tmpNodeApply.applyUser.userAddr);
		if(errnoResp == 1){
			// 用户存在，不验证邮箱唯一性
			log("user already exists, not verified","NodeApplyManager");
		} else {
			log("user not exists,do insert..","NodeApplyManager");
			// 用户不存在，判断邮箱唯一性
			uint usrCode = um.checkEmailUniqueness(tmpNodeApply.applyUser.email, tmpNodeApply.applyUser.mobile);
            if (usrCode == 1) {
                log("email aready exists", "NodeApplyManager");
                errno = 15200 + uint(NodeApplyError.EMAIL_EXISTS);
                Notify(errno, "email aready exists");
                return errno;
            }
            if(usrCode == 2){
            	 log("mobile aready exists", "NodeApplyManager");
                errno = 15200 + uint(NodeApplyError.MOBILE_EXISTS);
                Notify(errno, "mobile aready exists");
                return errno;
            }
        }
		// apply for user condition
		/*if(getIndexByAccount(tmpNodeApply.applyUser.account) != uint(-1)){
			log("insert->account conflicted");
			errno = errno_prefix + uint256(NodeApplyError.ACCOUNT_CONFLICTED);
			Notify(errno,"account conflicted");
			return errno;
		}*/

		// set time params
		tmpNodeApply.createTime = now * 1000;
		tmpNodeApply.applyTime = now * 1000;
		tmpNodeApply.updateTime = now * 1000;
		tmpNodeApply.creator = tx.origin;
		tmpNodeApply.state = uint(1);

		// save apply info
		nodeApplys.push(tmpNodeApply);
		errno = uint256(NodeApplyError.NO_ERROR);
		revision++;
		log("insert success","NodeApplyManager");
		Notify(errno,"NodeApplyManager insert success");
		return errno;
	}

	function update(string _json) public returns(uint){
		log("update->into update function...","NodeApplyManager");
		log("update->time:",now);
		// contract address
		log("update->address:",this);
		log("update->tx.origin:",tx.origin);
		log("update->owner:",owner);
		log("update->msg.sender:",msg.sender);
		uint errno_prefix = 95270;

		if(!tmpNodeApply.fromJson(_json)){
			log("update->invalid json params","NodeApplyManager");
            errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
            Notify(errno, "json invalid");
            return errno;
		}
		uint index = getIndexById(tmpNodeApply.id);
		if(index == uint(-1)){
			log("update->nodeApply id is not exists");
			errno = errno_prefix + uint256(NodeApplyError.ID_NOT_EXISTS);
			Notify(errno,"nodeapply id is not exists");
			return errno;
		}
		string memory _tmpStr ;
		// check department data is validity
		if(_json.keyExists("applyDepartment")){
			_tmpStr = _json.getObjectValueByKey("applyDepartment");
			if(_tmpStr.keyExists("commonName") && bytes(tmpNodeApply.applyDepartment.commonName).length != 0){
				uint commonNameIndex = getIndexByCommonName(tmpNodeApply.applyDepartment.commonName);
				if(commonNameIndex != uint(-1) && commonNameIndex != index){
					log("update->commonName conflicted","NodeApplyManager");
					errno = errno_prefix + uint256(NodeApplyError.COMMON_NAME_CONFLICTED);
					Notify(errno,"NodeApplyManager update commondName conflicted");
					return errno;
				}
			}
		}
		
		// check user data is validity
		if(_json.keyExists("applyUser")){
			_tmpStr = _json.getObjectValueByKey("applyUser");
			if(_tmpStr.keyExists("account") && bytes(tmpNodeApply.applyUser.account).length != 0){
				uint accountIndex = getIndexByAccount(tmpNodeApply.applyUser.account);
				if(accountIndex != uint(-1) && accountIndex != index){
					log("update->account conflicted");
					errno = errno_prefix + uint256(NodeApplyError.ACCOUNT_CONFLICTED);
					Notify(errno,"NodeApplyManager account conflicted");
					return errno;
				}
			}
		}

		if(_json.keyExists("applyNodeInfo")) {
			_tmpStr = _json.getObjectValueByKey("applyNodeInfo");
			if(_tmpStr.keyExists("nodeName") && bytes(tmpNodeApply.applyNodeInfo.nodeName).length != 0) {
				if(getIndexByNodeName(tmpNodeApply.applyNodeInfo.nodeName) != uint(-1)) {
					log("update->nodeName conflicted");
					errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
					Notify(errno,"nodeName conflicted");
					return errno;
				}
			}
			if(_tmpStr.keyExists("nodeId") && bytes(tmpNodeApply.applyNodeInfo.nodeId).length != 0) {
				if(getIndexByNodeId(tmpNodeApply.applyNodeInfo.nodeId) != uint(-1)) {
					log("update->nodeId conflicted");
					errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
					Notify(errno,"nodeId conflicted");
					return errno;
				}
			}
			if(_tmpStr.keyExists("pubkey") && bytes(tmpNodeApply.applyNodeInfo.pubkey).length != 0) {
				if(getIndexByNodePubkey(tmpNodeApply.applyNodeInfo.pubkey) != uint(-1)) {
					log("update->nodeInfo pubkey conflicted");
					errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
					Notify(errno,"nodeInfo pubkey conflicted");
					return errno;
				}
			}
		}

		// check nodeIPList 
		if(_json.keyExists("applyNodeIPList")) {
			// check nodeIP info 
			for(uint i = 0 ; i < tmpNodeApply.applyNodeIPList.length; ++i){
				if(bytes(tmpNodeApply.applyNodeIPList[i].ip).length == 0){
					log("insert->nodeIP ip format invalid");
					errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
					Notify(errno,"nodeIP ip format invalid");
					return errno;
				}
				if(tmpNodeApply.applyNodeIPList[i]._type == uint(1)
					|| tmpNodeApply.applyNodeIPList[i]._type == uint(0)){
					if(tmpNodeApply.applyNodeIPList[i].RPCPort == 0 
						|| tmpNodeApply.applyNodeIPList[i].RPCPort > 0xFFFF
						|| tmpNodeApply.applyNodeIPList[i].TPort == 0 
						|| tmpNodeApply.applyNodeIPList[i].TPort > 0xFFFF
						|| tmpNodeApply.applyNodeIPList[i].P2PPort == 0 
						|| tmpNodeApply.applyNodeIPList[i].P2PPort > 0xFFFF){

						log("insert->nodeIP port format invalid");
						errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
						Notify(errno,"nodeIP port format invalid");
						return errno;
					}
				}
			}
		}

		// set new value
		if(_json.keyExists("applyDepartment")){
			log("update->The key of applyDepartment exists...","NodeApplyManager");
			string memory _department = _json.getObjectValueByKey("applyDepartment");
			//TODO: 需要验证
			if(_department.keyExists("name") && bytes(tmpNodeApply.applyDepartment.name).length != 0){
				nodeApplys[index].applyDepartment.name = tmpNodeApply.applyDepartment.name;
			}
			/* if(_department.keyExists("serialNum")){
				nodeApplys[index].applyDepartment.serialNum = tmpNodeApply.applyDepartment.serialNum;
			} */
			if(_department.keyExists("description") && bytes(tmpNodeApply.applyDepartment.description).length != 0){
				nodeApplys[index].applyDepartment.description = tmpNodeApply.applyDepartment.description;
			}
			if(_department.keyExists("commonName") && bytes(tmpNodeApply.applyDepartment.commonName).length != 0){
				nodeApplys[index].applyDepartment.commonName = tmpNodeApply.applyDepartment.commonName;
			}
			if(_department.keyExists("stateName") && bytes(tmpNodeApply.applyDepartment.stateName).length != 0){
				nodeApplys[index].applyDepartment.stateName = tmpNodeApply.applyDepartment.stateName;
			}
			if(_department.keyExists("countryName") && bytes(tmpNodeApply.applyDepartment.countryName).length != 0){
				nodeApplys[index].applyDepartment.countryName = tmpNodeApply.applyDepartment.countryName;
			}
			/* if(_department.keyExists("email") && bytes(tmpNodeApply.applyDepartment.email).length != 0){
				nodeApplys[index].applyDepartment.email = tmpNodeApply.applyDepartment.email;
			} */
			/* if(_department.keyExists("type")){
				nodeApplys[index].applyDepartment._type = tmpNodeApply.applyDepartment._type;
			} */
			if(_department.keyExists("admin")){
				nodeApplys[index].applyDepartment.admin = tmpNodeApply.applyDepartment.admin;
			}
		}else{
			delete tmpNodeApply.applyDepartment;
		}

		//
		if(_json.keyExists("applyUser")){
			log("update->The key of applyUser exists...","NodeApplyManager");
			string memory _userStr = _json.getObjectValueByKey("applyUser");
			if(_userStr.keyExists("account") && bytes(tmpNodeApply.applyUser.account).length != 0){
				nodeApplys[index].applyUser.account = tmpNodeApply.applyUser.account;
			}
			if(_userStr.keyExists("departmentId") && bytes(tmpNodeApply.applyUser.departmentId).length != 0){
				nodeApplys[index].applyUser.departmentId = tmpNodeApply.applyUser.departmentId;
			}

			if(_userStr.keyExists("email") && bytes(tmpNodeApply.applyUser.email).length != 0){
				nodeApplys[index].applyUser.email = tmpNodeApply.applyUser.email;
			}
			if(_userStr.keyExists("mobile") && bytes(tmpNodeApply.applyUser.mobile).length != 0){
				nodeApplys[index].applyUser.mobile = tmpNodeApply.applyUser.mobile;
			}
			if(_userStr.keyExists("name") && bytes(tmpNodeApply.applyUser.name).length != 0){
				nodeApplys[index].applyUser.name = tmpNodeApply.applyUser.name;
			}
			if(_userStr.keyExists("cipherGroupKey")&& bytes(tmpNodeApply.applyUser.cipherGroupKey).length != 0){
				nodeApplys[index].applyUser.cipherGroupKey = tmpNodeApply.applyUser.cipherGroupKey;
			}
			/* if(_userStr.keyExists("sex")){
				nodeApplys[index].applyUser.sex = tmpNodeApply.applyUser.sex;
			} */
			if(_userStr.keyExists("userAddr")){
				nodeApplys[index].applyUser.userAddr = tmpNodeApply.applyUser.userAddr;
			}
			//nodeApplys[index].applyUser.updateTime = uint(now) * 1000;
			//TODO: cipherGroupKey publicKey
		}

		if(_json.keyExists("applyNodeInfo")) {
			log("update-> upp applyNodeInfo ...");
			_tmpStr = _json.getObjectValueByKey("applyNodeInfo");
			if(_tmpStr.keyExists("nodeName") && bytes(tmpNodeApply.applyNodeInfo.nodeName).length != 0) {
				nodeApplys[index].applyNodeInfo.nodeName = tmpNodeApply.applyNodeInfo.nodeName;
			}
			if(_tmpStr.keyExists("nodeId") && bytes(tmpNodeApply.applyNodeInfo.nodeId).length != 0) {
				nodeApplys[index].applyNodeInfo.nodeId = tmpNodeApply.applyNodeInfo.nodeId;
			}
			if(_tmpStr.keyExists("nodeDescription") && bytes(tmpNodeApply.applyNodeInfo.nodeDescription).length != 0) {
				nodeApplys[index].applyNodeInfo.nodeDescription = tmpNodeApply.applyNodeInfo.nodeDescription;
			}
			if(_tmpStr.keyExists("state")) {
				nodeApplys[index].applyNodeInfo.state = tmpNodeApply.applyNodeInfo.state;
			}
		}

		// update applyNodeIPList info
		if(_json.keyExists("applyNodeIPList")) {
			nodeApplys[index].applyNodeIPList = tmpNodeApply.applyNodeIPList;
		}

		nodeApplys[index].updateTime = uint(now) * 1000;
		nodeApplys[index].state = uint(LibNodeApply.ApplyState.APPLY_WAIT);
		errno = uint256(NodeApplyError.NO_ERROR);
		log("update success","NodeApplyManager");

		revision++;

		Notify(errno,"NodeApplyManager update success");
		return errno;
	}

	function nodeApplyExists(string _nodeApplyId) constant public returns(uint _exists){
		log("insert into nodeApplyExists...");
		uint index = getIndexById(_nodeApplyId);
		if(index == uint(-1)){
			return 1;
		}
		return 0;
	}

	function auditing(string _json) public returns(uint) {
		log("auditing->into auditing function ...");
		log("auditing->time:",now);
		log("auditing->address:",this);
		log("auditing->tx.origin:",tx.origin);
		log("auditing->owner:",owner);
		log("auditing->msg.sender:",msg.sender);
		uint errno_prefix = 95270;

		if(!tmpAuditData.fromJsonForAuditData(_json)){
			log("auditing->invalid json");
			errno = errno_prefix + uint256(NodeApplyError.JSON_INVALID);
			Notify(errno,"NodeApplyManager auditing json invalid");
			return errno;
		}

		if(bytes(tmpAuditData.applyId).length == 0){
			log("auditing->applyId  is empty");
			errno = errno_prefix + uint256(NodeApplyError.PARAMS_ILLEGAL);
			Notify(errno," auditing applyId is empty");
			return errno;
		}
		if(tmpAuditData.state != uint(LibNodeApply.ApplyState.APPLY_SUCCESS)  
			&& tmpAuditData.state != uint(LibNodeApply.ApplyState.APPLY_FAIL)){
			log("auditing->the state invalid");
			errno = errno_prefix + uint256(NodeApplyError.STATE_EXCEPTION);
			Notify(errno,"NodeApplyManager auditing state is invalid");
			return errno;
		}

		uint index = getIndexById(tmpAuditData.applyId);
		if(index == uint(-1)){
			log("auditing->NodeApply is not exists");
			errno = errno_prefix + uint256(NodeApplyError.ID_NOT_EXISTS);
			Notify(errno,"NodeApplyManager id is not exists");
			return errno;
		}
		if(nodeApplys[index].state == uint(LibNodeApply.ApplyState.APPLY_SUCCESS)){
			log("auditing->current state is success...");
			errno = errno_prefix + uint256(NodeApplyError.STATE_EXCEPTION);
			Notify(errno,"NodeApplyManager auditing state is invalid");
			return errno;
		}
		bool isSetAdmin = false;
		if(tmpAuditData.admin != address(0)){
			log("auditing no admin params...");
			isSetAdmin = true;
		}

		// auditing fail
		if(tmpAuditData.state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
			log("auditing->insert fail logic...");
			nodeApplys[index].state = uint(LibNodeApply.ApplyState.APPLY_FAIL);
		}
		uint errnoResp = uint(-1);
		// auditing passing
		if(tmpAuditData.state == uint(LibNodeApply.ApplyState.APPLY_SUCCESS)){
			log("auditing->passing logic...");

			// defind default role : set to nodeAdmin ,roleId:role100000
			if(rm.getContractAddress("SystemModuleManager","0.0.1.0","DepartmentManager","0.0.1.0") == 0
				|| rm.getContractAddress("SystemModuleManager","0.0.1.0","UserManager","0.0.1.0") == 0
				|| rm.getContractAddress("SystemModuleManager","0.0.1.0","NodeInfoManager","0.0.1.0") == 0) {
				log("auditing->umAddr|dmAddr|nimAddr is empty...");
				errno = errno_prefix + uint256(NodeApplyError.ADDR_EXCEPTION);
				Notify(errno,"NodeApplyManager auditing->umAddr|dmAddr|nimAddr is empty...");
				return errno;
			}
			IDepartmentManager dm = IDepartmentManager(rm.getContractAddress("SystemModuleManager","0.0.1.0","DepartmentManager","0.0.1.0"));
			IUserManager um = IUserManager(rm.getContractAddress("SystemModuleManager","0.0.1.0","UserManager","0.0.1.0"));
			INodeInfoManager nim = INodeInfoManager(rm.getContractAddress("SystemModuleManager","0.0.1.0","NodeInfoManager","0.0.1.0"));
			
			//nodeApplys[index].applyDepartment.departmentLevel = tmpAuditData.departmentLevel;
			//nodeApplys[index].applyDepartment.parentId = tmpAuditData.parentId;
			
			// check department is exists , add or update nodeInfo
			if(dm.departmentExists(nodeApplys[index].applyDepartment.id) != uint(1)){
				log("auditing->department not exists..");
				errno = errno_prefix + uint256(NodeApplyError.STATE_EXCEPTION);
				Notify(errno,"NodeApplyManager department not exists");
				return errno;
			}

			// add user
			if(bytes(tmpAuditData.cipherGroupKey).length != 0 
				&& bytes(nodeApplys[index].applyUser.cipherGroupKey).length <= 2) {
				nodeApplys[index].applyUser.cipherGroupKey = tmpAuditData.cipherGroupKey;
			}
			nodeApplys[index].applyUser.departmentId = nodeApplys[index].applyDepartment.id;
			
			// 0 not exists , 1 exists
			string memory userUpdateJson = getUserUpdateJSON(nodeApplys[index]);
			// check user exists
			errnoResp = um.userExists(nodeApplys[index].applyUser.userAddr);
			if(errnoResp == 1){
				// 用户存在，执行更新
				log("user already exists,do update..","NodeApplyManager");
				errnoResp = um.update(userUpdateJson);
				if(errnoResp != 0){
					log("User exec update Exception invoke...");
					Notify(errnoResp,"audit update user invoke exception");
					throw;
				}
			} else {
				log("user not exists,do insert..","NodeApplyManager");
				// 用户不存在，执行新增
				userUpdateJson = getUserInsertJSON(nodeApplys[index]);
				errnoResp = um.insert(userUpdateJson);
				if(errnoResp != 0){
					log("exec user insert fail. Exception invoke...");
					Notify(errnoResp,"audit insert user invoke exception");
					throw;
				}

				// add role for user
				string[5] memory roleIdArr = ["role100000","role100001","role100002","role100003","role100004"];
				for(uint i = 0 ; i < roleIdArr.length ; ++i) {
					errnoResp = um.addUserRole(tmpAuditData.admin,roleIdArr[i]);
					if(errnoResp == 0 || errnoResp == 15207) {
						continue;
					} else {
						 log("set role for user Exception invoke...");
						 Notify(errnoResp,"audit user addUserRole invoke exception");
						 throw;
					}
				}
			}		
			
			// check nodeInfo is exists
			string memory nodeInfoJson = getNodeInfoInsertJSON(nodeApplys[index]);
			if(nim.nodeInfoExists(nodeApplys[index].applyNodeInfo.nodeId) == uint(1)) {
				log("audit->node exists,do update..");
				errnoResp = nim.update(nodeInfoJson);
				log("dm.update Resperrno:",errnoResp);
				if(errnoResp != 0){
					log("nim.update Exception invoke...");
					Notify(errnoResp,"audit update nodeInfo invoke exception");
					throw;
				}
			} else {
				log("audit->node not exists,do insert...");
				errnoResp = nim.insert(nodeInfoJson);
				log("dm.insert Resperrno:",errnoResp);
				if(errnoResp != 0){
					log("nim.insert Exception invoke...");
					Notify(errnoResp,"audit insert nodeInfo invoke exception");
					throw;
				}
			}
		
			// set admin for nodeInfo
			if(isSetAdmin){
				log("auditing set Admin...");
				errnoResp = nim.setAdmin(nodeApplys[index].applyNodeInfo.nodeId,tmpAuditData.admin);
				if(errnoResp != 0){
					log("admin Exception invoke...");
					Notify(errnoResp,"audit dept setAdmin invoke exception");
					throw;
				}
			}
			nodeApplys[index].state = uint(LibNodeApply.ApplyState.APPLY_SUCCESS);
		}

		nodeApplys[index].reason = tmpAuditData.reason;
		nodeApplys[index].auditUAddr = tx.origin;
		errno = uint(NodeApplyError.NO_ERROR);
		revision++;
		log("auditing success","NodeApplyManager");
		Notify(errno,"NodeApplyManager auditing audit success");
		return errno;
	}

	//items入栈
    function itemStackPush(string _items, uint _total) constant private returns (uint len){
        len = 0;
        len = LibStack.push("{");
        len = LibStack.appendKeyValue("ret", uint(0));
        len = LibStack.append(",");
        len = LibStack.append("\"data\":{");
        len = LibStack.appendKeyValue("total", _total);
        len = LibStack.append(",");
        len = LibStack.append("\"items\":[");
        len = LibStack.append(_items);
        len = LibStack.append("]}}");
        return len;
    }


	function pageByNameAndStatus(uint _status, string _deptName, uint _pageNum, uint _pageSize) constant public returns(string _json) {
        log("NodeApplyManager->into pageByNameAndStatus...");
        // 0 all 1 wait 2 success 3 fail
        uint len = 0;
        uint n = 0;
        uint m = 0;
        uint total = 0;
        len = LibStack.push("");
        for (uint i = 0; i < nodeApplys.length; ++i) {
            if ((bytes(_deptName).length == 0 || nodeApplys[i].applyDepartment.name.indexOf(_deptName) != -1) && !nodeApplys[i].deleted) {
                if(_status != 0){
                    if(_status != nodeApplys[i].state){
                        continue;
                    }
                }
                if (n >= _pageNum*_pageSize && n < (_pageNum+1)*_pageSize) {
                    if (m > 0) {
                        len = LibStack.append(",");
                    }
                    len = LibStack.append(nodeApplys[i].toJson());

                    m++;
                }
                if (n >= (_pageNum+1)*_pageSize) {
                    break;
                }
                n++;
            }
        }
        for (i = 0; i < nodeApplys.length; ++i) {
            if ((bytes(_deptName).length == 0 || nodeApplys[i].applyDepartment.name.indexOf(_deptName) != -1) && !nodeApplys[i].deleted) {
                if(_status != 0){
                    if(_status != nodeApplys[i].state){
                        continue;
                    }
                }
                total++;
            }
        }
        len =itemStackPush(LibStack.popex(len),total);
		_json = LibStack.popex(len);
    }

	function listAll() constant public returns (string _json){
		log("listAll->into listAll function ...");
		_json = listBy(0, "");
	}

	function findByState(uint _state) constant public returns(string _strjson) {
		uint len = 0;
        if (nodeApplys.length <= 0) {
            _strjson = "{\"ret\":0,\"data\":{\"total\":0,\"items\":[]}}";
            return;
        }

        string memory strList = "";
        len = LibStack.push("");
        uint counter = 0;
        for (uint i = 0; i < nodeApplys.length; i++)
        {	
        	if(nodeApplys[i].deleted){
        		continue;
        	}
            if(uint(_state) == nodeApplys[i].state){
                if (counter > 0) {
                    len = LibStack.append(",");
                }
                len = LibStack.append(nodeApplys[i].toJson());
                counter++;
            }
        }

         len = itemStackPush(LibStack.popex(len),counter);
        _strjson = LibStack.popex(len);
    }

	function findByApplyId(string _nodeApplyId) constant public returns (string _json){
		log("findByApplyId->into findByApplyId function ...");
		_json = listBy(1,_nodeApplyId);
	}

	function deleteById(string _nodeApplyId) public returns(bool){
		log("deleteById->into deleteById function...");
		uint index = getIndexById(_nodeApplyId);
		uint errno_prefix = 95270;
		if(index == uint(-1)){
			log("deleteById->NodeApply is not exists");
			errno = errno_prefix + uint256(NodeApplyError.ID_NOT_EXISTS);
			Notify(errno,"NodeApplyManager id is not exists");
			return false;
		}
		// the state for 0 1 3 
		if(nodeApplys[index].state == uint(LibNodeApply.ApplyState.APPLY_SUCCESS)){
			log("deleteById->NodeApply state is success,connot delete...");
			errno = errno_prefix + uint256(NodeApplyError.STATE_EXCEPTION);
			Notify(errno,"NodeApplyManager the state is exception");
			return false;
		}
		// check permission
		if(tx.origin != owner){
			//TODO: 待定
		}

		nodeApplys[index].deleted = true;
		errno = uint256(NodeApplyError.NO_ERROR);
		revision++;
		Notify(errno,"NodeApplyManager deleteById success");
	}

	// 根据条件查询：0 for all,1 for id
	function listBy(uint _cond,string _value) constant private returns(string _json){
		uint tatal = 0;		
		uint len = 0;
		len = LibStack.push("");
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(!nodeApplys[i].deleted){
				tatal++;
			}
		}
		// defind return struct 

		uint n = 0;
		for(i  = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			bool suitable = false;
			if(_cond == 0){
				suitable = true;
			}else if(_cond == 1){
				if(nodeApplys[i].id.equals(_value)){
					suitable = true;
				}
			}
			if(suitable){
				if(n > 0){
					len = LibStack.append(",");
					
				}
				len = LibStack.append(nodeApplys[i].toJson());
				n++;
			}
		}
		len =itemStackPush(LibStack.popex(len),tatal);
		_json = LibStack.popex(len);
	}
	
	function getIndexById(string _id) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length ; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].id.equals(_id)){
				return i;
			}
		}	
		return uint(-1);
	}

	function getIndexByCommonName(string _commonName) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
				if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].applyDepartment.commonName.equals(_commonName)){
				return i;
			}
		}
		return uint(-1);
	}

	function getIndexByNodeId(string _nodeId) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].applyNodeInfo.nodeId.equals(_nodeId)){
				return i;
			}
		}
		return uint(-1);
	}

	function getIndexByNodePubkey(string _nodePubkey) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].applyNodeInfo.pubkey.equals(_nodePubkey)){
				return i;
			}
		}
		return uint(-1);
	}

	function getIndexByNodeName(string _nodeName) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].applyNodeInfo.nodeName.equals(_nodeName)){
				return i;
			}
		}
		return uint(-1);
	}

	function getIndexByAccount(string _account) constant private returns(uint){
		for(uint i = 0 ; i < nodeApplys.length; ++i){
			if(nodeApplys[i].deleted){
				continue;
			}
			if(nodeApplys[i].state == uint(LibNodeApply.ApplyState.APPLY_FAIL)){
				continue;
			}
			if(nodeApplys[i].applyUser.account.equals(_account)){
				return i;
			}
		}
		return uint(-1);
	}

	function getUserInsertJSON(LibNodeApply.NodeApply storage _self) constant private returns(string _json){
		_json = _json.concat("{");
        _json = _json.concat( _self.applyUser.account.toKeyValue("account"),"," );
        _json = _json.concat( uint(_self.applyUser.accountStatus).toKeyValue("accountStatus"),",");
        _json = _json.concat( _self.applyUser.cipherGroupKey.toKeyValue("cipherGroupKey"),"," );
        _json = _json.concat( _self.applyUser.publicKey.toKeyValue("publicKey"),"," );
        _json = _json.concat( uint(_self.applyUser.deleteStatus).toKeyValue("deleteStatus"),",");
        _json = _json.concat( _self.applyUser.departmentId.toKeyValue("departmentId"),",");
        _json = _json.concat( _self.applyUser.email.toKeyValue("email"),",");
        _json = _json.concat( _self.applyUser.mobile.toKeyValue("mobile"),",");
        _json = _json.concat( _self.applyUser.name.toKeyValue("name"),",");
        _json = _json.concat( uint(_self.applyUser.userAddr).toAddrString().toKeyValue("userAddr"),"" );
        _json = _json.concat("}");
	}

	function getUserUpdateJSON(LibNodeApply.NodeApply storage _self) constant private returns(string _json){
		_json = _json.concat("{");
		_json = _json.concat( _self.applyUser.cipherGroupKey.toKeyValue("cipherGroupKey"),"," );
        _json = _json.concat( uint(_self.applyUser.userAddr).toAddrString().toKeyValue("userAddr"),"" );
        _json = _json.concat("}");
	}

	function getNodeInfoInsertJSON(LibNodeApply.NodeApply storage _self) constant private returns(string _json){
		// {"nodeIPList":[],...}
		_json = _json.concat("{");
		_json = _json.concat( _self.applyNodeInfo.nodeId.toKeyValue("nodeId"),"," );
		_json = _json.concat( _self.applyNodeInfo.nodeName.toKeyValue("nodeName"),"," );
		_json = _json.concat( _self.applyNodeInfo.nodeShortName.toKeyValue("nodeShortName"),"," );
		// set node admin
		_json = _json.concat( uint(tmpAuditData.admin).toAddrString().toKeyValue("nodeAdmin"),"," );
		_json = _json.concat( _self.applyNodeInfo.nodeDescription.toKeyValue("nodeDescription"),"," );	
		_json = _json.concat( uint(_self.applyNodeInfo.state).toKeyValue("state"),"," );
		_json = _json.concat( uint(_self.applyNodeInfo._type).toKeyValue("type"),"," );
		_json = _json.concat( _self.applyNodeInfo.deptId.toKeyValue("deptId"),"," );
		_json = _json.concat( uint(_self.applyNodeInfo.deptLevel).toKeyValue("deptLevel"),"," );
		_json = _json.concat( _self.applyNodeInfo.deptCN.toKeyValue("deptCN") ,",");
		//_json = _json.concat( _self.applyNodeInfo.pubkey.toKeyValue("pubkey") ,",");
		//_json = _json.concat( _self.applyNodeInfo.ip.toKeyValue("ip") ,",");
		//_json = _json.concat( uint(_self.applyNodeInfo.port).toKeyValue("port"),"," );

		// concat nodeNAT 
		_json = _json.concat("\"nodeNAT\":{");
		_json = _json.concat( _self.applyNodeInfo.pubkey.toKeyValue("pubkey") ,",");
		_json = _json.concat( uint(_self.applyNodeInfo.nodeAddress).toAddrString().toKeyValue("nodeAddress"),"," );
		_json = _json.concat( _self.applyNodeInfo.ip.toKeyValue("ip") ,",");
		for(uint i = 0 ; i < _self.applyNodeIPList.length; ++i) {
			if(_self.applyNodeIPList[i]._type == uint(1)) {
				//_json = _json.concat( uint(_self.applyNodeInfo[i].P2PPort).toKeyValue("p2pPort"),"," );
				_json = _json.concat( uint(_self.applyNodeIPList[i].RPCPort).toKeyValue("rpcPort"),"," );
				_json = _json.concat( uint(_self.applyNodeIPList[i].TPort).toKeyValue("tPort"),"," );
				break;
			}
		}
		_json = _json.concat( uint(_self.applyNodeInfo.port).toKeyValue("p2pPort") );
		_json = _json.concat("},");
		
		// concat nodeLAN 
		int baseInt = 0;
		string memory baseIP ;
		int maskInt = 0;
		string memory maskIP;
		int startInt = 0 ; 
		string memory startIP;
		int endInt = 0 ; 
		string memory endIP;
		for (i = 0; i < _self.applyNodeIPList.length; ++i) {
			if(_self.applyNodeIPList[i]._type == uint(2)) {
				baseInt = _self.applyNodeIPList[i].uintIP;
				baseIP = _self.applyNodeIPList[i].ip;
			}
			if(_self.applyNodeIPList[i]._type == uint(3)) {
				maskInt = _self.applyNodeIPList[i].uintIP;
				maskIP = _self.applyNodeIPList[i].ip;
			}
			if(_self.applyNodeIPList[i]._type == uint(4)) {
				startInt = _self.applyNodeIPList[i].uintIP;
				startIP = _self.applyNodeIPList[i].ip;
			}
			if(_self.applyNodeIPList[i]._type == uint(5)) {
				endInt = _self.applyNodeIPList[i].uintIP;
				endIP = _self.applyNodeIPList[i].ip;
			} 
		}
		_json = _json.concat("\"nodeLAN\":{");
		_json = _json.concat( baseIP.toKeyValue("goByIP"),"," );
		_json = _json.concat( int(baseInt).toKeyValue("goByInt"),"," );
		_json = _json.concat( maskIP.toKeyValue("maskIP"),"," );
		_json = _json.concat( int(maskInt).toKeyValue("mastInt"),"," );
		_json = _json.concat( startIP.toKeyValue("startIP"),"," );
		_json = _json.concat( int(startInt).toKeyValue("startInt"),",");
		_json = _json.concat( endIP.toKeyValue("endIP"),"," );
		_json = _json.concat( int(endInt).toKeyValue("endInt"));
		
		_json = _json.concat("}}");

		// nodeIPList
		/* _json = _json.concat("\"nodeIPList\":[");
        for (uint i=0; i<_self.applyNodeIPList.length; ++i) {
            if (i > 0) {
                _json = _json.concat(",");
            }
            _json = _json.concat("{");
            _json = _json.concat( _self.applyNodeIPList[i].ip.toKeyValue("ip"), "," );
            _json = _json.concat( int(_self.applyNodeIPList[i].uintIP).toKeyValue("uintIP"),"," );
            _json = _json.concat( uint(_self.applyNodeIPList[i].P2PPort).toKeyValue("P2PPort"),"," );
            _json = _json.concat( uint(_self.applyNodeIPList[i].RPCPort).toKeyValue("RPCPort"),"," );
            _json = _json.concat( uint(_self.applyNodeIPList[i].TPort).toKeyValue("TPort"),"," );
            _json = _json.concat( uint(_self.applyNodeIPList[i]._type).toKeyValue("type") );
            _json = _json.concat("}");
        }
        _json = _json.concat("]"); */

		//_json = _json.concat("}");
	}

}