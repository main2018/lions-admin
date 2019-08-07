<template>
  <div class="article-types">
    <el-dialog :visible.sync="typeShow">
      <el-form ref="typeForm" :model="type" label-width="80px" label-position="right" :rules="typeRules" status-icon>
        <!-- <el-form-item label="所属板块">
          <el-radio-group v-model="type.type">
            <el-radio :label="0">文章</el-radio>
            <el-radio :label="1">问题</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="type.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="typeShow = false">取 消</el-button>
        <el-button type="primary" @click="editing ? editCategory() : addCategory()">确 定</el-button>
      </span>
    </el-dialog>

    <el-table ref="dragTable" v-loading="listLoading" :data="types" row-key="index" border fit highlight-current-row style="width: 100%" cell-class-name="el-table-rect">

      <el-table-column align="left" label="类型名称" prop="value">
        <template slot-scope="scope">
          <!-- <template v-if="editing && currentIndex === scope.$index">
            <el-input v-model="scope.row.name" class="edit-input" size="small" />
          </template> -->
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column class-name="status-col" label="子类型">
        <template slot-scope="scope">
          <el-tag v-for="(item, index) in scope.row.subcategories" :key="item.index" closable @close="delTypesChild(scope.$index, index)">
            {{ item }}
          </el-tag>
          <el-input
            v-if="newTypeChildShow && currentIndex === scope.$index"
            :ref="`newTypeChildInput${scope.$index}`"
            v-model="newTypeChildValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.$index)"
            @blur="handleInputConfirm(scope.$index)"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.$index)">+ 新类型</el-button>
        </template>
      </el-table-column> -->
      <!-- <el-table-column align="center" label="类型模块" prop="value">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.hasImage" label="图片"></el-checkbox>
          <el-checkbox v-model="scope.row.hasVideo" label="视频"></el-checkbox>
          <el-checkbox v-model="scope.row.hasLink" label="链接"></el-checkbox>
          <el-checkbox v-model="scope.row.hasArticle" label="文章"></el-checkbox>
        </template>
      </el-table-column> -->
      <!-- <el-table-column align="center" label="排序" width="80" prop="order">
      </el-table-column> -->
      <el-table-column align="center" label="操作" width="300" fixed="right">
        <template slot-scope="scope">
          <!-- <el-button v-if="editing && currentIndex === scope.$index" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit">
            确定
          </el-button> -->
          <!-- <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="editing = true; currentIndex = scope.$index"> -->
          <el-button type="primary" size="mini" @click="toEditType(scope.$index)">
            编辑
          </el-button>
          <!-- <el-button type="warning" size="mini" @click="changeOrder(scope.$index)">
            排序
          </el-button> -->
          <el-button type="danger" size="mini" @click="delType(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>

      <!-- <el-table-column align="center" label="拖拽" width="80">
        <template slot-scope="{}">
          <svg-icon class="drag-handler" icon-class="drag" />
        </template>
      </el-table-column> -->
    </el-table>
    <div class="footer">
      <el-button type="success" @click="editing = false;type.name = ''; typeShow = true">添加类型</el-button>
    </div>
  </div>
</template>

<script type='text/ecmascript-6'>
/* eslint-disable */
import Sortable from 'sortablejs'
import { getCategories, updateCategory, addCategory, delCategory } from '@/api/category'
import { qiniuDomain } from '~/config/qiniu'
import { compare } from '@/utils'

