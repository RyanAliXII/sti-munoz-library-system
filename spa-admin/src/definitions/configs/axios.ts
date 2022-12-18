import axios from 'axios'

const axiosClient = axios.create({
    
    baseURL: "http://localhost:5200/api/1",
    withCredentials: true,
    headers:{
        
    }
})
export default  axiosClient