<template>
  <div class="video-detail">
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
    <div class="header">
      <i class="back-btn el-icon-back" @click="backList"></i>
      <div class="head-title">{{ name }}</div>
    </div>
    <video
      class="videos"
      id="first-video"
      ref="video"
      controls
      :poster="$baseURL + 'cover_image/' + name + '.jpg'"
    >
      <source :src="$baseURL + 'watch/' + name + '.mp4'" />
    </video>
    <div class="tags">
      <div style="line-height: 40px">Tags</div>
      <el-tag
        v-for="item in videoRelation[name]"
        :key="item"
        closable
        effect="dark"
        :color="tags[item].color"
        @close="handleClose(item)"
      >
        {{ tags[item].name }}
      </el-tag>
      <el-tag @click="addTagShow">+</el-tag>
    </div>
    <div class="end">123</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tags: {},
      videoRelation: {},
      name: "",
      dialogShow: false,
      tableSelect: [],
    };
  },
  methods: {
    backList() {
      this.$router.go(-1)
    },
    getTags() {
      return new Promise((resolve) => {
        this.$request(
          "/table/tags.json",
          {},
          (res) => {
            delete res.data.ids;
            resolve(res.data);
          },
          "get"
        );
      });
    },
    getRelation() {
      return new Promise((resolve) => {
        this.$request(
          "/table/videoTag.json",
          {},
          (res) => {
            resolve(res.data);
          },
          "get"
        );
      });
    },
    addTagShow() {
      this.dialogShow = true;
      this.$nextTick(() => {
        this.videoRelation[this.name] &&
          this.videoRelation[this.name].some((item) => {
            this.$refs.table1.toggleRowSelection(`${item}`);
          });
      });
    },
    addItemTags() {
      this.$request(
        "/add-relation",
        {
          [`${this.name}`]: this.tableSelect.map((item) => Number(item)),
        },
        (res) => {
          this.videoRelation = res.data;
          this.dialogShow = false;
        }
      );
    },
    handleClose(id) {
      let array = [];
      this.videoRelation[this.name].some((item) => {
        if (item == id) return false;
        array.push(item);
      });
      this.$request(
        "/add-relation",
        {
          [`${this.name}`]: array,
        },
        (res) => {
          this.videoRelation = res.data;
          this.dialogShow = false;
        }
      );
    },
  },
  created() {
    this.name = this.$route.query.id;
    (async () => {
      this.tags = await this.getTags();
      this.videoRelation = await this.getRelation();
    })();
  },
  mounted() {
    let option = {
      controls: true,
      autoplay: false,
      preload: "auto",
    };
    this.$videojs(this.$refs["video"], option);
  },
};
</script>

<style scoped>
/* head */
.header {
  display: flex;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  align-items: center;
  padding: 0 10px;
}
.header .back-btn:active {
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  color: rgba(0, 0, 0, 0.7);
}
.head-title {
  margin-left: 10px;
}
/* video */
.videos {
  width: 100%;
  height: 500px;
  background-color: rgba(0, 0, 0, 0.05);
}
.tags {
  text-align: left;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  margin: auto;
  margin-top: 10px;
  padding: 10px;
}
.el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
.video-detail >>> .el-dialog {
  width: 250px;
}
.video-detail >>> .el-dialog .el-button {
  width: 100%;
  margin-top: 20px;
}
</style>