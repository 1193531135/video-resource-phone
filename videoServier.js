let express = require('express')

let fs = require('fs')

// const ffmpeg = require('fluent-ffmpeg')
const os = require('child_process')

let app = express()

app.all('*', function(req, res, next) {      
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "content-type");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("Access-control-Allow-Credentials","true");  
    next();  
}); 
function getBodyData(req,func){
    let data = ''
    req.on('data',chunk => {
        data += chunk;
    })
    req.on('end',() => {
        func(JSON.parse(data))
    })
}
let videosUrl = './watch/' , imageUrl = './cover_image/'
app.use(express.static('./'))

app.listen(3000, () => {console.log('node server start for 3000') })

// 视频list
app.get('/list', (res, req) => {
    let videoArray = [], imageArray = [], sendData = []
    // 获取视频列表
    fs.readdirSync(videosUrl).some(item => {
        if (/.mp4/.test(item)) {
            videoArray.push(item)
        }
    })
    // 获取图片列表
    fs.readdirSync(imageUrl).some(item => {
        if (/.jpg/.test(item)) {
            imageArray.push(item)
        }
    })
    // 比对封面图是否存在
    {
        // 图片创建器
        let createImage = (name) => {
            return new Promise((resolve) => {
                os.exec(`ffmpeg -i "${videosUrl + name}.mp4" -f image2  -qscale 0.01 -frames 2 "${imageUrl + name}.jpg"`, (data) => {
                    console.log(data)
                    // console.log(file)
                    resolve()
                })
            })
        }
        // 创建promise容器
        let promiseAll = []
        // 对比，如果不存在创建 图片新建的promise
        videoArray.map(item => item.slice(0, item.indexOf('.'))).some(item2 => {
            let state = false
            imageArray.some(item3 => {
                if (item2 === item3.slice(0, item3.indexOf('.'))) {
                    state = true
                }
            })
            sendData.push({
                name:item2,
                coverImage:`${imageUrl+item2}.jpg`,
                videoUrl:`${videosUrl+item2}.mp4`
            })
            console.log('data push over')
            // 图片不存在创建封面图
            if (!state) {
                promiseAll.push(createImage(item2))
            }
        })
        Promise.all(promiseAll).then(() => {
            console.log('data over')
            req.send(sendData)
        })
    }
})

// tag JSON文件修改添加
app.post('/add-tags',(req,res) => {
    getBodyData(req,(data) => {
        // 读取tags JSON
        let a = JSON.parse(fs.readFileSync('./table/tags.json'))
        // 判断 id 有无
        let id = ''
        Object.keys(a).some(item => {
            if(item == data.id){
                id = item
            }
        })
        delete data.id
        if(id){
            a[id] = data
        }else{
            a.ids++
            a[`${a.ids}`] = data 
        }
        console.log(4,a,data)
        // 文件覆盖
        fs.writeFileSync('./table/tags.json',JSON.stringify(a,null,2))
        res.end(JSON.stringify(a))
    })
})

// videoTag JSON文件修改添加
app.post('/add-relation',(req,res) => {
    getBodyData(req,(data) => {
        // 读取tags JSON
        let a = JSON.parse(fs.readFileSync('./table/videoTag.json'))
        let name = Object.keys(data)[0]
        a[name] = data[name]
        fs.writeFileSync('./table/videoTag.json',JSON.stringify(a,null,2))
        res.end(JSON.stringify(a))
    })
})