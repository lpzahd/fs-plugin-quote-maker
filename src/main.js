import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
// import {i18n} from './locales/i18n.js'
// createApp(App).use(i18n).mount('#app') // 注入国际化函数$t
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
 
const app = createApp(App);
 
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
 
app.use(ElementPlus);
app.mount('#app');
 