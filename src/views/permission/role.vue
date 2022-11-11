<template>
  <div class="app-container">
    <el-button type="primary" size="default" @click="handleAddRole">创建新角色</el-button>

    <el-table :data="rolesList" border stripe style="width: 100%;margin-top:30px;">
      <el-table-column align="center" label="角色Key" width="220">
        <template slot-scope="scope">
          {{ scope.row.key }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogType==='edit'?'编辑角色':'创建新角色'" :visible.sync="dialogVisible">
      <el-form :model="role" label-width="80px" :inline="false">
        <el-form-item label="角色名">
          <el-input v-model="role.name" placeholder="角色名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            placeholder="描述"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
          />
        </el-form-item>
        <el-form-item label="导航权限">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
          />
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible= false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, getRoles, deleteRole, updateRole, addRole } from '@/api/role'
const defaultRole = {
  key: '',
  name: '',
  description: '',
  routes: ''
}
export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [], // 重塑之后的路由
      rolesList: [], // 所有角色
      dialogVisible: false,
      dialogType: null,
      checkStrictly: false,
      defaultProps: {
        children: 'child',
        label: 'title'
      },
      serviceRoutes: []
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data)
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
    },
    generateRoutes(routes, basePath = '/') {
      const res = []
      for (let route of routes) {
        // 跳过隐藏的路由
        if (route.hidden) { continue }

        // 区块1：当只有0-1 个子路由时返回路由对象，执行下两步骤
        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title
        }

        // 区块2：有子路由时，执行这一步，会重新进入循环，将每个子路由作为父辈传入，执行其中的 === 0 判断
        if (route.children) {
          data.child = this.generateRoutes(route.children, data.path)
        }

        res.push(data)
      }
      return res
    },
    // 判断是否只有 0-1 个子路由，是的话将其返回，不是返回 false
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // 当只有一个子路由时，缺省显示该子路由
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // 如果没有子路由要显示，则显示父路由
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    },
    // 打开弹窗
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      // 此时 this.$refs.tree 还没有挂载上，所以要使用 this.$nextTick()
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.role.routes)
        this.$refs.tree.setCheckedNodes(routes)
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除该角色？', '提示', {
        type: 'warning'
      }).then(() => {
        deleteRole(row.key).then((result) => {
          this.rolesList.splice($index, 1)
          console.log(result)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
      }).catch((err) => { console.log(err) })
    },
    // 提交编辑信息
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      this.role.routes = this.generateTree(this.serviceRoutes, '/', checkedKeys)

      if (isEdit) {
        await updateRole(this.role.key, this.role)
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].key === this.role.key) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await addRole(this.role)
        this.role.key = data.key
        this.rolesList.push(this.role)
      }

      const { description, name, key } = this.role
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
        <div> 角色key: ${key} </div>
        <div> 角色名: ${name} </div>
        <div> 角色描述: ${description} </div>`,
        type: 'success'
      })
    },
    // 将角色routes对应的路由从路由表中提取出来
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []
      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }
        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    }
  }
}
</script>
