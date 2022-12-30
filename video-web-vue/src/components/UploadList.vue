<template>
  <div class="all">
    <!-- dialog -->
    <el-dialog :visible.sync="dialogShow" ref="dialog">
      <el-table
        ref="table1"
        :data="Object.keys(tags)"
        :show-header="false"
        height="240"
        @selection-change="(val) => (tableSelect = val)"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column>
          <template slot-scope="scope">{{ tags[scope.row].name }}</template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="addItemTags">确定</el-button>
    </el-dialog>
    <div class="head">
      <el-button type="primary" size="mini" :disabled="isUpload" @click="selectFiles">Select File</el-button>
      <el-button type="primary" size="mini" :disabled="isUpload" @click="uploadFiles">Upload File</el-button>
    </div>
    <div class="list-body">
      <div class="list-slider">
        <div class="file-list">
          <el-card class="file-card" v-for="item in fileList" :key="item.key">
            <div class="close-card">
              <i class="el-icon-error" @click="clearCard(item.key)"></i>
            </div>
            <div style="display: flex; align-items: center">
              <el-input size="mini" v-model="newNameConfig[item.key]"></el-input>
            </div>
            <video class="file-video" controls>
              <source :src="item.loacalUrl" />
            </video>
            <div class="file-size">{{ item.size }}</div>
            <div class="tags">
              <!-- <div style="line-height: 40px">Tags</div> -->
              <el-tag
                v-for="item2 in videoRelation[item.key]"
                :key="item2"
                closable
                effect="dark"
                :color="tags[item2].color"
                @close="handleClose(item2,item.key)"
              >{{ tags[item2].name }}</el-tag>
              <el-tag @click="addTagShow(item.key)">+</el-tag>
            </div>
            <el-progress
              v-show="percentageConfig[item.key]"
              :format="percentageFormat"
              :percentage="percentageConfig[item.key]"
              :color="customColors"
            ></el-progress>
            <div v-show="errorText[item.key]">{{ errorText[item.key] }}</div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isUpload: false,
      fileList: [],
      percentageConfig: {},
      errorText:{},
      newNameConfig: {},
      customColors: [
        { color: "#f56c6c", percentage: 30 },
        { color: "#e6a23c", percentage: 60 },
        { color: "#5cb87a", percentage: 90 },
        { color: "#1989fa", percentage: 100 }
      ],
      // tag总的的数据
      tags: {},
      // video tag的id集合
      videoRelation: {},
      // tag弹窗的数据
      dialogShow: false,
      tableSelect: [],
      callKey: ""
    };
  },
  methods: {
    uploadFiles() {
      for (let item of this.fileList) {
        // 准备上传数据
        let formData = new FormData();
        formData.append("file", item.file);
        formData.append("fileName", this.newNameConfig[item.key] || item.file.name);
        // 标签
        formData.append("tags",this.videoRelation[item.key]);
        this.$uploadFile(
          formData,
          res => {
            this.percentageConfig[item.key] = (res.loaded/res.total)*100
          },
          res => {
            if(res.data.code === 302){
              this.errorText[item.key] = res.data.msg
            }
          }
        );
      }
    },
    clearCard(key) {
      this.fileList = this.fileList.filter(i => i.key != key);
    },
    getTags() {
      return new Promise(resolve => {
        this.$request(
          "/table/tags.json",
          {},
          res => {
            delete res.data.ids;
            resolve(res.data);
          },
          "get"
        );
      });
    },
    addTagShow(key) {
      this.dialogShow = true;
      this.callKey = key;
      this.$nextTick(() => {
        this.videoRelation[key] &&
          this.videoRelation[key].some(item => {
            this.$refs.table1.toggleRowSelection(`${item}`);
          });
      });
    },
    addItemTags() {
      this.videoRelation[this.callKey] = this.tableSelect.map(item =>
        Number(item)
      );
      this.dialogShow = false;
    },
    handleClose(id, key) {
      let array = [];
      this.videoRelation[key].some(item => {
        if (item == id) return false;
        array.push(item);
      });
      this.videoRelation[key] = array;
      this.dialogShow = false;
    },
    percentageFormat(percentage) {
      let str = `${percentage}%`;
      if (percentage === 0) {
        str = "connect...";
      }
      return str;
    },
    selectFiles() {
      let file = document.createElement("input");
      file.type = "file";
      file.multiple = true;
      let objArray = [];
      file.onchange = () => {
        for (let i of file.files) {
          let url = URL.createObjectURL(i);
          // 转换为兆字节，并且保留两位小数
          let size = parseInt((i.size / 1024 / 1024) * 100) / 100;
          objArray.push({
            key: i.name,
            loacalUrl: url,
            size: size + "M",
            file: i
          });
          // 初始化name和进度条，还有tag的数据结构
          this.$set(this.newNameConfig, i.name, i.name);
          this.$set(this.videoRelation, i.name, []);
          this.$set(this.percentageConfig, i.name, 0);
          this.$set(this.errorText, i.name, '');
        }
        this.fileList = objArray;
      };
      file.click();
    }
  },
  async created() {
    this.tags = await this.getTags();
  }
};
</script>

<style>
.all {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
.head {
  padding: 10px;
  background-color: black;
}
.list-body {
  font-size: 12px;
  flex: 1;
  overflow: hidden;
  position: relative;
}
.list-slider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  padding: 0 10px;
}
.file-list {
}
.file-card {
  text-align: left;
  display: flex;
  flex-direction: column;
  margin: 10px 0;
}
.file-card .el-card__body > div {
  margin: 5px 0;
}
.file-card .el-card__body {
  padding: 5px 20px;
}
.file-card .close-card {
  display: flex;
  flex-direction: row-reverse;
  color: #f56c6c;
  font-size: 20px;
}
.file-card .file-size {
  color: #409eff;
}
.file-card .file-video {
  width: 100%;
  /* height: 100px; */
}
/* tag */
.tags {
  text-align: left;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  margin: auto;
  margin-top: 10px;
  padding: 10px;
}
.el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
/* dialog */
.el-dialog {
  width: 250px;
}
.el-dialog .el-button {
  width: 100%;
  margin-top: 20px;
}
</style>