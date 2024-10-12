const Joi = require("joi");

const enhanceJoi = {
	body: {
		version: Joi.string()
			.valid("1.2", "1.3", "1.4", "deoldify")
			.allow("")
			.default("1.2")
	}
};

module.exports ={
	enhanceJoi
};