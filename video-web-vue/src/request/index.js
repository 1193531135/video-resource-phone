import axios from 'axios'
// import qs from 'querystring'
let baseURL = 'http://localhost:3000/'
if(process.env.NODE_ENV === 'production'){
    baseURL = '/'
}
let axios1 = axios.create({
    baseURL,
    timeout:0
})

let request = function(url,data,func,method = 'post'){
    axios1({
        method,
        url,
        params:method == 'get'?data:null,
        data:method == 'get'?null:data
    }).then((res) => {
        func(res)
    })
}

let uploadFile = function(formData,func,thenFunc){
  axios1({
    method:'post',
    url:'/add-video',
    data:formData,
    onUploadProgress:func
  }).then(thenFunc)
}

axios1.interceptors.request.use((config) => {
    // config.data = qs.stringify(config.data)
    return config
})

export default {request,baseURL,uploadFile} 