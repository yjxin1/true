<!-- 文章管理界面，根据文章标题、发布者、发布时间、爬取来源、鉴定级别进行分页展示。展示内容为：文章标题、发布者、发布时间  -->
<template>
  <div>
    <!-- 查询这一栏 -->
    <el-row class="mb-1">
      <el-text>标题</el-text>
      <el-input v-model="searchCondition.title" placeholder="输入标题" style="width: 150px" />
      <el-text>发布者</el-text>
      <el-input v-model="searchCondition.publisher" placeholder="输入发布者" style="width: 100px" />
      <el-input v-model="searchCondition.crawlSource" placeholder="爬取来源" style="width: 80px" />
      <el-select v-model="searchCondition.verificationLevel" placeholder="鉴定级别" style="width: 100px">
        <el-option label="真" :value="10" />
        <el-option label="半真半假" :value="5" />
        <el-option label="假" :value="0" />
      </el-select>
      <el-select v-model="searchCondition.status" placeholder="状态" style="width: 90px">
        <el-option label="已上架" :value="1" />
        <el-option label="已下架" :value="0" />
      </el-select>
      <div>
        <el-date-picker v-model="time" type="daterange" range-separator="至" start-placeholder="开始时间"
          end-placeholder="结束时间" size="default" value-format="YYYY-MM-DD" />
      </div>
      <el-button type="primary" @click="showData">查询</el-button>
      <el-button type="info" @click="emptySearchCondition">清空</el-button>
    </el-row>
    <!-- end -->
    <!-- 第二栏，测试用，爬取文章 -->
    <el-row class="mb-2" v-if="0">
      <el-input v-model="urlId" placeholder="爬取较真文章的urlId" style="width: 200px" />
      <el-button type="primary" @click="crawlJZ">爬取</el-button>
    </el-row>
    <!-- end -->
    <br>
    <!-- 展示文章这一栏 -->
    <el-space wrap size="default">
      <el-card shadow="hover" v-for="a in articleList" :key="a.id" :body-style="{ padding: '0px' }"
        style="width:350px;height: 180px;">
        <div style="padding: 15px;">
          <span class="ellipsis-text">{{ a.title }}</span>
          <div style="font-size: 11px;color: #999;">
            <span>发布时间：{{ a.publishTime }}</span><br>
            <span>发布者：{{ a.publisher }}</span><br>
            <span>鉴定级别：{{ a.verificationLevel }}</span><br>
            <span>爬取来源：{{ a.crawlSource }}</span><br>
            <a class="ellipsis-text" v-if="a.crawlUrl" :href="a.crawlUrl" target="_blank">爬取网址：{{ a.crawlUrl }}</a>
          </div>
          <div class="bottom">
            <el-button type="primary" text @click="showArticle(a.id)">查看</el-button>
            <el-popconfirm v-if="a.status" confirm-button-text="下架" cancel-button-text="否" title="确认下架"
              @confirm="update(a.id, 'off')" @cancel="">
              <template #reference>
                <el-button type="primary" text>已上架</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm v-if="!a.status" confirm-button-text="上架" cancel-button-text="否" title="确认上架"
              @confirm="update(a.id, 'on')" @cancel="">
              <template #reference>
                <el-button type="primary" text>已下架</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="确认删除" @confirm="deleteArticle(a.id)"
              @cancel="">
              <template #reference>
                <el-button type="danger" text>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-card>
    </el-space>
    <!-- end -->

    <!-- 分页 -->
    <div class="demo-pagination-block" style="margin:10px 10px;">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[9, 18, 27]"
        :small="true" :disabled="false" :background="false" layout="total, sizes, prev, pager, next, jumper"
        :total="total" @size-change="showData" @current-change="showData" />
    </div>
    <!-- end -->
  </div>
  <el-backtop :right="100" :bottom="100" />
</template>

