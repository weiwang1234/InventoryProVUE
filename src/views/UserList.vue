<template>
    <div>
      <h2>用户列表</h2>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="name" label="用户名" width="180" />
        <el-table-column prop="email" label="邮箱" width="250" />
      </el-table>
    </div>
  </template>
  
  <script lang="ts" setup>
  const users = [
    { name: '张三', email: 'zhangsan@example.com' },
    { name: '李四', email: 'lisi@example.com' },
  ]
  </script>
  