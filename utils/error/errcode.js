/**
 * @Description: 
 * @Author: bubao
 * @Date: 2024-04-15 12:08:48
 * @LastEditors: bubao
 * @LastEditTime: 2024-04-15 12:08:59
 */
const ERRCODE = {
	0: {
		status: 200,
		body: {
			errcode: "0",
			errmsg: "ok"
		}
	},
	40001: {
		status: 400,
		body: {
			errcode: "40001",
			errmsg: "参数错误"
		}
	},
	40002: {
		status: 400,
		body: {
			errcode: "40002",
			errmsg: "无权访问"
		}
	},
	40003: {
		status: 400,
		body: {
			errcode: "40003",
			errmsg: "无效token"
		}
	},
	40004: {
		status: 400,
		body: {
			errcode: "40004",
			errmsg: "请求太频繁，请稍后重试"
		}
	},
	50000: {
		status: 500,
		body: {
			errcode: "50000",
			errmsg: "服务端错误"
		}
	}
};

function errcode(code, res = {}) {
	return {
		...(ERRCODE[code] || ERRCODE[50000]),
		body: {
			...(ERRCODE[code] || ERRCODE[50000]).body, ...res
		}
	};
}

module.exports = errcode;