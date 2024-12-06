import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import HomePage from '../views/HomePage.vue'
import MemberUser from '../views/MemberUser.vue'  // 会员用户页面
import ProductList from '../views/ProductList.vue'
import productmanagement from '../views/productmanagement.vue'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '',
        name: 'HomePage',
        component: HomePage,  // 首页内容
      },
      {
        path: 'member-user',
        name: 'MemberUser',
        component: MemberUser,  // 会员用户页面
      },
      {
        path: 'product-management',
        name: 'productmanagement',
        component: productmanagement,  // 会员用户页面
      },
      {
        path: 'product-list',
        name: 'ProductList',
        component: ProductList,  // 产品列表页面
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
