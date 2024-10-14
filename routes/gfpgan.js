const express = require("express");
const router = express.Router();
const path = require("path");
const { spawn } = require("child_process");


const multer = require("multer");
const { enhanceJoi } = require("./gfpgan.joi");
const { joiValidator } = require("../utils");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "input/");
	},
	filename: (req, file, cb) => {
		// 保留原始文件名及其后缀名
		const uniqueSuffix = uuidV4();
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage });
const { v4: uuidV4 } = require("uuid");

// eslint-disable-next-line no-unused-vars
async function processImage(imagePath, version, scale) {
	try {
		const filePath = `output/output_${uuidV4()}.png`;
		const outputFilePath = path.join(__dirname, `../${filePath}`);
		const conda_exec = path.join(__dirname, "../venv/bin/python3.10");


		const command = ["fix.py", `--input=${imagePath}`, `--output=${outputFilePath}`, `--version=${version !== "deoldify" ? `v${version}` : version}`];
		// 执行
		console.log(conda_exec, command);
		// 创建一个 Promise 包装 spawn
		await new Promise((resolve, reject) => {
			const child = spawn(conda_exec, command, { cwd: path.join(__dirname, "../") });

			// 捕获 stdout 和 stderr，便于调试
			// eslint-disable-next-line no-unused-vars
			child.stdout.on("data", data => {
				// console.log(`stdout: ${data}`);
			});

			// eslint-disable-next-line no-unused-vars
			child.stderr.on("data", data => {
				// console.error(`stderr: ${data}`);
			});

			// 监听子进程的关闭事件
			child.on("close", code => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Python script exited with code ${code}`));
				}
			});

			// 捕获错误
			child.on("error", err => {
				reject(err);
			});
		});

		// console.log(`outputFilePath:${outputFilePath}`);
		// 如果没有错误发生，返回输出文件路径
		return outputFilePath;

	} catch (error) {
		console.error("Error during image processing:", error);
		throw error;
	}
}
router.post("/", upload.single("input"), async (req, res, next) => {
	try {
		const { body: { version } } = joiValidator(req, enhanceJoi);
		// const version = req.body.version || "1.2";
		const scale = req.body.scale || 2;

		// 上传的文件路径
		const imagePath = req.file.path;

		console.log(imagePath);
		// 处理上传的图像并运行 ONNX 模型
		const outputImagePath = await processImage(imagePath, version, scale);

		// 处理完毕后将图像返回给客户端
		res.download(outputImagePath, async err => {
			if (err) {
				console.error("Failed to send the file:", err);
			}
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
