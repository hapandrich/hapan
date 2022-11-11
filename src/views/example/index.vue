<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:10px">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 200px;" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" style="width: 100px;" clearable filterable @change="handleFilter">
        <el-option
          v-for="item in statusOptions"
          :key="item.key"
          :label="item.text"
          :value="item.key"
        />
      </el-select>
      <el-date-picker
        v-model="listQuery.display_time"
        type="datetimerange"
        range-separator="-"
        start-placeholder="起始时间"
        end-placeholder="结束时间"
        @change="handleFilter"
      />
      <el-cascader
        v-model="listQuery.dlValue"
        :options="dlOptions"
        clearable
        show-all-levels
        collapse-tags
        :props="{ expandTrigger: 'hover', multiple: true, checkStrictly: false }"
        @change="handleFilter"
      />
      <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="110" align="center">
        <template slot-scope="scope">
          <span @click="handleDetail(scope)">{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | statusTextFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <!-- <el-switch v-model="scope.row.status" active-value="draft" inactive-value="published" @change="switchState">
          </el-switch> -->
          <Myswitch :status="scope.row.status" @handleswitch="handleSwitch(scope.$index,$event)" />
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="created_at" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="editForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <!-- <el-form-item label="Type" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="Date" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.text" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Imp">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getList, updateList, deleteRow, getDL } from '@/api/table'
import waves from '@/directive/waves/index.js'
import Pagination from '@/components/Pagination'
import Myswitch from '@/components/OSwitch'

export default {
  components: { Pagination, Myswitch },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusText = {
        published: '已发布',
        draft: '草案'
      }
      return statusText[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        status: undefined,
        sort: '+id',
        display_time: undefined,
        dlValue: undefined
      },
      statusOptions: [
        { key: 'published', text: '已发布' },
        { key: 'draft', text: '草案' }],
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        // type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      dlOptions: null
    }
  },
  created() {
    this.fetchData()
    this.fecthDL()
  },
  methods: {
    // 获取表格数据
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 获取大类数据
    fecthDL() {
      getDL().then((response) => {
        this.dlOptions = response.data
      })
    },
    // 编辑
    handleEdit(row) {
      this.temp = Object.assign({}, row)
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['editForm'].clearValidate()
      })
    },
    // 提交编辑内容
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          // 这里是将 timestamp 从 标准时间格式 转换成 时间戳的格式 返回给后端，使其格式一致
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp)
          updateList(tempData).then(() => {
            // 这里的目的是将修改
            const index = this.list.findIndex(item => item.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete($index, row) {
      console.log(row)
      this.$confirm(`确定删除 ${row.author} 数据？`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteRow(row.id).then(() => {
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice($index, 1)
        })
      }).catch((err) => { console.log(err) })
    },
    // 打开详情
    handleDetail(scope) {
      this.$router.push(`/example/edit/${scope.row.id}`)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    // switch
    handleSwitch(index, val) {
      this.list[index].status = val
    }
  }
}
</script>
