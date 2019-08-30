<template>
  <div class="app-container">
    <div class="app-container-tree">
      <el-button v-if="!orgs || !orgs.length" type="primary" @click="add">新增</el-button>
      <div v-for="org in orgs" :key="org.id" class="app-container-tree-item">
        <div class="app-container-tree-item-edit">
          <el-button type="warning" size="small" @click="showOrg(org)">
            所属机构
            <template v-if="getCurrOrg(org.orgId).name">
              <br>
              <span class="current-org">{{ getCurrOrg(org.orgId).name }}</span>
            </template>
          </el-button>
        </div>
        <tree :data="org" :props="props0" collapsable :render-content="renderContent" @on-expand="onExpand" @on-node-click="onNodeClick"></tree>
      </div>
    </div>
    <el-dialog title="提示" width="550px" :visible.sync="editShow">
      <el-button type="primary" @click="add">同级新增</el-button>
      <el-button type="primary" @click="addChild">向下新增</el-button>
      <el-button type="success" @click="edit">重命名</el-button>
      <el-button type="danger" @click="del">删除</el-button>
      <el-button type="warning" @click="showMember">分配人员</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editShow = false">取 消</el-button>
        <el-button type="primary" @click="editShow = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="选择机构" width="450px" :visible.sync="orgsShow">
      <p>当前机构：{{ (currOrganization && currOrganization.name) || '暂无' }}</p>
      <el-tree :props="props" node-key="id" :load="loadNode" lazy :expand-on-click-node="false" @node-click="handleNodeClick">
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>{{ node.label }}</span>
          <el-button
            type="text"
            size="mini"
            :disabled="currentOrg.orgId === data.id"
            @click="bindOrg(data)"
          >
            选定
          </el-button>
        </span>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editShow = false">取 消</el-button>
        <el-button type="primary" @click="editShow = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="选择成员" width="450px" :visible.sync="memberShow">
      <el-select v-model="currMember" filterable placeholder="请选择或搜索">
        <el-option
          v-for="user in users"
          :key="user.id"
          :label="user.realname || user.username || user.nickname"
          :value="user.id"
        >
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="memberShow = false">取 消</el-button>
        <el-button type="primary" @click="bindMember">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tree from '@/components/tree'

import { getUserorgs, getUserorgsByPid, addUserorg, updateUserorg, delUserorg } from '@/api/userorg'
import { getOrgs, getOrgById } from '@/api/org'
import { getUsers } from '@/api/user'

