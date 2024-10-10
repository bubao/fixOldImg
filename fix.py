import os
import cv2
import torch
import argparse
from pathlib import Path
import numpy as np
from basicsr.archs.srvgg_arch import SRVGGNetCompact
from gfpgan.utils import GFPGANer
from realesrgan.utils import RealESRGANer
from deoldify import device
from deoldify.device_id import DeviceId
from deoldify.visualize import get_image_colorizer

# 定义命令行参数解析
parser = argparse.ArgumentParser(description='Process images with RealESRGAN and GFPGAN.')
parser.add_argument('--input', type=str, required=True, help='Input image file path')
parser.add_argument('--output', type=str, required=True, help='Output image file path')
parser.add_argument('--version', type=str, default='v1.3', help='Version of the GFPGAN model to use (v1.2, v1.3, v1.4, RestoreFormer)')
parser.add_argument('--scale', type=int, default=2, help='Upscale factor for the image')
args = parser.parse_args()

# 创建模型文件夹
os.makedirs('models', exist_ok=True)
# os.system("pip freeze")

# 下载模型文件
if args.version in ['v1.2', 'v1.3', 'v1.4']:
    if not os.path.exists(f'models/GFPGAN{args.version}.pth'):
        os.system(f"wget -c https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGAN{args.version}.pth -P ./models")
elif args.version in ['RestoreFormer']:
    if not os.path.exists(f'models/{args.version}.pth'):
        os.system(f"wget -c https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/{args.version}.pth -P ./models")
elif args.version in  ['deoldify']:
    if not os.path.exists(f'models/ColorizeArtistic_gen.pth'):
        os.system(f"wget -c https://huggingface.co/leonelhs/deoldify/resolve/main/models/ColorizeArtistic_gen.pth?download=true  -O ./models/ColorizeArtistic_gen.pth")
    device.set(device=DeviceId.GPU0)
    print(f"----------------{os.path.abspath('./')}")
    colorizer = get_image_colorizer(root_folder=Path(os.path.abspath('./')), artistic=True)
    
else:
    print("Unsupported model version")
    exit()


# 加载RealESRGAN模型
model = SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4, act_type='prelu')
model_path = 'models/realesr-general-x4v3.pth'
if not os.path.exists(model_path):
    os.system("wget -c https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth -P ./models")
half = True if torch.cuda.is_available() else False
upsampler = RealESRGANer(scale=4, model_path=model_path, model=model, tile=0, tile_pad=10, pre_pad=0, half=half)


def inference(input_img, output_img, version, scale):
    try:
        # 读取图像
        filename,extension = os.path.splitext(os.path.basename(str(output_img)))
        output_img_filename = f'{os.path.dirname(str(output_img))}/{filename}'
        img = cv2.imread(input_img, cv2.IMREAD_UNCHANGED)
        print(input_img, version, scale)
        if scale > 4:
            scale = 4  # avoid too large scale value
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
        if version in ['v1.2', 'v1.3', 'v1.4']:
            face_enhancer = GFPGANer(
                model_path=f'models/GFPGAN{version}.pth', upscale=2, arch='clean', channel_multiplier=2, bg_upsampler=upsampler)
            _, _, output = face_enhancer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
        elif version == 'RestoreFormer':
            face_enhancer = GFPGANer(
            model_path='models/RestoreFormer.pth', upscale=2, arch='RestoreFormer', channel_multiplier=2, bg_upsampler=upsampler)
            _, _, output = face_enhancer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
        elif version == 'deoldify':

            # 获取彩色化后的图像，确保其为 PIL 图像
            try:
                output_pil = colorizer.get_transformed_image(input_img, render_factor=35, watermarked=False)
                # 确保 output_pil 成功获取
                if output_pil is None:
                    raise ValueError("Failed to get transformed image from colorizer.")
                # 将 PIL 图像转换为 numpy 数组以供 OpenCV 使用
                output = np.array(output_pil)
                output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
                
            except Exception as error:
                return print('wrong scale input.', error)
            # output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
        # 缩放图像
        try:
            if scale != 2:
                interpolation = cv2.INTER_AREA if scale < 2 else cv2.INTER_LANCZOS4
                h, w = img.shape[0:2]
                output = cv2.resize(output, (int(w * scale / 2), int(h * scale / 2)), interpolation=interpolation)
        except Exception as error:
            print('wrong scale input.', error)
        # 保存输出图像
        if img_mode == 'RGBA':  # RGBA images should be saved in png format
            extension = 'png'
        else:
            extension = 'jpg'
        
        cv2.imwrite(f'{output_img_filename}.{extension}', output)
        # print(f'Image saved to {output_img_filename}.{extension}')

    except Exception as error:
        print('Error during processing:', error)

# 进行推理
inference(args.input, args.output, args.version, args.scale)