export default {
  components: {
  },
  data() {
    return {
      qiniuDomain,
      listLoading: true,
      newTypeChildShow: false,
      editing: false,
      dialogVisible: false,
      currentIndex: 0,
      newTypeChildValue: '',
      cover: '',
      typeRules: {
        category: [
          { required: true, message: '类型英文不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '类型名称不能为空', trigger: 'blur' }
        ]
      },
      typeShow: false,
      type: {
        id: '',
        name: '',
        type: 0
      },
      types: [
        {
          index: 1,
          value: '类型0'
        },
        {
          index: 2,
          value: '类型1'
        }
      ]
    }
  },
  created() {
    this.getCategories()
  },
  mounted() {
    this.$nextTick(() => {
      this.setSort()
    })
  },
  methods: {
    changeOrder(index) {
      const order = this.types[index].order

      this.$prompt('请输入排序数值（正整数）', '数值越大越靠后', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'number',
        inputValue: order,
        inputPattern: /^[+]{0,1}(\d+)$/,
        inputErrorMessage: '输入内容不正确，请输入正整数'
      }).then(({ value }) => {
        value = Number(value)
        const orders = this.types.map(type => type.order)

        if (orders.includes(value)) {
          return this.$message.error(`序号${value}已被占用，请重新输入`)
        }
        // updateCategory(Object.assign({}, this.types[index], { order: value })).then(() => {
        //   this.$message.success('排序序号已修改')
        //   this.getCategories()
        // })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    getCategories() {
      getCategories().then(res => {
        const _list = res.data.list || []
        this.types = _list.sort(compare('order'))
        console.log('types:', this.types)
      }).finally(() => { this.listLoading = false })
    },
    addCategory() {
      this.$refs.typeForm.validate((valid, result) => {
        if (valid) {
          const { name, type } = this.type
          addCategory({ name, type }).then(resp => {
            this.$message.success(`类型添加成功`)
            this.getCategories()
            this.typeShow = false
          })
        } else {
          const message = ((Object.values(result)[0] || [])[0] || {}).message || '您有未填写的字段'
          this.$message.error(message)
          return false
        }
      })
    },
    editCategory() {
      this.$refs.typeForm.validate((valid, result) => {
        if (valid) {
          updateCategory(this.type.id, { name: this.type.name }).then(resp => {
            this.$message.success(`类型修改成功`)
            this.getCategories()
            this.typeShow = false
          })
        } else {
          const message = ((Object.values(result)[0] || [])[0] || {}).message || '您有未填写的字段'
          this.$message.error(message)
          return false
        }
      })
    },
    toEditType(index) {
      const { name, id } = this.types[index]
      this.type = {
        name,
        id
      }
      this.editing = true
      this.typeShow = true
      this.currentIndex = index
    },
    setCover(data) {
      if (data && data.length) {
        // const img = qiniuDomain + (data[0].response ? data[0].response.data.key : data[0].name)
        const img = (data[0].response ? data[0].response.key : data[0].name)
        this.cover = img
      }
    },
    saveCover() {
      this.$set(this.types[this.currentIndex], 'icon', this.cover)

      // updateCategory(this.types[this.currentIndex]).then(() => {
      //   this.$message.success('类型封面修改成功')
      //   this.dialogVisible = false
      //   this.cover = ''
      // })
    },
    confirmEdit(row) {
      // const currentType = this.types[this.currentIndex]
      // const { id, name } = currentType
      // updateCategory({ id, name }).then(resp => {
      //   this.editing = false
      //   this.$message({
      //     message: 'The title has been edited',
      //     type: 'success'
      //   })
      // })
    },
    showInput(index) {
      this.currentIndex = index
      this.newTypeChildShow = true
      this.$nextTick(_ => {
        this.$refs[`newTypeChildInput${index}`].$refs.input.focus()
      })
    },
    handleInputConfirm(index) {
      const value = this.newTypeChildValue
      const subcategories = this.types[index].subcategories
      if (!subcategories) this.types[index].subcategories = []

      // const maxIndex = Math.max(...this.types[index].subcategories.map(children => children.index))
      if (value) {
        // const data = {
        //   category: this.types[index].category,
        //   subcategory: value
        // }
        // addSubcategory(data).then(() => {
        //   this.$message.success('子类型添加成功')
        //   this.types[index].subcategories.push(value)
        // })
      }
      this.newTypeChildShow = false
      this.newTypeChildValue = ''
    },
    delType(index) {
      const id = this.types[index].id
      this.$confirm('确认删除？')
        .then(_ => {
          delCategory(id).then(() => {
            this.types.splice(index, 1)
            this.$message.success('类型删除成功')
          })
        })
        .catch(_ => {})
    },
    delTypesChild(rowIndex, index) {
      // const type = this.types[rowIndex]
      // delSubcategory({ category: type.category, subcategory: this.types[rowIndex].subcategories[index] }).then(() => {
      //   this.$message.success('子类型删除成功')
      //   this.types[rowIndex].subcategories.splice(index, 1)
      // })
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.types.splice(evt.oldIndex, 1)[0]
          this.types.splice(evt.newIndex, 0, targetRow)
        }
      })
    }
  }
}
</script>

<style lang='sass'>
.article-types
  .cover
    margin-left: 10px
    display: inline-block
    width: 150px
    vertical-align: middle
  .el-tag + .el-tag
    margin-left: 10px
  .button-new-tag
    margin-left: 10px
    height: 32px
    line-height: 30px
    padding-top: 0
    padding-bottom: 0
  .input-new-tag
    width: 90px
    margin-left: 10px
    vertical-align: bottom
.sortable-ghost
  opacity: .8
  color: #fff!important
  background: #42b983!important

.footer
  padding: 20px 0
  text-align: right
</style>
