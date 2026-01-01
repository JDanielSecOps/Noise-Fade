from pathlib import Path
from typing import Union
from fastapi import FastAPI
from df import enhance,init_df
from fastapi.staticfiles import StaticFiles
import soundfile as sf
import numpy as np
import torch
import pydub as pd
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from io import BytesIO
from fastapi.responses import StreamingResponse





model=None
df_state = None




@asynccontextmanager
async def lifespan(server: FastAPI):

    global model, df_state
    model, df_state,_ =init_df()
    yield
    model=None
    df_state = None


server =FastAPI(lifespan=lifespan)


server_path=Path(__file__).resolve().parent
static_folder =server_path.parent/"dist"
print(static_folder)



def process(audio : bytes):

    global model, df_state

    noisy_audio = pd.audio_segment.AudioSegment.from_mp3(BytesIO(audio))

    sample_rate = noisy_audio.frame_rate
    channels = noisy_audio.channels

    if channels >1 :
        noisy_audio =noisy_audio.set_channels(1)

    samples = np.array(noisy_audio.get_array_of_samples(),dtype=np.float32)
    samples=samples/(32768.0)

    noisy_audio_tensor =torch.from_numpy(samples).float().unsqueeze(0)
    enhanced_audio_tensor =enhance(model,df_state,noisy_audio_tensor)
    enhanced_audio =enhanced_audio_tensor.squeeze(0).cpu().numpy()

    enhanced_audio=np.clip(enhanced_audio,-1.0,1.0)
    enhanced_audio_int16 =(enhanced_audio*32767).astype(np.int16)
    
    enhanced_audio_segment =pd.audio_segment.AudioSegment(
        enhanced_audio_int16.tobytes(),
        frame_rate =sample_rate,
        sample_width=2,
        channels=1
    )

    enhanced_mp3 = BytesIO()
    enhanced_audio_segment.export(enhanced_mp3,format="mp3",bitrate="192k")
    enhanced_mp3.seek(0)

    return enhanced_mp3

@server.post("/upload")
async def file_denoise(request : Request):
    
    form = await request.form()
    audio_file =form["file"]
    audio_bytes =await audio_file.read()


    denoised_audio = process(audio_bytes)

    return StreamingResponse(
        denoised_audio,
        media_type="audio/mpeg"
    )

server.mount("/",StaticFiles(directory=static_folder,html=True),name="static")

if __name__ =="__main__":
    
    uvicorn.run(server,host="0.0.0.0",port=8000)

