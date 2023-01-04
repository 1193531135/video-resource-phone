let express = require('express')
// 表单处理模块
let multiparty = require('multiparty')

let fs = require('fs')

// const ffmpeg = require('fluent-ffmpeg')
const os = require('child_process')

let app = express()

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-control-Allow-Credentials", "true");
  next();
});
// 数据流转化为完整的字符串
function getBodyData(req, func) {
  let data = ''
  req.on('data', chunk => {
    data += chunk;
  })
  req.on('end', () => {
    func(JSON.parse(data))
  })
}
let videosUrl = './watch/', imageUrl = './cover_image/'
// 指定静态目录
app.use(express.static('./'))
let sendData = []  //发送的列表数据
// 创建videoList
function createVideoList() {
  let videoArray = [], imageArray = [], mkvArray = [],sendDataBackup = []
  // 创建promise容器
  let promiseAll = []
  function mkvToMp4(name) {
    return new Promise(resolve => {
      // ffmpeg -i 2_5D.mkv -vcodec copy -acodec copy 2_5D.mp4
      os.exec(`ffmpeg -i "${videosUrl + name}.mkv" -vcodec copy -acodec copy "${videosUrl + name}.mp4"`, (data) => {
        console.log(`mkv文件${name}转为mp4`)
        console.log('开始删除原mkv文件')
        fs.unlinkSync(`${videosUrl + name}.mkv`)
        resolve(`mkv文件${name}处理完成`)
      })
    })
  }
  // 获取视频列表
  fs.readdirSync(videosUrl).some(item => {
    // mkv格式转为mp4
    if (/.mkv$/.test(item)) {
      mkvArray.push(item.slice(0, item.lastIndexOf('.')))
    }
    if (/.mp4$/.test(item)) {
      // 零时列表只存真名
      videoArray.push(item.slice(0, item.lastIndexOf('.')))
    }
  })
  // 对比mkv和mp4是否有重复
  {
    mkvArray.some(item => {
      let state = false
      videoArray.some(item2 => {
        if (item === item2) {
          state = true
        }
      })
      // 有重复的将其删除
      if (state) {
        fs.unlinkSync(`${videosUrl + item}.mkv`)
      } else {
        // 没重复将mkv添加到转化为mp4的进程中
        let promise = mkvToMp4(item)
        promiseAll.push(promise)
      }
    })

  }
  // 获取图片列表
  fs.readdirSync(imageUrl).some(item => {
    if (/.jpg$/.test(item)) {
      imageArray.push(item.slice(0, item.lastIndexOf('.')))
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
          resolve(`图片${name}创建完成`)
        })
      })
    }
    // 对比，如果不存在创建 图片新建的promise
    videoArray.some(item2 => {
      let state = false
      imageArray.some(item3 => {
        if (item2 === item3) {
          state = true
        }
      })
      sendDataBackup.push({
        name: item2,
        coverImage: `${imageUrl + item2}.jpg`,
        videoUrl: `${videosUrl + item2}.mp4`
      })
      // 图片不存在创建封面图
      if (!state) {
        promiseAll.push(createImage(item2))
      }
    })
    sendData = sendDataBackup
    // 开始初始化
    console.log('开始初始化')
    Promise.all(promiseAll).then((data) => {
      console.log(data)
    })
  }
}
// tag JSON文件修改添加 data格式{ [String]:[Array] }
function changeTag(data){
    // 读取tags JSON
    let a = JSON.parse(fs.readFileSync('./table/videoTag.json'))
    let name = Object.keys(data)[0]
    a[name] = data[name]
    fs.writeFileSync('./table/videoTag.json', JSON.stringify(a, null, 2))
}
createVideoList()

app.listen(3000, () => { console.log('node server start for 3000') })
// @接口层
// 视频list
app.get('/list', (req, res) => {
  res.send(sendData)
})

// tag JSON文件修改添加
app.post('/add-tags', (req, res) => {
  getBodyData(req, (data) => {
    // 读取tags JSON
    let a = JSON.parse(fs.readFileSync('./table/tags.json'))
    // 判断 id 有无
    let id = ''
    Object.keys(a).some(item => {
      if (item == data.id) {
        id = item
      }
    })
    delete data.id
    if (id) {
      a[id] = data
    } else {
      a.ids++
      a[`${a.ids}`] = data
    }
    console.log(4, a, data)
    // 文件覆盖
    fs.writeFileSync('./table/tags.json', JSON.stringify(a, null, 2))
    res.end(JSON.stringify(a))
  })
})

// 文件上传接口
app.post('/add-video', (req, res) => {
  let form = new multiparty.Form({
    // video的路径，这里写成活的
    uploadDir: videosUrl
  })
  form.parse(req,function(err,fields,files){
    // 对上传文件重命名
    if(err){
      console.log(err)
    }
    // 准备新命名的最新文件名
    let fileName = fields.fileName[0]
    // 用文件临时文件名保存的文件路径
    let fileUrl = files.file[0].path
    // 获取文件夹下列表看看是否有重名
    let isRepeatName = fs.readdirSync(videosUrl).filter(i => i === fileName)
    // 判断是否重名
    if(isRepeatName.length > 0){
      // 删除文件并返回错误
      fs.unlinkSync(fileUrl)
      res.send({
        code:302,
        msg:'File Renamed'
      })
    }else{
      // 通过保存后进行改名，如果有tag，保存tag
      fs.renameSync(fileUrl,videosUrl + fileName)
      console.log(fields.tags[0])
      let tags = fields.tags[0]
      if(tags){
        tags = tags.split(',')
        let name = fileName.match(/^([^.]{1,}).[^.]{1,}$/)[1]
        changeTag({ [name]:tags.map(i => Number(i)) })
      }
      res.send({
        code:200,
        msg:'success'
      })
    }
  })
})

// 文件列表刷新接口
app.get('/update-list', (req, res) => {
  createVideoList()
  res.send({
    code:200,
    msg:'success'
  })
})

// videoTag JSON文件修改添加
app.post('/add-relation', (req, res) => {
  getBodyData(req, (data) => {
    // 读取tags JSON
    let a = JSON.parse(fs.readFileSync('./table/videoTag.json'))
    let name = Object.keys(data)[0]
    a[name] = data[name]
    fs.writeFileSync('./table/videoTag.json', JSON.stringify(a, null, 2))
    res.end(JSON.stringify(a))
  })
})