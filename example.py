import os
import cv2
import numpy as np
import argparse

from o_nx.GFPGAN.GFPGAN import GFPGAN
from o_nx.GPEN.GPEN import GPEN
from o_nx.Codeformer.Codeformer import CodeFormer
from o_nx.Restoreformer.Restoreformer import RestoreFormer

# 定义命令行参数解析
parser = argparse.ArgumentParser(description='Process images with RealESRGAN and GFPGAN.')
parser.add_argument('--input', type=str, required=True, help='Input image file path')
parser.add_argument('--output', type=str, required=True, help='Output image file path')
parser.add_argument('--version', type=str, default='v1.3', help='Version of the GFPGAN model to use (v1.2, v1.3, v1.4, RestoreFormer)')
parser.add_argument('--scale', type=int, default=2, help='Upscale factor for the image')
args = parser.parse_args()

# 创建模型文件夹
os.makedirs('model', exist_ok=True)
# os.system("pip freeze")


# 下载模型文件
if args.version in ['v1.0', 'v1.2', 'v1.3', 'v1.4']:
    if not os.path.exists(f'model/GFPGAN{args.version}.onnx'):
        os.system(f"wget -c https://github.com/harisreedhar/Face-Upscalers-ONNX/releases/download/Models/GFPGAN{args.version}.onnx -P ./model")
elif args.version.lower() in ['restoreformer','codeformer']:
    if not os.path.exists(f'model/{args.version}.onnx'):
        os.system(f"wget -c https://github.com/harisreedhar/Face-Upscalers-ONNX/releases/download/Models/{args.version.lower()}.onnx -P ./model")
elif args.version in ['256','512']:
    if not os.path.exists(f'model/{args.version}.onnx'):
        os.system(f"wget -c https://github.com/harisreedhar/Face-Upscalers-ONNX/releases/download/Models/GPEN-BFR-{args.version}.onnx -P ./model")

def inference(input_img, output_img, version, scale):
    try:
        # 读取图像
        img = cv2.imread(input_img, cv2.IMREAD_UNCHANGED)
        print(input_img, version, scale)

        if len(img.shape) == 3 and img.shape[2] == 4:
            img_mode = 'RGBA'
        elif len(img.shape) == 2:
            img_mode = None
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        else:
            img_mode = None

        h, w = img.shape[0:2]
        if h > 3500 or w > 3500:
            print('Image too large')
            return
        
        if h < 300:
            img = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_LANCZOS4)

        # 加载相应版本的模型
        if version in ['v1.0', 'v1.2', 'v1.3', 'v1.4']:
            gfpgan = GFPGAN(model_path=f"./model/GFPGAN{version}.onnx", device="cpu")
            output = gfpgan.enhance(img)
        elif version.lower()  == 'restoreformer':
            former = RestoreFormer(model_path=f"./model/{version.lower()}.onnx", device="cpu")
            output = former.enhance(img)
        elif version.lower()  == 'codeformer':
            former = CodeFormer(model_path=f"./model/{version.lower()}.onnx", device="cpu")
            output = former.enhance(img)
        elif version  in ['256', '512']:
            gpen = GPEN(model_path=f"./model/GPEN-BFR-{version}.onnx", device="cpu")
            output = cv2.resize(gpen.enhance(img), (512,512))

        # 缩放图像
        if scale != 1:
            interpolation = cv2.INTER_AREA if scale < 2 else cv2.INTER_LANCZOS4
            h, w = img.shape[0:2]
            output = cv2.resize(output, (int(w * scale / 2), int(h * scale / 2)), interpolation=interpolation)

        # 保存输出图像
        if img_mode == 'RGBA':
            extension = 'png'
        else:
            extension = 'jpg'
        cv2.imwrite(output_img, output)
        print(f'Image saved to {output_img}')

    except Exception as error:
        print('Error during processing:', error)

# 进行推理
inference(args.input, args.output, args.version, args.scale)
