<template>
  <div class="app-container">
    <div class="app-container-tree">
      <el-button v-if="!orgs || !orgs.length" type="primary" @click="add">新增</el-button>
      <div v-for="org in orgs" :key="org.id" class="app-container-tree-item">
        <tree :data="org" :props="props" collapsable :render-content="renderContent" @on-expand="onExpand" @on-node-click="onNodeClick"></tree>
      </div>
    </div>
    <el-dialog title="提示" width="550px" :visible.sync="editShow">
      <el-button type="primary" @click="add">同级新增</el-button>
      <el-button type="primary" @click="addChild">向下新增</el-button>
      <el-button type="success" @click="edit">重命名</el-button>
      <el-button type="danger" @click="del">删除</el-button>
      <el-button type="warning" @click="getPosition">职位</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editShow = false">取 消</el-button>
        <el-button type="primary" @click="editShow = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="职位图" width="550px" :visible.sync="positionShow" fullscreen custom-class="dialog-position">
      <p v-show="!position || !position.length">暂无数据~</p>
      <tree v-for="item in position" :key="item.id" :data="item" :props="propsPosition" collapsable @on-expand="onExpand"></tree>
    </el-dialog>
  </div>
</template>

<script>
import tree from '@/components/tree'

import { getOrgs, addOrg, updateOrg, delOrg } from '@/api/org'
import { getUserorgs, getUserorgsByPid } from '@/api/userorg'

export default {
  name: 'OrgOrganization',
  components: { tree },
  data() {
    return {
      editShow: false,
      orgs: null,
      position: null,
      editableTabsValue: '',
      props: {
        label: 'name',
        children: 'children',
        expand: 'expand'
      },
      propsPosition: {
        label: 'position',
        children: 'children',
        expand: 'expand'
      },
      treeData: {
        label: '1',
        expand: true,
        children: [
          {
            label: '01',
            expand: true,
            children: [
              {
                label: '001'
              },
              {
                label: '002'
              },
              {
                label: '003'
              }
            ]
          },
          {
            label: '02',
            expand: true,
            children: [
            ]
          }
        ]
      },
      parentArr: null,
      positionShow: false
    }
  },
  watch: {
    editableTabsValue: {
      handler() {
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    add() {
      this.$prompt('请输入模块名', '新增模块', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator(value) {
          return !!value
        },
        inputErrorMessage: '模块名不能为空'
      }).then(({ value: name }) => {
        const { pId, id } = this.currentOrg || {}
        addOrg(pId ? { pId, name } : { name }).then(res => {
          this.$message({
            type: 'success',
            message: '新增模块成功'
          })
          this.editShow = false
          this.findParentArr(this.orgs, id)

          this.parentArr && this.parentArr.push(res && res.data)
          this.parentArr = null
        })
      })
    },
    addChild() {
      this.$prompt('请输入子模块名', '新增子模块', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator(value) {
          return !!value
        },
        inputErrorMessage: '子模块名不能为空'
      }).then(({ value: name }) => {
        const { id: pId } = this.currentOrg || {}
        addOrg({ pId, name }).then(res => {
          this.$message({
            type: 'success',
            message: '新增子模块成功'
          })
          this.editShow = false
          this.findParentArr(this.orgs, pId)

          const org = (this.parentArr || []).find(item => item.id === pId)
          console.log('parentArr', this.parentArr)
          if (!org.children) this.$set(org, 'children', [])
          org.children.push(res && res.data)
          this.parentArr = null
        })
      })
    },
    edit() {
      const { id, name } = this.currentOrg
      this.$prompt('请输入模块名', '修改模块', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: name,
        inputValidator(value) {
          return !!value
        },
        inputErrorMessage: '模块名不能为空'
      }).then(({ value: name }) => {
        updateOrg({ id, name }).then(() => {
          this.$message({
            type: 'success',
            message: '模块已修改'
          })
          this.editShow = false

          this.$set(this.currentOrg, 'name', name)
          // console.log(this.findOrg(this.orgs, id))
          // console.log('this.org', this.org)
        })
      })
    },
    findParentArr(list, id) {
      if (!list || !list.length || !id) return

      const has = list.some(item => item.id === id)
      if (has) {
        this.parentArr = list
        return list
      }

      list.some(item => {
        // this.findParentArr(item.children, id)
        // return !!this.parentArr
        return !!this.findParentArr(item.children, id)
      })
    },
    del() {
      const { name } = this.currentOrg

      this.$confirm('删除此机构下属机构也将删除，继续？', `删除模块 > ${name}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(({ value: name }) => {
        this.getChildrenId(this.currentOrg)

        const pArr = this.childrenId.map(id => delOrg(id))
        this.childrenId = []
        const loading = this.$loading()
        Promise.all(pArr)
          .then(() => {
            this.$message({
              type: 'success',
              message: '模块已删除'
            })
            this.editShow = false
            this.getList()
          })
          .finally(() => { loading.close() })
      })
    },
    renderContent(h, data) {
      return data.name
    },
    onExpand(e, data) {
      if ('expand' in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        this.$set(data, 'expand', true)
      }
    },
    onNodeClick(e, data) {
      this.currentOrg = data
      this.editShow = true
    },
    collapse(list) {
      var _this = this
      list.forEach(function(child) {
        if (child.expand) {
          child.expand = false
        }
        child.children && _this.collapse(child.children)
      })
    },
    async getList() {
      const res = await getOrgs()
      const _list = res.data.list || []
      const orgs = _list.filter(item => !item.pId || item.pId === 'undefined')
      this.orgs = orgs
      this.editableTabsValue = orgs[0] && orgs[0].id
      this.getChildren(this.orgs)
    },
    async getPosition() {
      const orgId = this.currentOrg.id
      if (this.position && this.position[0] && this.position[0].orgId === orgId) {
        this.positionShow = true
        return
      }

      const loading = this.$loading()
      const res = await getUserorgs({ orgId })
      const _list = res.data.list || []
      const position = _list.filter(item => !item.pId || item.pId === 'undefined')
      this.position = position
      this.getPositionChildren(this.position)
      loading.close()
      this.positionShow = true
    },
    getPositionChildren(list) {
      if (!list || !list.length) return
      list.forEach(async org => {
        const pId = org.id

        const res = await getUserorgsByPid(pId)
        const data = res.data || []
        if (data.length) {
          this.$set(org, 'children', data)
          this.getPositionChildren(data)
        }
      })
    },
    getChildrenId(org) {
      if (!org) return

      if (!this.childrenId) this.childrenId = []
      this.childrenId.push(org.id)

      const children = org.children
      if (children && children.length) {
        // this.childrenId.concat(children.map(item => item.id))
        children.forEach(this.getChildrenId)
      }
    },
    getChildren(list) {
      if (!list || !list.length) return
      list.forEach(async org => {
        const pId = org.id
        const res = await getOrgs({ pId })
        const data = res.data.list || []
        if (data.length) {
          this.$set(org, 'children', data)
          // org.children = data
          this.getChildren(data)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.app-container{
  &-tree{
    text-align: center;
    font-size: 14px;
    &-item{
      overflow: auto;
    }
  }
}
.app-container-header{
  margin-bottom: 10px;
  padding: 0 0 10px;
  border-bottom: 1px solid #ccc;
}
.dialog-position .el-dialog__body{
  text-align: center;
}
</style>