<script lang='ts' setup>
import { ElMessage } from 'element-plus';
import { ref, reactive, toRefs, onBeforeMount, onMounted } from 'vue'
import axios from 'axios';
import type { Article } from '@/types';
import { useRouter } from 'vue-router';
import articleApi from '@/request/api/articleApi'
//数据
const urlId = ref('')   //爬取较真文章的urlId，测试用
const currentPage = ref(1)  //当前页
const pageSize = ref(9)  //页大小
const total = ref(0) //返回查询结果总数
const articleList = ref<Article[]>([])  //文章列表
const time = ref('')
const router = useRouter();
const ids = ref<number[]>([]); //多选框存储选中ID，可以批量删除
const searchCondition = ref({  //搜索条件
  title: '',  //标题
  publisher: '',  //发布者
  crawlSource: null,   //爬取来源
  verificationLevel: null,  //鉴定级别
  status: null, //发布状态
})

//方法
onBeforeMount(showData)
//展示数据
async function showData() {
  console.log("条件查询")
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    title: searchCondition.value.title,
    publisher: searchCondition.value.publisher,
    crawlSource: searchCondition.value.crawlSource,
    verificationLevel: searchCondition.value.verificationLevel,
    status: searchCondition.value.status,
    begin: time.value[0],
    end: time.value[1],
  }
  let result = await articleApi.page(params)
  articleList.value = result.data.data.rows;
  total.value = result.data.data.total;
  console.log(articleList.value)
}

//根据id查看文章
async function showArticle(id: number | null) {
  if (id == null) {
    console.log("文章为空")
    return
  }
  console.log("根据id查看文章,id为:", id);
  router.push({ path: 'article', query: { id: id } });
}
//根据id删除文章
async function deleteArticle(id: number | null) {
  console.log("删除文章,id为:", ids.value)
  ids.value = [];
  if (id == null) {
    console.log("要删除的id为空,删除失败");
    return
  }
  ids.value.push(id);
  // console.log(`/api/article/${ids.value.join(',')}`)
  // let result = await axios.delete(`/api/article/${ids.value.join(',')}`);
  let result = await articleApi.delete(ids.value)
  if (result.data.code === 1) {
    ElMessage('删除成功')
    showData();
  }
}
//更新文章操作:可以修改标题，修改发布状态
async function update(id: number | null, command: string) {
  if (id === null || command === '') return;
  let result;
  if (command === 'off') {
   result= await articleApi.update({id:id,status:0})
    console.log("下架的文章id:", id)
  } else if (command === 'on') {
    result= await articleApi.update({id:id,status:1})
    console.log("上架的文章id:", id);
  } else {
    result= await articleApi.update({id:id,title:command})
    console.log("修改标题的文章id:", id);
  }
  if (result.data.code === 1) {
    console.log("更新成功")
  }
  showData();
}
//清空搜索框数据
function emptySearchCondition() {
  searchCondition.value.title = '';  // 清空标题
  searchCondition.value.publisher = '';  // 清空发布者
  searchCondition.value.crawlSource = null;  // 清空爬取来源
  searchCondition.value.verificationLevel = null;  // 清空鉴定级别
  searchCondition.value.status = null;
  time.value = '';  //清空时间
}

//爬取较真文章作为测试
async function crawlJZ() {
  console.log("爬取较真文章");
  let result = await axios.get('/api/article/crawlJZ', {
    params: { urlId: urlId.value }
  });
  if (result.data.code === 1) {
    ElMessage("爬取成功")
  }
}
</script>


<style scoped>
.el-space{
  margin-left: 40px;
}
.mb-1 .el-text {
  margin-right: 10px;
  margin-bottom: 10px;
}

.mb-1 .el-input {
  margin-right: 10px;
  margin-bottom: 10px;
}

.mb-1 .el-select {
  margin-right: 10px;
  margin-bottom: 10px;
}

.bottom {
  margin-top: 5px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ellipsis-text {
  white-space: nowrap;
  /* 防止文本换行 */
  overflow: hidden;
  /* 隐藏溢出部分文本 */
  text-overflow: ellipsis;
  /* 显示省略号 */
  display: inline-block;
  /* 必须设置为块级元素才能生效 */
  max-width: 300px;
  /* 最大宽度，根据需要调整 */
  position: relative;
  /* 相对定位，用于设置悬浮框的位置 */
}

a {
  color: inherit;
  /* text-decoration: none; */
  /* 去除下划线 */
}
</style>