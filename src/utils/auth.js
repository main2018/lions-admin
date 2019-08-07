import Cookies from 'js-cookie'

const expires = 7

const TokenKey = 'Admin-Token'
const UserKey = 'Admin-User'
const RoleKey = 'Admin-Role'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setUser(user) {
  // return Cookies.set(UserKey, user)
  return Cookies.set(UserKey, user, { expires })
}

export function getUser() {
  return JSON.parse(Cookies.get(UserKey) || 'null')
}

export function setRole(role) {
  return Cookies.set(RoleKey, role, { expires })
}

export function getRole() {
  return Cookies.get(RoleKey)
}
