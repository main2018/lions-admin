import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, setUser, setRole } from '@/utils/auth'
import { getUserRole } from '@/api/user'

import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)

        const userinfo = data.userinfo || {}

        setUser(userinfo)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const userId = data.id
        const { name, avatar, introduction } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        getUserRole(userId).then(res => {
          const roles = name === 'admin' ? ['admin'] : (res.data && res.data.length) ? res.data : ['user']

          // roles must be a non-empty array
          // if (!roles || roles.length <= 0) {
          //   // location.replace(location.href.split('#')[0] + '/profile/index')
          //   reject('该账号尚未分配角色,请联系管理员分配角色')
          // }

          // commit('SET_ROLES', roles)
          // commit('SET_NAME', name)
          // commit('SET_AVATAR', avatar)
          // commit('SET_INTRODUCTION', introduction)
          commit('SET_ROLES', roles)
          resolve({ ...data, roles })
        }).catch(() => {
          console.log('获取角色失败')
          const roles = name === 'admin' ? ['admin'] : ['user']
          commit('SET_ROLES', roles)
          resolve({ ...data, roles })
        })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        dispatch('tagsView/delAllViews', null, { root: true })
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      // const token = role + '-token'

      // commit('SET_TOKEN', token)
      setRole(role)
      // setToken(token)

      // const { roles } = await dispatch('getInfo')
      const userinfo = await dispatch('getInfo')
      const userId = userinfo.id
      const roles = await getUserRole(userId)

      resetRouter()

      // generate accessible routes map based on roles
      // const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
      const accessRoutes = await dispatch('permission/generateRoutes', { userinfo, roles: roles && roles.data }, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
