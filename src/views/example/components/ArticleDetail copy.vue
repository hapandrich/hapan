<template>
  <div class="createPost-container">
    <el-form ref="detail" :model="detail" :rules="rules">
      <sticky :z-index="10" :class-name="'sub-navbar '+detail.status">
        <el-select v-model="switchValue" placeholder="跳转方式" style="width:120px">
          <el-option
            v-for="item in switchType"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <!-- <el-button v-loading="loading" type="warning" @click="draftForm">
          Draft
        </el-button> -->
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="17">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="detail.title" :maxlength="100" name="title" required>
                标题
              </MDinput>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="1">
            <el-form-item style="margin-bottom: 40px;">
              <MDinput v-model="detail.title_short" :maxlength="100" name="title_short" required>
                副标题
              </MDinput>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="60px" label="姓名:" class="postInfo-container-item">
              <el-select v-model="detail.author" :remote-method="getRemoteSiteList" filterable default-first-option remote placeholder="Search Site">
                <el-option v-for="(item,index) in SiteListOptions" :key="item+index" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label-width="120px" label="发行时间:" class="postInfo-container-item">
              <el-date-picker v-model="detail.date" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择时间" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-form-item style="margin-bottom: 40px;" prop="content_short">
          <MDinput v-model="detail.content_short" name="content_short">
            描述
          </MDinput>
        </el-form-item> -->

        <el-form-item style="margin-bottom: 40px;" label-width="60px" label="概述:">
          <el-input v-model="detail.content_short" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}字</span>
        </el-form-item>

        <el-form-item prop="image_uri" style="margin-bottom: 30px;">
          <!-- <Upload v-model="detail.image_uri"/> -->
          <el-upload
            action="a"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :file-list="defaultFileList"
            :http-request="modeUpload"
            :before-upload="beforeAvatarUpload"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="" />
          </el-dialog>
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          文章内容
          <Tinymce ref="editor" v-model="detail.content" :height="400" />
        </el-form-item>

        </div>
    </el-form>
  </div>
</template>

<script>
import { searchSite } from '@/api/table'
import MDinput from '@/components/MDinput'
import Tinymce from '@/components/Tinymce'
// import Upload from '@/components/Upload/WallImage'
import Sticky from '@/components/Sticky' 


export default {
    name: 'ArticleDetail',
    components: { MDinput, Tinymce, Sticky },
    props: {
      detail: {
        type: Object
      }
    },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    return {
      SiteListOptions: [],
      loading: false,
      switchType: [{
        value: 'negivator',
        label: 'negivator'
      }, {
        value: 'switchTab',
        label: 'switchTab'
      }],
      switchValue: '',
      rules: {
        title: [{ validator: validateRequire }]
      },
      dialogImageUrl: "",
      dialogVisible: false,
      file:{}
    }
  },
  computed: {
    contentShortLength() {
      if(this.detail.content_short){
        return this.detail.content_short.length
      }
    },
    defaultFileList(){
      return this.detail.image_uri && [{
        name:'a',
        url: this.detail.image_uri
      }] || []
    }
  },
  created(){
    this.getRemoteSiteList
  },
  methods: {
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type ==  'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png' || file.type == 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error('只能上传jpg, jpeg, png, gif格式的图片!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    modeUpload(param) {
      this.file = param.file
    },
    submitForm() {
      console.log(this.detail)
      this.$refs.detail.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '成功',
            message: '发布文章成功',
            type: 'success',
            duration: 2000
          })
          this.detail.status = 'published'
          this.loading = false
        } else {
          console.log('提交出错!!')
          return false
        }
      })
    },
    getRemoteSiteList(query) {
      console.log('query',query)
      searchSite(query).then(response => {
        console.log('response',response)
        // if (!response.data.items) return
        if (!response.data) return
        // this.SiteListOptions = response.data.items.map(v => v.name)
        this.SiteListOptions = response.data
      })
    }
  },
  
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>

