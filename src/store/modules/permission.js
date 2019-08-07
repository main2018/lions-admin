import { asyncRoutes, constantRoutes } from '@/router'
import { getRole } from '@/utils/auth'

import { asyncRoutesMap } from '@/api/role'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
function filterAsyncRoutes(asyncRoutesMap, routes) {
  // if (!roles || !roles.length) return []

  // routes.forEach(r)
  routes.forEach(route => {
    const routeMap = asyncRoutesMap.find(asyncRoute => {
      return asyncRoute.hasOwnProperty(route.name)
    })
    route.component = routeMap[route.name]
    if (route.children) {
      route.children = filterAsyncRoutes(routeMap.children, route.children)
    }
  })
  // return routes.concat(baseRoute)
  return routes
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, { name, roles }) {
    console.log('roles', roles)
    return new Promise(resolve => {
      let accessedRoutes
      if (name === 'admin') {
        accessedRoutes = asyncRoutes || []
      } else if (roles && roles.includes('user')) {
        accessedRoutes = []
      } else {
        // accessedRoutes = asyncRoutes
        const role = getRole() || roles[0].id
        const currRole = roles.find(item => item.id === role) || {}
        const routes = JSON.parse(currRole.modules || '[]')
        accessedRoutes = filterAsyncRoutes(asyncRoutesMap, routes)
        const baseRoute = { path: '*', redirect: '/404', hidden: true }
        accessedRoutes.push(baseRoute)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
