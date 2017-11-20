//
//  key.js
//  <project>
//  钱包管理
//  key-manager的git url:http://192.168.9.66/Juzix-ethereum/key-manager/tree/develop
//  Created by yann_liang on 2017-08-02.
//  Copyright 2017 yann_liang. All rights reserved.
//
/*
 * 错误码
 *
 * 1.
 * 2.
 * 3.密码不能为空
 * 4.不支持的type类型
 * 5.初始密码，请修改
 * 6.用户名不能为空
 * 7.用户名和密码不能为空
 * 8.密码错误
 * 9.相同位置已经存在相同的钱包文件
 *
 */

import ContractServies from './contract-servies';
import { ipcRenderer } from 'electron';

const KeyManager = require('key-manager'),
	{
		dialog
	} = require('electron').remote,
	EthereumTx = require('ethereumjs-tx');

/*
 * 钱包类
 */
class Key {
	constructor() {

	}

	/*
	 * 签名
	 */
	sign(rawTx, successCB, errorCB) {
		if(this.type == 1) {
			const tx = new EthereumTx(rawTx);
			let privateKey = Buffer.from(this.privateKey, 'hex');
			tx.sign(privateKey);

			const serializedTx = tx.serialize();
			let serializedTxHex = "0x" + serializedTx.toString('hex');
			successCB && successCB(serializedTxHex);
		} else if(this.type == 2) {
			ipcRenderer.send('event', 'wallet', 'sign', rawTx, 'signFromExe');
			ipcRenderer.on('callback', (event, callbackId, res) => {
				console.log(callbackId, res)
				if(callbackId == 'signFromExe' && res.code == 0) {
					successCB && successCB(res.data);
				} else {
					errorCB && errorCB(res.code, '');
				}
			})
			/*util.rlp(rawTx, (errorCore, res) => {
				if(errorCore === 0) {
					console.log('rlp', errorCore, res, this.getAddress());

					KeyManager.ukeyECCSign(this.uKey.phDev, res, this.uKey.showData, (errorCore, res2) => {
						console.log('ukeyECCSign', errorCore, res2)
						if(errorCore === 0) {
							successCB && successCB(res2.pbSignRlp);
						}
					})
				}
			})*/

			//return ;
		} else {
			return '';
		}
	}

}

export default new Key;