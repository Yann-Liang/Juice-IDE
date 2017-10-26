/**
* @file RegisterApplyManager.sol
* @author yangsongqing
* @time 2017-08-21
* @desc 注册审核用户Manager
*/
pragma solidity ^0.4.2;


import "./sysbase/OwnerNamed.sol";
import "./library/LibRegisterApply.sol";
import "./library/LibRegisterUser.sol";
import "./library/LibAuditRecord.sol";
import "./library/LibAuditUser.sol";
import "./interfaces/IRegisterApplyManager.sol";
import "./interfaces/IUserManager.sol";


contract RegisterApplyManager is OwnerNamed, IRegisterApplyManager {

    using LibInt for *;
    using LibLog for *;
    using LibString for *;
    using LibJson for *;
    using LibRegisterApply for *;
    using LibRegisterUser for *;
    using LibAuditUser for *;
    using LibAuditRecord for *;

    event Notify(uint _errno, string _info);

    //记录申请详情
    mapping (string => LibRegisterApply.RegisterApply) registerApplyMap;
    //自动审核开关0手动1自动
    uint autoAuditSwitch = 0;

    string[] registerApplyIds;

    LibRegisterApply.RegisterApply _tmpRegisterApply;

    LibAuditUser.AuditUser _tmpAuditUser;

    LibAuditRecord.AuditRecord _tmpAuditRecord;

    LibRegisterApply.RegisterApply[] _tempItems;

    string[] _array;

    enum RegisterApplyError{
        SUCCESS,
        FAILURE,
        BAD_JSON,
        PARAMETER_NULL,
        PARAMETER_REPETITION,
        ACCOUNT_REPETITION,
        MOBILE_REPETITION,
        EMAIL_REPETITION,
        INSERT_USER_FAILURE
    }

    function RegisterApplyManager() {
        register("SystemModuleManager", "0.0.1.0", "RegisterApplyManager", "0.0.1.0");
    }

    //用户注册申请
    function insert(string _json) public {
        //json转换失败
        if (!_tmpRegisterApply.fromJson(_json)) {
            log("insert bad json!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.BAD_JSON), "insert bad json!");
            return;
        }
        //空值判断
        if (!applyAssertNull(_tmpRegisterApply)) {
            log("insert parameter is null!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.PARAMETER_NULL), "parameter is null!");
            return;
        }
        if (!_tmpRegisterApply.applyId.inArray(registerApplyIds)) {
            IUserManager um = IUserManager(rm.getContractAddress("SystemModuleManager", "0.0.1.0", "UserManager", "0.0.1.0"));
            LibRegisterUser.RegisterUser memory tempUser = _tmpRegisterApply.registerUser;
            uint usrCode = um.isRepetitive(tempUser.mobile, tempUser.email, tempUser.userAddr, tempUser.uuid, tempUser.publicKey, tempUser.account);
            if (usrCode != 0) {
                log("user already register!", "RegisterApplyManager");
                Notify(usrCode, "user already register!");
                return;
            }
            //重复值判断
            uint reCode = applyAssertRepetition(_tmpRegisterApply.registerUser, "");
            if (reCode != 0) {
                log("insert parameter is repeated!", "RegisterApplyManager");
                Notify(reCode, "parameter is repeated!");
                return;
            }
            _tmpRegisterApply.auditStatus = uint(1);
            _tmpRegisterApply.registerUser.accountStatus = uint(1);
            _tmpRegisterApply.applyTime = now * 1000;
            _tmpRegisterApply.createTime = now * 1000;
            _tmpRegisterApply.updateTime = now * 1000;
            registerApplyMap[_tmpRegisterApply.applyId] = _tmpRegisterApply;
            registerApplyIds.push(_tmpRegisterApply.applyId);
        }
        //自动审核
        if (autoAuditSwitch == 1) {
            _tmpAuditUser.applyId = _tmpRegisterApply.applyId;
            _tmpAuditUser.auditorId = _tmpRegisterApply.registerUser.userId;
            _tmpAuditUser.auditorName = _tmpRegisterApply.registerUser.name;
            _tmpAuditUser.auditorMobile = _tmpRegisterApply.registerUser.mobile;
            _tmpAuditUser.auditResult = 1;
            _tmpAuditUser.auditDesc = "auto audit!";
            _tmpAuditUser.cipherGroupKey = _tmpRegisterApply.registerUser.cipherGroupKey;
            audit(_tmpAuditUser.toJson());
        }
        log("insert success!", "RegisterApplyManager");
        Notify(uint(RegisterApplyError.SUCCESS), "insert success!");
        _tmpRegisterApply.reset();
    }

    //更新注册申请
    function update(string _json) public {
        //json转换失败
        if (!_tmpRegisterApply.fromJson(_json)) {
            log("update bad json!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.BAD_JSON), "update bad json!");
            return;
        }
        if (_tmpRegisterApply.applyId.inArray(registerApplyIds)) {
            //重复值判断
            uint reCode = applyAssertRepetition(_tmpRegisterApply.registerUser, _tmpRegisterApply.applyId);
            if (reCode != 0) {
                log("update parameter is repeated!", "RegisterApplyManager");
                Notify(reCode, "parameter is repeated!");
                return;
            }
            registerApplyMap[_tmpRegisterApply.applyId].update(_json);
            log("update success!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.SUCCESS), "update success!");
        }
        _tmpRegisterApply.reset();
    }

    //用户注册审核
    function audit(string _json) public {
        //json转换失败
        if (!_tmpAuditUser.fromJson(_json)) {
            log("audit bad json!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.BAD_JSON), "audit bad json!");
        }
        //空值判断
        if (!auditAssertNull(_tmpAuditUser)) {
            log("audit parameter is null!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.PARAMETER_NULL), "parameter is null!");
            return;
        }

        //新增审核记录
        _tmpAuditRecord.fromJson(_json);
        _tmpAuditRecord.auditorTime = now * 1000;
        if (_tmpAuditUser.applyId.inArray(registerApplyIds)) {
            registerApplyMap[_tmpAuditUser.applyId].auditList.push(_tmpAuditRecord);
            //更新审核状态
            registerApplyMap[_tmpAuditUser.applyId].auditStatus = uint(_tmpAuditRecord.auditResult + 1);
            //新增系统用户--只有审核通过才新增
            if (_tmpAuditRecord.auditResult == int(1)) {
                IUserManager um = IUserManager(rm.getContractAddress("SystemModuleManager", "0.0.1.0", "UserManager", "0.0.1.0"));
                string memory userInsertJson = getUserInsertJSON(registerApplyMap[_tmpAuditUser.applyId].registerUser, _tmpAuditUser.cipherGroupKey);
                if (um.insert(userInsertJson) != 0) {
                    log("audit insert user failure!", "RegisterApplyManager");
                    Notify(uint(RegisterApplyError.INSERT_USER_FAILURE), "audit insert user failure!");
                    throw;
                }
            }
        }
        _tmpAuditUser.reset();
        _tmpAuditRecord.reset();
        log("audit success!", "RegisterApplyManager");
        Notify(uint(RegisterApplyError.SUCCESS), "audit success!");
    }

    //获取自动审核开关
    function getAutoAuditSwitch() constant public returns (uint){
        return autoAuditSwitch;
    }

    //更新自动审核开关
    function updateAutoAuditSwitch(uint code) public {
        if (!msg.sender.addrToAsciiString().equals(getOwner())) {
            log("updateAutoAuditSwitch failure!", "RegisterApplyManager");
            Notify(uint(RegisterApplyError.FAILURE), "updateAutoAuditSwitch failure!");
            return;
        }
        autoAuditSwitch = (code == 1 ? 1 : 0);
        log("updateAutoAuditSwitch success!", "RegisterApplyManager");
        Notify(uint(RegisterApplyError.SUCCESS), "updateAutoAuditSwitch success!");
    }

    //根据ID查询申请信息
    function findById(string _applyId) constant public returns (string){
        string memory items;
        for (uint i = 0; i < registerApplyIds.length; i++) {
            if (registerApplyIds[i].equals(_applyId)) {
                items = registerApplyMap[_applyId].toJson();
                break;
            }
        }
        uint len = itemStackPush(items, items.equals("") ? uint(0) : uint(1));
        return LibStack.popex(len);
    }

    //根据uuid查询申请信息
    function findByUuid(string _uuid) constant public returns (string){
        string memory items;
        for (uint i = 0; i < registerApplyIds.length; i++) {
            if (registerApplyMap[registerApplyIds[i]].registerUser.uuid.equals(_uuid)) {
                items = registerApplyMap[registerApplyIds[i]].toJson();
                break;
            }
        }
        uint len = itemStackPush(items, items.equals("") ? uint(0) : uint(1));
        return LibStack.popex(len);
    }

    //分页查询申请列表
    function listByCondition(string _name, string _mobile, uint _certType, uint _pageSize, uint _pageNo, string _auditStatus, uint _accountStatus) constant public returns (string){
        delete _tempItems;
        bool condition;
        uint len = 0;
        if (!_auditStatus.equals("")) {
            delete _array;
            _auditStatus.split(",", _array);
        }
        //先过滤
        for (uint i = 0; i < registerApplyIds.length; i++) {
            condition = true;
            _tmpRegisterApply = registerApplyMap[registerApplyIds[i]];
            if (!_name.equals("")) {
                condition = condition && (-1 != _tmpRegisterApply.registerUser.name.indexOf(_name));
            }
            if (!_mobile.equals("")) {
                condition = condition && (-1 != _tmpRegisterApply.registerUser.mobile.indexOf(_mobile));
            }
            if (_certType != 0) {
                condition = condition && (_certType == _tmpRegisterApply.registerUser.certType);
            }
            if (!_auditStatus.equals("")) {
                condition = condition && isAudit();
            }
            if (_accountStatus != 0) {
                condition = condition && (_accountStatus == _tmpRegisterApply.registerUser.accountStatus);
            }
            if (condition) {
                _tempItems.push(_tmpRegisterApply);
            }
        }
        //再分页
        if (_tempItems.length > 0) {
            uint startIndex = uint(_pageNo * _pageSize);
            uint endIndex = uint(startIndex + _pageSize - 1);
            if (startIndex >= _tempItems.length) return "error";

            if (endIndex >= _tempItems.length) {
                endIndex = _tempItems.length - 1;
            }
            len = LibStack.push("");
            for (i = startIndex; i <= endIndex; i++) {
                len = LibStack.append(_tempItems[i].toJson());
                if (i != endIndex) {
                    len = LibStack.append(",");
                }
            }
        }

        len = itemStackPush(LibStack.popex(len), uint(_tempItems.length));
        delete _tempItems;
        delete _array;
        return LibStack.popex(len);
    }

    //查询所有
    function listAll() constant public returns (string) {
        uint len = 0;
        len = LibStack.push("");
        for (uint i = 0; i < registerApplyIds.length; i++) {
            len = LibStack.append(registerApplyMap[registerApplyIds[i]].toJson());
            if (i != registerApplyIds.length - 1) {
                len = LibStack.append(",");
            }
        }
        len = itemStackPush(LibStack.popex(len), uint(registerApplyIds.length));
        return LibStack.popex(len);
    }

    //用户信息重复判断
    function applyAssertRepetition(LibRegisterUser.RegisterUser _user, string _applyId) constant private returns (uint){
        LibRegisterUser.RegisterUser memory tempUser;
        for (uint i = 0; i < registerApplyIds.length; i++) {
            tempUser = registerApplyMap[registerApplyIds[i]].registerUser;
            //忽略_applyId的记录，忽略已经拒绝的记录
            if ((!_applyId.equals("") && _applyId.equals(registerApplyIds[i]))
            || registerApplyMap[registerApplyIds[i]].auditStatus == uint(3)) continue;

            if (_user.account.equals(tempUser.account)) return uint(RegisterApplyError.ACCOUNT_REPETITION);
            if (_user.mobile.equals(tempUser.mobile)) return uint(RegisterApplyError.MOBILE_REPETITION);
            if (_user.email.equals(tempUser.email)) return uint(RegisterApplyError.EMAIL_REPETITION);
            if (_user.userAddr == tempUser.userAddr || _user.uuid.equals(tempUser.uuid)
            || _user.publicKey.equals(tempUser.publicKey)) {
                return uint(RegisterApplyError.PARAMETER_REPETITION);
            }
        }
        return 0;
    }
    //用户信息空值判断
    function applyAssertNull(LibRegisterApply.RegisterApply _apply) constant private returns (bool){
        LibRegisterUser.RegisterUser memory _user = _apply.registerUser;
        //注册信息判断
        if (_apply.applyId.equals("")) {
            return false;
        }
        //用户信息判断
        if (_user.userId.equals("") || _user.account.equals("")) {
            return false;
        }
        if (_user.name.equals("") || _user.orgId.equals("") || _user.orgName.equals("")) {
            return false;
        }
        if (_user.certType == 0 || _user.mobile.equals("") || _user.email.equals("")) {
            return false;
        }
        if (_user.uuid.equals("") || _user.publicKey.equals("")) {
            return false;
        }
        return true;
    }

    //审核信息空值判断
    function auditAssertNull(LibAuditUser.AuditUser _audit) constant private returns (bool){
        if (_audit.applyId.equals("") || _audit.auditorId.equals("")
        || _audit.auditorName.equals("")) {
            return false;
        }
        if (_audit.auditResult == 0 || _audit.cipherGroupKey.equals("")) {
            return false;
        }
        return true;
    }
    //获取用户json
    function getUserInsertJSON(LibRegisterUser.RegisterUser _self, string cipherGroupKey) constant private returns (string _json){
        uint len = 0;
        len = LibStack.push("{");
        len = LibStack.appendKeyValue("uuid", _self.uuid);
        len = LibStack.appendKeyValue("account", _self.account);
        len = LibStack.appendKeyValue("certType", _self.certType);
        len = LibStack.appendKeyValue("accountStatus", uint(_self.accountStatus));
        len = LibStack.appendKeyValue("cipherGroupKey", cipherGroupKey);
        len = LibStack.appendKeyValue("publicKey", _self.publicKey);
        len = LibStack.appendKeyValue("deleteStatus", uint(0));
        len = LibStack.appendKeyValue("departmentId", _self.orgId);
        len = LibStack.appendKeyValue("email", _self.email);
        len = LibStack.appendKeyValue("mobile", _self.mobile);
        len = LibStack.appendKeyValue("name", _self.name);
        len = LibStack.appendKeyValue("remark", _self.desc);
        len = LibStack.appendKeyValue("roleIdList", "[\"role100004\"]");
        len = LibStack.appendKeyValue("userAddr", uint(_self.userAddr).toAddrString());
        len = LibStack.append("}");
        _json = LibStack.popex(len);
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

    //是否已经审核
    function isAudit() constant private returns (bool subCondition){
        subCondition = false;
        for (uint j = 0; j < _array.length; j++) {
            subCondition = subCondition || (_array[j].toUint() == _tmpRegisterApply.auditStatus);
            if (subCondition) {
                return subCondition;
            }
        }
        return subCondition;
    }
}
