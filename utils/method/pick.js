/**
 * @Description:
 * @Author: bubao
 * @Date: 2022-03-08 10:10:03
 * @LastEditors: harryzhang
 * @LastEditTime: 2022-04-26 17:04:45
 */
const pick = (object, keys) => {
	return keys.reduce((obj, key) => {
		if (object && Object.prototype.hasOwnProperty.call(object, key)) {
			// eslint-disable-next-line no-param-reassign
			obj[key] = object[key];
		}
		return obj;
	}, {});
};
module.exports = pick;
