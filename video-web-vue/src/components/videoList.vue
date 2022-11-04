<template>
  <div class="all" :style="`height:${$height}px`">
    <div class="video-con">
      <div class="video-kuai" v-for="item in videoList" :key="item.name" @click="watching(item.name)">
        <img :src="$baseURL + item.coverImage" />
        <div class="name">{{ item.name }}</div>
        <div class="sign">
          <el-tag v-if="item.tags.length === 0"
          size="mini"
          type="info"
          effect="dark"
          >无</el-tag>
          <el-tag
           v-for="item2 in item.tags" 
           :key="item2" :color="tags[`${item2}`].color"
           size="mini"
           effect="dark"
           >{{ tags[`${item2}`].name }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      videoList: [],
      tags: {},
      relation: {},
      width:''
    };
  },
  watch: {
    state: {
      handler(val) {
        console.log(val);
        this.init();
      },
      immediate: true,
    },
  },
  computed: {
    state() {
      return Number(this.$route.query.state) || "";
    },
  },
  methods: {
    watching(name){
      this.$router.push(`/watch?id=${name}`)
    },
    getList() {
      return new Promise((resolve) => {
        this.$request(
          "/list",
          {},
          (res) => {
            res.data.some((item) => {
              item.coverImage = item.coverImage.slice(2);
              item.videoUrl = item.videoUrl.slice(2);
            });
            resolve(res.data);
          },
          "get"
        );
      });
    },
    getTags() {
      return new Promise((resolve) => {
        this.$request(
          "/table/tags.json",
          {},
          (res) => {
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
    init() {
      (async () => {
        let videoList = await this.getList();
        let tags = await this.getTags();
        let relation = await this.getRelation();
        // 对videoList添加标签
        videoList.some(item => {
            item.tags = []
            Object.keys(relation).some(item2 => {
                if(item2 === item.name){
                    item.tags = relation[item2]
                }
            })
        })
        // state存在，有筛选条件
        if (this.state) {
          //确定筛选视频名称
          let videoNames = [];
          Object.keys(relation).some((item) => {
            let state = false;
            relation[item].some((item2) => {
              if (this.state === item2) {
                state = true;
              }
            });
            state && videoNames.push(item);
          });
          //   筛选视频
          let videoList2 = [];
          videoList.some((item) => {
            videoNames.some((item2) => {
              if (item.name === item2) {
                videoList2.push(item);
              }
            });
          });
          videoList = videoList2;
        }
        this.videoList = videoList;
        this.tags = tags;
        this.relation = relation;
      })();
    },
  },
  mounted() {
    this.$set(this,"width",innerWidth)
  },
  beforeDestroy(){
    console.log('clear Page')
  }
};
</script>

<style scoped>
.all {
  overflow: scroll;
  box-sizing: border-box;
}
.all::after {
  content: "";
  box-shadow: 0 -2px 3px black;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.4);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}
.video-con {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px 12px 0;
}
.video-kuai {
  width: 160px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 2px black;
  font-size: 12px;
}
.video-kuai:active {
  opacity: 0.5;
}
.sign{
    padding: 8px;
    text-align: left;
}
.name {
  margin: auto;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 10px;
}
</style>