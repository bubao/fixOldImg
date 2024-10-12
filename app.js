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

app.use("/api/v1/gfpgan",gfpgan);
// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
// 	next(createError(404));
// });
app.use("/static", express.static(path.join(__dirname, "public")));
// error handler
app.use(function ErrorHandler(err, req, res) {
	const error = errcode(err.errcode);
	console.log(err);
	res.status(error.status)
		.send({ ...error.body, ...(err.name === "MyError" ? err.resBody : {}) });
});
// downloadModels();

module.exports = app;