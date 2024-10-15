let express = require("express");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const errcode = require("./utils/error/errcode");
const gfpgan = require("./routes/gfpgan");
const path = require("path");

// const { downloadModels } = require("./utils/downloadModels");
let app = express();

app.all("*", function(req, res, next) {
	// 设置允许跨域的域名，*代表允许任意域名跨域
	res.header("Access-Control-Allow-Origin", "*");
	// 允许的header类型
	res.header("Access-Control-Allow-Headers", "content-type");
	// 跨域允许的请求方式
	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
	if (req.method.toLowerCase() === "options") {
		// 让options尝试请求快速结束
		res.send(200);
	} else { next(); }
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/api/v1/gfpgan",gfpgan);


// catch 404 and forward to error handler
app.use((req, res) => {
	res.status(404)
		.send("404");
});
// error handler
// eslint-disable-next-line no-unused-vars
app.use(function ErrorHandler(err, req, res, next) {
	const error = errcode(err.errcode);
	console.log(err);
	res.status(error.status);
	res.send({ ...error.body, ...(err.name === "MyError" ? err.resBody : {}) });
});

module.exports = app;