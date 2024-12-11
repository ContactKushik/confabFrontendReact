import { toast } from "react-toastify";

export const handleSuccess = (msg)=>{
    toast.success(msg,{
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    })
}

export const handleError = (msg)=>{
    console.log("haa chal rha mein")
    toast.error(msg,{
        position: 'top-right',
    })
}