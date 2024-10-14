# README

- [Xintao/GFPGAN](https://huggingface.co/spaces/Xintao/GFPGAN)
- [harisreedhar/Face-Upscalers-ONNX](https://github.com/harisreedhar/Face-Upscalers-ONNX)
- [jantic/DeOldify](https://github.com/jantic/DeOldify)

## 安装

```shell
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir output
mkdir input
```

## 老照片上色&修复

测试表明，先上色在放大效果会好很多

```shell
python fix.py --input=./input/3.webp --output=./output/out25.jpg --version=deoldify
python fix.py --input=./output/out25.jpg --output=./output/out26.jpg --version=v1.4
```

## api 调用

这里使用了 Express.js 作为 API 服务，启动命令如下：

```shell
nvm use 22
npm ci
npm start
```

```http
POST /api/v1/gfpgan HTTP/1.1
Host: 127.0.0.1:3000
Content-Length: 279
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="version"

1.4
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="input"; filename="image.webp"
Content-Type: image/webp

(data)
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```
