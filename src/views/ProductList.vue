<template>
    <div>
      <h2>商品列表</h2>
      <el-table :data="products" style="width: 100%">
        <el-table-column prop="name" label="商品名称" width="180" />
        <el-table-column prop="price" label="价格" width="100" />
      </el-table>
    </div>
  </template>
  
  <script lang="ts" setup>
  const products = [
    { name: '商品A', price: '100' },
    { name: '商品B', price: '200' },
  ]
  </script>
  