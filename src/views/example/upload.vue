<template>
  <div>
      <el-form >
        <el-form-item class="upload-bg register-bg" prop="ad_url">
    <div class="hide-video-box"></div>
    <el-upload
        class="avatar-uploader"
        ref="upload" 
        :action="upload_url" 
        list-type="picture-card" 
        :name="upload_name"
        :on-remove="handleRemove" 
        :on-exceed="handleExceed"
        :file-list="ad_url_list"
        :limit="1"
        :http-request="uploadSectionFile">
        <span class="font-14">选择图片或视频</span>
        <div slot="tip" class="el-upload__tip">尺寸750*1125px，大小2M以内，视频支持MP4</div>
    </el-upload>
</el-form-item>
      </el-form>
      

  </div>
</template>

<script>
import { uploadImg } from '@/api/table'


export default {
  name: 'Upload',
data: function(){
    return {
        upload_url: '',//上传URL
        upload_name: '',//图片或视频名称
        ad_url: '',//上传后的图片或视频URL
        ad_url_list: [],//预览列表
    }
},
methods: {
    handleExceed: function () {
         this.$message.error('请先删除选择的图片或视频，再上传');
    },
    handleRemove: function (res, file) {
        var self = this;
        self.ad_url = '';
        var liItem = document.getElementsByClassName('hide-video-box')[0];
        liItem.innerHTML = '';
    },
    uploadSectionFile: function (params) {
        var self = this,
            file = params.file,
            fileType = file.type,
            isImage = fileType.indexOf('image') != -1,
            isVideo = fileType.indexOf('video') != -1,
            file_url = self.$refs.upload.uploadFiles[0].url;
        
        var isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             this.$message.error('上传图片或视频大小不能超过 2MB!');
            self.$refs.upload.uploadFiles = []; 
            return;
        }

        if(!isImage && !isVideo){
             this.$message.error('请选择图片或视频!');
            self.$refs.upload.uploadFiles = []; 
            return;
        }

        if (isImage) {
            var img = new Image();
            img.src = file_url;
            img.onload = function () {
                //图片上传
                self.upload_url = '你的图片上传URL';
                self.upload_name = 'file_img[]';
                self.uploadFile(file, isVideo, '');
            }
        } 
    },
    uploadFile: function (file, isVideo, videoDiv) {
        var self = this,
            formData = new FormData();
        formData.append(self.upload_name, file);


        uploadImg(formData).then( (res) => {
                self.ad_url = res.data[0];

                    return;
            })
            .catch(function (err) {
                console.error(err);
            });

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
