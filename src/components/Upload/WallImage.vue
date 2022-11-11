<template>
  <div>
    <el-upload
      ref="uploadFile"
      action="/"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :file-list="fileList"
      :before-upload="beforeAvatarUpload"
      :class="{hide: uploadHide}"
      :limit="1"
      :http-request="submitFile"
    >
      <i class="el-icon-plus"></i>
    </el-upload>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { uploadImg } from '@/api/table'


export default {
  name: 'WallImage',
  props: {
    value: {
      type: String
    }
  },
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      uploadHide: null,
      fileList: []
    };
  },
  watch: {  //因为在 created 中取不到 this.value，所有使用监听计算相关值
    value: {
      handler(newVal, oldVal){
        // console.log('newVal',newVal)
        // console.log('oldVal',oldVal)
        //  console.log('a',this.fileList)
        // console.log('b',this.$refs.uploadFile && this.$refs.uploadFile.uploadFiles )
        // this.uploadHide = (newVal ? true : false)
          // if(this.value){
          //   this.fileList.push({
          //     name: '',
          //     url: this.value,
          //   })
          // }
      },
      immediate: true,
      deep: true
    }
  },
  updated() {
    

  },
  methods: {
    handleChange(file) {
      
      if(file.status == 'fail') {
        this.$emit('input','')
        // console.log('2')
      }else if(file.status == 'ready'){
        this.$emit('input',file.url) //不能在接口回调里执行,也不能在第二次触发时调用，必须在ready阶段调用，否则会延迟隐藏出现抖动
        // this.uploadHide = true
      }else{
      }


    },
    handleRemove(file, fileList) {
      this.$emit('input', '')
      this.fileList = []
      
        this.uploadHide = false
    },
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
    submitFile(param) {
      let formData = new FormData();
      formData.append('files', param.file);
      uploadImg(formData).then((res) => {
        
        // this.$emit('input','https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AAZmm75.img?w=500&h=491&m=6')
        
        param.onSuccess()
      }).catch(response => {
        console.log('1qq')
        console.log('1',this.$refs.uploadFile.uploadFiles[0].status)
        // this.uploadHide = false
        // param.onError()
        console.log('2',this.$refs.uploadFile.uploadFiles)

      })
    }
  }
}
</script>

<style>
.hide .el-upload--picture-card {
  display: none;
}
.el-list-leave-active {
  transition: all 0s;
}
</style>
