const fs = require("fs");
const path = require("path");
const axios = require("axios");
// 下载文件
async function downloadFile(url, outputPath) {
	const writer = fs.createWriteStream(outputPath);
	const response = await axios({
		url,
		method: "GET",
		responseType: "stream"
	});
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on("finish", resolve);
		writer.on("error", reject);
	});
}

// 下载所需模型文件
async function downloadModels() {
	await fs.promises.mkdir(path.join(__dirname, "../model"))
		.catch(()=>{});
	const modelUrls = [
		"https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth",
		"https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.2.pth",
		"https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth",
		"https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
		"https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/RestoreFormer.pth",
		"https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/CodeFormer.pth"
	];

	for (const url of modelUrls) {
		const fileName = path.basename(url);
		const filePath = path.join(__dirname, "../model", fileName);
		if (!fs.existsSync(filePath)) {
			console.log(`Downloading model: ${fileName}`);
			await downloadFile(url, filePath);
		} else {
			console.log(`Model ${fileName} already exists.`);
		}
	}
}

module.exports = {
	downloadModels, downloadFile
};
