<template>
  <div class="home" :style="`height:${allH}px`">
    <div><router-view></router-view></div>
    <div
      class="menu"
      @touchstart="touch"
      @touchmove="move"
      :style="`
    top:${typeof menu.pageY == 'number' ? menu.pageY + 'px' : menu.pageY};
    left:${typeof menu.pageX == 'number' ? menu.pageX + 'px' : menu.pageX};
    width:${menu.d}px;
    height:${menu.d}px;
    margin-top:-${menu.d / 2}px;
    margin-left:-${menu.d / 2}px;
    `"
    >
      <div class="menu-center"
        @click="zhankai"
       :style="menu.border?'transform: rotate(360deg);':''"></div>
      <div
        class="menu-extend"
        :style="`
    width:${menu.d + menu.border}px;
    height:${menu.d + menu.border}px;
    `"
      >
        <div
          class="menu-sector"
          v-for="(item,index) in options"
          :key="item"
          :style="cutCircle(index) + `background-color:${colors[index]}`"
          @click="toMenu(item)"
        >
        <p style="height:20px"></p>
        <div :style="`transform:rotate(-${index*360/options.length}deg)`">{{ item }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  data() {
    return {
      menu: {
        d: 50,
        pageY: 0,
        pageX: 300,
        border: 0,
      },
      allH: 0,
      allW: 0,
      options: ["Home", "Sort"],
      colors:[]
    };
  },
  computed: {
  },
  created() {
    this.allH = innerHeight;
    this.allW = innerWidth;
    Vue.prototype.$height = this.allH
    this.menu.pageY = this.$height/3*2
    for(let i = 0;i < 10;i++){
      let color = `${(Math.random()*0xffffff<<0).toString(16)}`
      // 避免五位数的颜色
      if(color.length != 6){
        color += '0'
      }
      this.colors.push(`#${color}`)
    }
  },
  methods: {
    toMenu(name){
      this.zhankai()
      if(name === 'Home'){
        if(this.$route.fullPath === '/home'){
          return false
        }
        this.$router.push('/home')
      }
      if(name === 'Sort'){
        if(this.$route.fullPath === '/sort'){
          return false
        }
        this.$router.push('/sort')
      }
    },
    touch(e) {
      e;
      // console.log(e)
    },
    move(e) {
      // 禁止移动式触发下拉刷新
      e.returnValue = false;
      let r = this.menu.d / 2 + this.menu.border / 2;
      let y = e.touches[0].pageY;
      let x = e.touches[0].pageX;
      if (y < r) {
        y = r;
      }
      if (x < r) {
        x = r;
      }
      if (x > this.allW - r) {
        x = this.allW - r;
      }
      if (y > this.allH - r) {
        y = this.allH - r;
      }
      // if(x < 0){ x = 0}
      this.menu.pageY = y;
      this.menu.pageX = x;
    },
    zhankai() {
      let boder = 100;
      if (this.menu.border === boder) this.menu.border = 0;
      else this.menu.border = boder;
      // 展开后超出边距进行位移
      let r = (this.menu.d + this.menu.border) / 2;
      if (this.menu.pageY < r) {
        this.menu.pageY = r;
      }
      if (this.menu.pageX < r) {
        this.menu.pageX = r;
      }
      if (this.menu.pageY + r > this.allH) {
        this.menu.pageY = this.allH - r;
      }
      if (this.menu.pageX + r > this.allW) {
        this.menu.pageX = this.allW - r;
      }
    },
    // 切圆
    cutCircle(index) {
      let point1, point2,a;
      // 1。当切的份数小于等于四的时候,一个固定点，两个变点，三个点绘制一个图形
      let Aw_half = Math.PI / this.options.length;
      if(this.options.length === 2){
        // 半圆
        a = `clip-path: polygon(0 0,0 50%,100% 50%,100% 0)`;}
      else if (this.options.length <= 4) {
        point1 = `${50 * (1 - Math.tan(Aw_half)).toFixed(2)}% 0%`;
        point2 = `${50 * (1 + Math.tan(Aw_half)).toFixed(2)}% 0%`;
        a = `clip-path: polygon(${point1},50% 50%,${point2})`;
      }else{
        // 3.扇形度数大于90度时，三个固定点，两个变点，五个点绘制一个图形
        let coordinate_y = 50 * (1 - 1/Math.tan(Aw_half)).toFixed(2);
        a = `clip-path: polygon(0 0,0 ${coordinate_y}%,50% 50%,100% ${coordinate_y}%,100% 0)`
      }
      return a + `;transform:rotate(${index*360/this.options.length}deg);`
    },
  },
};
</script>

<style scoped>
.home {
  width: 100%;
  /* overflow: hidden; */
}
.menu,
.menu-center {
  /* background-color: rgba(0,0,0,0.1); */
  position: absolute;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  /* overflow: hidden; */
  /* transition: margin 0.1s; */
}
.menu-center {
  height: inherit;
  width: inherit;
  z-index: 2;
  background-image: url("../assets/head.jpg");
  background-size: cover;
  transition: transform 0.4s;
}
.menu-sector:active {
  /* opacity: 0.5; */
  background-color: black !important;
}
.menu-extend {
  transition: width 0.1s 0.4s, height 0.1s 0.4s;
  border-radius: 50%;
  position: absolute;
  overflow: hidden;
  box-shadow: 0 0 5px black;
}
.menu-sector {
  width: inherit;
  height: inherit;
  position: absolute;
  border-radius: 50%;
}
</style>