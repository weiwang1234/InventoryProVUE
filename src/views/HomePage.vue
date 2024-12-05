<template>
    <div>
      <h2 style="font-size: 28px; color: #409EFF;">欢迎来到后台管理系统！</h2>
      <p style="color: #999;">这是后台管理系统的首页。您可以在左侧菜单中选择不同的功能来查看不同的内容。</p>
  
      <el-row :gutter="20" style="margin-top: 30px;">
        <el-col :span="8">
          <el-card shadow="hover" style="height: 200px; border-radius: 8px; background-color: #ffffff; border: 1px solid #ebeef5;">
            <h4>用户统计</h4>
            <p>当前系统有 500 名注册用户。</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" style="height: 200px; border-radius: 8px; background-color: #ffffff; border: 1px solid #ebeef5;">
            <h4>商品统计</h4>
            <p>当前系统有 1000 个商品。</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" style="height: 200px; border-radius: 8px; background-color: #ffffff; border: 1px solid #ebeef5;">
            <h4>系统状态</h4>
            <p>系统运行正常，负载较低。</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script lang="ts" setup>
  // 这里可以放置一些首页的具体逻辑，或直接展示静态内容
  </script>
  
  <style scoped>
  h2 {
    font-size: 28px;
    color: #409EFF;
  }
  
  .el-card {
    border-radius: 8px;
    background-color: #ffffff;
    border: 1px solid #ebeef5;
  }
  
  .el-row {
    margin-top: 30px;
  }
  </style>
  