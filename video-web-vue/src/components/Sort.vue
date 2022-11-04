<template>
  <div class="all" :style="`height:${$height}px`">
    <el-dialog :visible.sync="dialogShow" 
    :show-close="false"
    top="30vh"
    >
        <div>
            <el-input v-model="dialog.name" placeholder="类名"></el-input>
            <el-color-picker v-model="dialog.color"></el-color-picker>
            <div>
            <el-button style="width:100%" type="primary" @click="modifyTags">好的</el-button>
            </div>
        </div>
    </el-dialog>
    <div class="white-ban">
      <div class="sort-con">
          <div class="sort-item" 
          v-for="item in Object.keys(tags)" 
          :key="item"
          :style="`background-color:${tags[item].color}`"
          >
          <div class="item-name">{{ tags[item].name }}</div>
          <div class="func">
              <i @click="editerClass(item)" class="el-icon-edit-outline"></i>
              <i @click="toList(item)" class="el-icon-view"></i>
          </div>
          </div>
          <p style="height:45px"></p>
      </div>
      <div class="add" @click="dialogShow = true">
        <i class="el-icon-circle-plus"></i>
         新增分类
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
        tags:{},
        dialogShow:false,
        dialog:{}
    };
  },
  watch:{
    dialogShow(state){
      if(!state){
        this.dialog = {
            color:'#409EFF',
            name:'',
            id:''
        }
      }
    }
  },
  methods: {
    getTags() {
      return new Promise((resolve) => {
        this.$request(
          "/table/tags.json",
          {},
          (res) => {
            delete res.data.ids
            this.tags = res.data
            resolve(this.tags);
          },
          "get"
        );
      });
    },
    editerClass(item){
        this.dialogShow = true,
        this.dialog.color = this.tags[item].color
        this.dialog.name = this.tags[item].name
        this.dialog.id = item
    },
    modifyTags(){
        this.$request('/add-tags',this.dialog,async res => {
            if(res.status === 200){
              await this.getTags()
              this.dialogShow = false
            }
        })
    },
    toList(id){
      this.$router.push(`/home${id?'?state='+id:''}`)
    }
  },
  created(){
      (async () => {
        await this.getTags()
      })()
  }
};
</script>

<style scoped>
.all {
  background-image: url("../assets/ukino.jpg");
  background-size: cover;
  background-position: left;
  display: flex;
  align-items: center;
}
.all >>> .el-dialog__header{
    display: none;
}
.all >>> .el-dialog{
    width: 280px;
    /* height: 200px; */
    border-radius: 10px;
}
.all >>> .el-dialog__body{
    padding: 15px;
}
.all >>> .el-dialog{
    width: 280px;
    /* height: 200px; */
    border-radius: 10px;
}
.white-ban {
  width: 300px;
  background-color: rgba(255, 255, 255, 0.9);
  margin: auto;
  position: relative;
}
.sort-con {
  height: 450px;
  overflow: scroll;
  padding: 5px;
  box-sizing: border-box;
}
.sort-item{
    color: white;
    margin: 5px 0;
    border-radius: 10px;
    padding: 5px 20px;
    height: 45px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
}
.item-name{
    width: 170px;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.func i{
    margin-right: 10px;
}
.func i:active{
    color: black;
}
.add {
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  color: red;
  background-color: black;
  font-size: 20px;
  align-items: center;
  justify-content: center;
}
</style>