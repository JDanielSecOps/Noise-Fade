
import "@/components/file_submit/file-submit.scss"
import { useMutation } from "@tanstack/react-query"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {saveAs} from "file-saver"
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/src/styles.scss'
import {motion} from "motion/react"

type propstype={

    style:string

}






const FileSubmit =(props : propstype)=>{

    const [file,setfile] =useState<File | null>(null);
    const [originalaudiourl,setoriginalaudiourl]=useState<string | null>(null)
    const [enhancedaudiourl,setenhancedaudiourl]=useState<string | null>(null)

    const downloadref = useRef<HTMLDivElement>(null)


    useEffect(()=>{

        if(enhancedaudiourl && downloadref.current){
            downloadref.current.scrollIntoView({behavior:"smooth",block:"center"})
        }

    },[enhancedaudiourl])

    const updatemutation = useMutation({

        mutationFn:async (file : File)=>{

            const formdata =new FormData()
            formdata.append('file',file)

            const response = await fetch("localhost:8000/upload",{

                method:"POST",
                body:formdata
            })

            const audioblob = await response.blob()

            return {audioblob}
        },

        onSuccess: (data)=>{
            
            toast.success("Denoising completed Successfully.",)

            if(enhancedaudiourl){
                URL.revokeObjectURL(enhancedaudiourl)
            }

            const url = URL.createObjectURL(data.audioblob)
            setenhancedaudiourl(url)


        },
        onError:()=>{toast.error("Something went wrong please try again latter.")}

    })


    useEffect(()=>{

        if(updatemutation.isPending){
            toast.success("Denoising in progress.")
        }
        

    },[updatemutation.isPending])

    const handleChange=(e: React.ChangeEvent<HTMLInputElement>)=>{

        if(e.target.files){
            const selected_file=e.target.files[0]
            setfile(selected_file)

            if(originalaudiourl){
                URL.revokeObjectURL(originalaudiourl)
            }

            const url = URL.createObjectURL(selected_file)
            setoriginalaudiourl(url)
        }

    }   

    const handlesubmit=()=>{


        if(file){
            updatemutation.mutate(file)

        }else{
            toast.error("No file selected.")
        }

    }

    const download =()=>{
        
        if(updatemutation.data){
            saveAs(updatemutation.data?.audioblob,"test.mp3")
        }else{
            toast.error("No data to download.")
        }
    }

    return(
    <div className="main" >
    <motion.div className="upload"
     initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{duration:0.5}}>
    <div className="upload-title">Upload</div>
    <div className={`${"boxstyle"} ${props.style}`}>
        <div className="input-align">
            <div className="labels">Orignal Audio</div>
            <input type="file"  className="file" onChange={handleChange} required></input>
             {originalaudiourl && (
                    <AudioPlayer className="input-audio"
                        src={originalaudiourl}
                        showJumpControls={false}
                        showSkipControls={false}
                        showFilledVolume={false}
                    />
            )}
            <div className="button-align">
                <button type="submit" className="submit-btn" onClick={handlesubmit} disabled={updatemutation.isPending} >Submit</button>
            </div>
        </div>
    </div>
    </motion.div>
    {enhancedaudiourl && 
    (           
           <>
            <motion.div className="download-container" ref={downloadref}
            initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{duration:0.5}}>
            <div className="download-title">Download</div>
            <div className="boxstyle">
                <div className="output">
                 <div className="labels">Denoised Audio</div>
                    <AudioPlayer className="output-audio" 
                        src={enhancedaudiourl}
                        showJumpControls={false}
                        showSkipControls={false}
                        showFilledVolume={false}
                    />
                     <button className="download-btn" onClick={download} disabled={updatemutation.isPending}>Download</button>
                </div>
                </div>
            </motion.div>
           </>
               
            )}
    
    </div>


    )

}



export default FileSubmit