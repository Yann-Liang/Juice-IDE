/**
* @file AuthorizeFilters.sol
* @author ximi
* @time 2017-05-08
* @desc the defination of AuthorizeFilters contract
*/
pragma solidity ^0.4.2;

import "./library/Errnos.sol";
import "./library/LibFilter.sol";
import "./interfaces/FilterBase.sol";
import "./sysbase/OwnerNamed.sol";

contract AuthorizeFilters is OwnerNamed,FilterBase {

    using Errnos for *;
    using LibFilter for *;
    using LibString for *;
    using LibInt for *;
    
    //Limits
    uint constant FILTER_ID_MIN = 1;
    uint constant FILTER_ID_MAX = 99;
    //Errno offset
    uint constant BASE_ERRNO_OFFSET = 100000;
    uint constant FILTER_ERRNO_OFFSET = 150000;
    
    LibFilter.Filter[] filters;
    uint nextFilterId = FILTER_ID_MIN;
    LibFilter.Filter tmpFilter;
    
    event Notify(uint _errno, string _info);
    
    function AuthorizeFilters() {
        register("SystemModuleManager","0.0.1.0","AuthorizeFilters", "0.0.1.0");
    }
    
    function authorizeProcessor(address _from, address _to, string _funcHash, string _extraData) public constant returns(uint _ret) {
        for(uint i=0; i<filters.length; ++i) {
            if(uint(Errnos.State.STATE_VALID) != filters[i].state
                || 0 == filters[i].enable) {
                log("AuthorizeFilters-authorizeProcessor", "ignore invalid or disable filter");
                continue;
            }
            if(uint(Errnos.FilterType.FILTER_TYPE_ROLE) == filters[i]._type
                && bytes(_extraData).length != 0
                && -1 != _extraData.indexOf("ignore-RoleFilter")) {
                log("AuthorizeFilters-authorizeProcessor", "ignore RoleFilter due to extraData setted");
                continue;
            }
            if(0 == FilterBase(filters[i].addr).authorizeProcessor(_from, _to, _funcHash, _extraData)) {
            //if(0 == filters[i].addr.authorizeProcessor(_from, _to, _funcHash, _extraData)) {
                log("AuthorizeFilters-authorizeProcessor deny at", filters[i].name);
                return 0;
            }
        }
        log("AuthorizeFilters-authorizeProcessor", "pass");
        return 1;
    }
    
    function setFilterEnableDb(string _name, string _version, uint _enable) constant private returns (uint _ret) {
        log("AuthorizeFilters.sol", "setFilterEnableDb");
        log(_name,_version,_enable.toString());
        _ret = writedb("filterEnable|update", _name.concat(_version), _enable.toString());
        if (0 != _ret)
            log("AuthorizeFilters.sol", "setFilterEnableDb failed.");
        else
            log("AuthorizeFilters.sol", "setFilterEnableDb success.");
    }
    
    function addFilter(string _filterJson) public returns(uint _filterId) {
        log("addFilter", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        uint _id = 0;
        _filterId = 0;
        
        if (!tmpFilter.fromJson(_filterJson)) {
            log("json invalid", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.BAD_PARAMETER);
            Notify(errno, "json invalid");
            return _filterId;
        }
        
        //check filter self params
        if (!tmpFilter.id.equals("0")) {
            _id = uint(tmpFilter.id.toInt());
            if (_id < FILTER_ID_MIN || _id > FILTER_ID_MAX) {
                log("filter id overflow", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_OVERFLOW);
                Notify(errno, "filter id overflow");
                return _filterId;
            }
            uint index = getIndexById(tmpFilter.id);
            if (index != uint(-1)) {
                log("filter id conflicted", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_CONFLICTED);
                Notify(errno, "filter id conflicted");
                return _filterId;
            }
        }
        if (bytes(tmpFilter.name).length == 0) {
            log("filter name empty", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.NAME_EMPTY);
            Notify(errno, "filter name empty");
            return _filterId;
        }
        if (bytes(tmpFilter.version).length == 0) {
            log("filter version empty", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.VERSION_EMPTY);
            Notify(errno, "filter version empty");
            return _filterId;
        }
        if (tmpFilter._type <= uint(Errnos.FilterType.FILTER_TYPE_START)
            || tmpFilter._type >= uint(Errnos.FilterType.FILTER_TYPE_END)) {
            log("filter type invalid", "AuthorizeFilters");
            errno = FILTER_ERRNO_OFFSET + uint(Errnos.Filter_Errnos.FILTER_TYPE_INVALID);
            Notify(errno, "filter type invalid");
            return _filterId;
        }
        if (tmpFilter.state < uint(Errnos.State.STATE_INVALID) || tmpFilter.state > uint(Errnos.State.STATE_DELETED)) {
            log("filter state invalid", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.STATE_INVALID);
            Notify(errno, "filter state invalid");
            return _filterId;
        }
        /*if (tmpFilter.addr != 0
            && tmpFilter.addr != msg.sender) {
            log("filter addr invalid", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ADDRESS_INVALID);
            Notify(errno, "filter addr invalid");
            return _filterId;
        }*/
        
        //check filter params in filters
        for(uint i=0; i<filters.length; ++i) {
            if (tmpFilter.name.equals(filters[i].name)
                && tmpFilter.version.equals(filters[i].version)) {
                log("filter name+version conflicted", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.NAME_VERSION_CONFLICTED);
                Notify(errno, "filter name+version conflicted");
                return _filterId;
            }
        }
        
        //set filter params
        if (tmpFilter.id.equals("0")) {
            _id = nextFilterId++;
            if (_id < FILTER_ID_MIN || _id > FILTER_ID_MAX) {
                log("filter id overflow", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_OVERFLOW);
                Notify(errno, "filter id overflow");
                return _filterId;
            }
            if (_id < 10)
                tmpFilter.id = "0".concat(_id.toString());
            else
                tmpFilter.id = _id.toString();
        }

        //use fix address
        tmpFilter.addr = msg.sender;//tx.origin
        
        //save to filters
        filters.push(tmpFilter);
        _filterId = _id;
        setFilterEnableDb(tmpFilter.name, tmpFilter.version, tmpFilter.enable);
        
        return tmpFilter.id.storageToUint();
    }
    
    function udpFilter(string _filterJson) public returns(uint) {
        log("udpFilter", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        
        if (!tmpFilter.fromJson(_filterJson)) {
            log("json invalid", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.BAD_PARAMETER);
            Notify(errno, "json invalid");
            return errno;
        }
        
        uint index = getIndexById(tmpFilter.id);
        if (index == uint(-1)) {
            log("filter id not exist", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_NONEXIST);
            Notify(errno, "filter id not exist");
            return errno;
        }
        
        if (_filterJson.keyExists("state")) {
            if (tmpFilter.state < uint(Errnos.State.STATE_INVALID) || tmpFilter.state > uint(Errnos.State.STATE_DELETED)) {
                log("filter state invalid", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.STATE_INVALID);
                Notify(errno, "filter state invalid");
                return errno;
            }
        }
        
        //just state/enable/desc can be updated.
        if (_filterJson.keyExists("state")) {
            filters[index].state = tmpFilter.state;
        }
        if (_filterJson.keyExists("enable")) {
            filters[index].enable = tmpFilter.enable;
            setFilterEnableDb(filters[index].name, filters[index].version, filters[index].enable);
        }
        if (_filterJson.keyExists("desc")) {
            filters[index].desc = tmpFilter.desc;
        }
        
        return errno;
    }
    
    function delFilter(string _filterId) public returns(uint) {
        log("delFilter", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        
        //check filterId
        uint index = getIndexById(_filterId);
        if (index == uint(-1)) {
            log("filter id not exist", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_NONEXIST);
            Notify(errno, "filter id not exist");
            return errno;
        }
        
        //set to deleted
        filters[index].state = uint(Errnos.State.STATE_DELETED);
        
        return errno;
    }
    
    function qryFilter(string _filterId) public constant returns(string _json) {
        log("qryFilter", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        _json = "";
        
        if (bytes(_filterId).length == 0) {
            log("filter id empty", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_EMPTY);
            Notify(errno, "filter id empty");
            return _json;
        }
        
        uint index = uint(-1);
        if (!_filterId.equals("0")) {
            //check filterId
            index = getIndexById(_filterId);
            if (index == uint(-1)) {
                log("filter id not exist", "AuthorizeFilters");
                errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_NONEXIST);
                Notify(errno, "filter id not exist");
                return _json;
            }
        }
        
        uint tatal = 0;
        for(uint i=0; i<filters.length; ++i) {
            if (uint(Errnos.State.STATE_VALID) == filters[i].state)
                ++tatal;
        }
        
        _json = _json.concat("{");
        _json = _json.concat(uint(0).toKeyValue("ret"), ",");
        _json = _json.concat("\"data\":{");
        _json = _json.concat(tatal.toKeyValue("total"), ",");
        _json = _json.concat("\"items\":[");
        if (!_filterId.equals("0")) {
            _json = _json.concat(filters[index].toJson());
        }
        else {
            uint n = 0;
            for (i=0; i<filters.length; ++i) {
                if (uint(Errnos.State.STATE_VALID) != filters[i].state)
                    continue;
                
                if (n > 0) {
                    _json = _json.concat(",");
                }
                
                _json = _json.concat(filters[i].toJson());
                n++;
            }
        }
        _json = _json.concat("]}}");
        
        return _json;
    }
    
    function enable(string _filterId) public constant returns(uint) {
        log("enable(string)", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        
        //check filterId
        uint index = getIndexById(_filterId);
        if (index == uint(-1)) {
            log("filter id not exist", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_NONEXIST);
            Notify(errno, "filter id not exist");
            return 0;
        }
        
        return filters[index].enable;
    }
    
    function enable(string _filterId, uint _filterEnable) public returns(uint) {
        log("enable(string,bool)", "AuthorizeFilters");
        errno = uint(Errnos.Base_Errnos.NO_ERROR);
        
        //check filterId
        uint index = getIndexById(_filterId);
        if (index == uint(-1)) {
            log("filter id not exist", "AuthorizeFilters");
            errno = BASE_ERRNO_OFFSET + uint(Errnos.Base_Errnos.ID_NONEXIST);
            Notify(errno, "filter id not exist");
            return 0;
        }
        
        uint oldEnable = filters[index].enable;
        filters[index].enable = _filterEnable;
        setFilterEnableDb(filters[index].name, filters[index].version, filters[index].enable);
        return oldEnable;
    }
    
    function getIndexById(string _id) constant private returns (uint) {
        for (uint i=0; i<filters.length; ++i) {
            //if (uint(Errnos.State.STATE_VALID) != filters[i].state)
            //    continue;
            if (_id.equals(filters[i].id))
                return i;
        }
        
        return uint(-1);
    }

 }
