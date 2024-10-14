# README

- [Xintao/GFPGAN](https://huggingface.co/spaces/Xintao/GFPGAN)
- [harisreedhar/Face-Upscalers-ONNX](https://github.com/harisreedhar/Face-Upscalers-ONNX)

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
