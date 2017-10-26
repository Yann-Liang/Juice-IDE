/**
* @file SystemConfig.sol
* @author liaoyan
* @time 2017-04-17
* @desc the defination of SystemConfig contract
*/
pragma solidity ^0.4.2;

import "./sysbase/OwnerNamed.sol";

contract SystemConfig is OwnerNamed {
    using LibString for *;
    using LibInt for *;

    mapping(string => string) data;

    function SystemConfig() {
        register("SystemModuleManager","0.0.1.0","SystemConfig", "0.0.1.0");
        data["consensus"] = "{\"consensusInterval\":2000,\"transactionsTimeout\":10000,\"msgTimeout\":2000,\"tickInterval\":1000}";
    }

    function writeConfig(string _key, string _val) public {
        data[_key] = _val;
    }

    function readConfig(string _key) public constant returns(string _val) {
        _val = data[_key];
    }
}