export default {
  name: 'OrgPosition',
  components: { tree },
  data() {
    return {
      editShow: false,
      orgs: null,
      editableTabsValue: '',
      props0: {
        label: 'name',
        children: 'children',
        expand: 'expand'
      },
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      treeData: [
        {
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
        }
      ],
      orgList: null,
      parentArr: null,
      orgsShow: false,
      currOrganization: null,
      memberShow: false,
      users: null,
      currMember: ''
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
    this.getUsers()
    this.getOrgList()
  },
  methods: {
    async bindMember() {
      const { id, userId } = this.currentOrg
      if (!this.currMember) this.$message.warning('请选择成员')
      if (userId === this.currMember) {
        this.memberShow = false
        return
      }
      const loading = this.$loading()
      await updateUserorg({ id, userId: this.currMember })
      this.$message.success('成功绑定职位')
      loading.close()
      this.memberShow = false
    },
    async showMember() {
      if (!this.users) {
        const loading = this.$loading()
        // const res = await getUsers()
        // users = ((res && res.data) || []).filter(user => user.username !== 'admin')
        // this.users = users
        await this.getUsers()
        loading.close()
      }
      this.memberShow = true
    },
    async getUsers() {
      const res = await getUsers()
      const users = ((res && res.data) || []).filter(user => user.username !== 'admin')
      this.users = users
    },
    async showOrg(org) {
      this.currentOrg = org
      const id = org.orgId
      const currOrganization = await getOrgById(id)
      this.currOrganization = currOrganization.data
      this.orgsShow = true
    },
    getCurrOrg(id) {
      if (!this.orgList) return {}
      return this.orgList.find(item => item.id === id) || {}
    },
    async getOrgList() {
      const res = await getOrgs()
      const _list = res.data.list || []
      // const orgList = _list.filter(item => !item.pId || item.pId === 'undefined')
      this.orgList = _list
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        getOrgs().then(res => {
          const _list = res.data.list || []
          const orgList = _list.filter(item => !item.pId || item.pId === 'undefined')
          resolve(orgList)
        })
        // return resolve([{ name: 'region' }])
      } else {
        const pId = node.data.id
        getOrgs({ pId }).then(res => {
          const _list = res.data.list || []
          resolve(_list)
        })
      }

      // setTimeout(() => {
      //   const data = [{
      //     name: 'leaf',
      //     leaf: true
      //   }, {
      //     name: 'zone'
      //   }]

      //   resolve(data)
      // }, 500)
    },
    bindOrg(data) {
      const { id: orgId, name } = data
      this.$confirm(`确认将本组织树绑定至机构<${name}>？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.getChildrenId(this.currentOrg)

        const pArr = this.childrenId.map(id => updateUserorg({ id, orgId }))
        this.childrenId = []
        const loading = this.$loading()
        Promise.all(pArr)
          .then(() => {
            this.$message({
              type: 'success',
              message: '绑定成功'
            })
            this.orgsShow = false
            this.getList()
          })
          .finally(() => { loading.close() })
      })
    },
    handleNodeClick(data) {
      // console.log('1')
    },
    add() {
      this.$prompt('请输入模块名', '新增模块', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator(value) {
          return !!value
        },
        inputErrorMessage: '模块名不能为空'
      }).then(({ value: position }) => {
        const { pId, id } = this.currentOrg || {}
        addUserorg(pId ? { pId, position } : { position }).then(res => {
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
      }).then(({ value: position }) => {
        const { id: pId } = this.currentOrg || {}
        addUserorg({ pId, position }).then(res => {
          this.$message({
            type: 'success',
            message: '新增子模块成功'
          })
          this.editShow = false
          this.findParentArr(this.orgs, pId)

          const org = (this.parentArr || []).find(item => item.id === pId)
          if (!org.children) this.$set(org, 'children', [])
          org.children.push(res && res.data)
          this.parentArr = null
        })
      })
    },
    edit() {
      const { id, position } = this.currentOrg
      this.$prompt('请输入模块名', '修改模块', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: position,
        inputValidator(value) {
          return !!value
        },
        inputErrorMessage: '模块名不能为空'
      }).then(({ value: position }) => {
        updateUserorg({ id, position }).then(() => {
          this.$message({
            type: 'success',
            message: '模块已修改'
          })
          this.editShow = false

          this.$set(this.currentOrg, 'position', position)
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
      const { position } = this.currentOrg
      this.$confirm('删除此职位下属职位也将删除，继续？', `删除模块 > ${position}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(({ value: position }) => {
        this.getChildrenId(this.currentOrg)
        console.log('childrenId', this.childrenId)

        const pArr = this.childrenId.map(id => delUserorg(id))
        this.childrenId = []
        const loading = this.$loading()
        Promise.all(pArr)
          .then(() => {
            this.$message({
              type: 'success',
              message: '职位已删除'
            })
            this.editShow = false
            this.getList()
          })
          .finally(() => { loading.close() })

        // delUserorg(id).then(() => {
        //   this.$message({
        //     type: 'success',
        //     message: '模块已删除'
        //   })
        //   loading.close()
        // })
        // this.getList()
      })
    },
    renderContent(h, data) {
      // return data.position
      const users = this.users || []
      const user = users.find(user => user.id === data.userId)
      const username = user && (user.realname || user.username || user.nickname)
      return h('div', [
        h('span', data.position),
        h('div', {
          attrs: {
            'class': 'icon icon-user'
          },
          domProps: {
            innerHTML: username
          },
          style: {
            display: username ? 'block' : 'none',
            marginTop: '5px',
            color: '#bbb',
            fontSize: '12px'
          }
        })
      ])
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
      this.currMember = data && data.userId
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
      const res = await getUserorgs()
      const _list = res.data.list || []
      const orgs = _list.filter(item => !item.pId || item.pId === 'undefined')
      this.orgs = orgs
      this.editableTabsValue = orgs[0] && orgs[0].id
      this.getChildren(this.orgs)
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

        const res = await getUserorgsByPid(pId)
        // const data = res.data.list || []
        const data = res.data || []
        console.log('pId', pId)
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

<style lang="scss" scoped>
.app-container{
  background-color: #eee;
  min-height: 90vh;
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
.current-org{
  margin-top: 5px;
  display: inline-block;
  color: rgba(255,255,255,.6);
  font-size: 12px;
}
.app-container-tree-item{
  margin-bottom: 10px;
  padding: 10px 0 0;
  border-radius: 5px;
  background-color: #fff;
}
</style>
