<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-radio-group v-model="role" @change="changeRole">
              <el-radio-button v-for="item in roles" :key="item && item.id" :label="item.id">{{ item | formatRole }}</el-radio-button>
            </el-radio-group>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import UserCard from './components/UserCard'

import { getUser, getRole } from '@/utils/auth'

export default {
  name: 'Profile',
  components: { UserCard },
  filters: {
    formatRole(value) {
      if (!value || value === 'user') return '普通用户'

      if (value === 'admin') return '超级管理员'
      return value && value.name
    }
  },
  data() {
    return {
      user: {},
      activeTab: 'activity',
      role: ''
    }
  },
  computed: {
    roles() {
      return this.$store.getters.roles || []
    }
  },
  created() {
    this.getUser()
    this.role = getRole() || this.roles[0].id
  },
  methods: {
    getUser() {
      this.user = getUser()
    },
    changeRole(val) {
      this.$store.dispatch('user/changeRoles', val)
    }
  }
}
</script>
