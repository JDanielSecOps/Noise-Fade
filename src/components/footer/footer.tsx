

import "@/components/footer/footer.scss"


type propstype={

    style:string;
}




const Footer =(props : propstype)=>{

    return(
        
        <div className={`${"footer-main"} ${props.style}`}>
            <div className="footer-title">&copy; All rights reserved by Noise Fade team</div>
        </div>
    )
}

export default Footer