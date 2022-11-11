import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}

export function updateList(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}

export function deleteRow(data) {
  return request({
    url: '/vue-element-admin/article/delete',
    method: 'post',
    data
  })
}

export function getDetail(id) {
  return request({
    url: '/vue-element-admin/table/detail',
    method: 'post',
    params: { id }
  })
}

export function searchSite() {
  return request({
    url: '/vue-element-admin/table/sites',
    method: 'get'
  })
}

export function submitForm(data) {
  return request({
    url: '/vue-element-admin/article/submitForm',
    method: 'post',
    data
  })
}

export function draftForm(data) {
  return request({
    url: '/vue-element-admin/article/draftForm',
    method: 'post',
    data
  })
}

export function getDL() {
  return request({
    url: '/vue-element-admin/table/getDL',
    method: 'get'
  })
}

export function uploadImg(data) {
  return request({
    url: '/vue-element-admin/table/file',
    method: 'post',
    data
  })
}
