import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/routes' // ✅ to‘g‘ri import yo‘li

import './assets/main.css' // optional

const app = createApp(App) // app instance yaratamiz
app.use(router)            // router ulaymiz
app.mount('#app')          // appni DOM ga biriktiramiz
