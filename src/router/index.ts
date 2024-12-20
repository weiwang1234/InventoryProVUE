import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import HomePage from '../views/HomePage.vue'
import MemberUser from '../views/MemberUser.vue'  // 会员用户页面
import Orderslist from '../views/Orderslist.vue'
import productmanagement from '../views/productmanagement.vue'
import partnermanagement from '../views/partnermanagement.vue'
import UserList from '../views/UserList.vue'
import Ordersquery from '../views/Ordersquery.vue'
import inventoryquery from '../views/inventoryquery.vue'
import PurchaseOrdersList from '../views/PurchaseOrdersList.vue'
import PurchaseSummaryQuery from '../views/PurchaseSummaryQuery.vue'







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
        path: 'partner-management',
        name: 'partnermanagement',
        component: partnermanagement,  // 会员用户页面
      },
      {
        path: 'Orders-list',
        name: 'Orderslist',
        component: Orderslist,  // 产品列表页面
      },
      {
        path: 'User-list',
        name: 'UserList',
        component: UserList,  // 产品列表页面
      },
      {
        path: 'Orders-query',
        name: 'Ordersquery',
        component: Ordersquery,  // 产品列表页面
      },
      {
        path: 'inventory-query',
        name: 'inventoryquery',
        component: inventoryquery,  // 产品列表页面
      },
      {
        path: 'PurchaseOrders-list',
        name: 'PurchaseOrdersList',
        component: PurchaseOrdersList,  // 产品列表页面
      },
      {
        path: 'PurchaseSummary-Query',
        name: 'PurchaseSummaryQuery',
        component: PurchaseSummaryQuery,  // 产品列表页面
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
