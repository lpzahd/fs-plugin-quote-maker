<template>
  <div class="quote-plan-page" ref="quotePlanPage">
    <el-card class="page-header" shadow="hover">
      <div class="header-content">
        <el-button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回报价管理
        </el-button>
        <h1>报价方案设置</h1>
      </div>
    </el-card>

    <div class="quote-form-container">
      <QuoteForm
        v-model:showDiscount="showDiscount"
        v-model:showQuantity="showQuantity"
        v-model:globalDiscount="globalDiscount"
        v-model:remarks="remarks"
        v-model:plan-name="planName"
        :products="products"
        :selected-products="selectedProducts"
        :hasSelectedProducts="hasSelectedProducts"
        :isLoading="isLoading"
        @generateQuotePlan="generateQuoteAndBack"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, computed } from 'vue';
import { ElButton, ElCard, ElIcon } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import QuoteForm from './QuoteForm.vue';

export default defineComponent({
  name: 'QuotePlanPage',
  components: {
    ElButton,
    ElCard,
    ElIcon,
    ArrowLeft,
    QuoteForm
  },
  props: {
    planName: String,
    showDiscount: Boolean,
    showQuantity: Boolean,
    globalDiscount: Number,
    remarks: String,
    products: Array,
    selectedProducts: Object,
    hasSelectedProducts: Boolean,
    isLoading: Boolean
  },
  setup(props, { emit }) {
    // Convert props to writable computed properties for two-way binding
    const showDiscount = computed({
      get: () => props.showDiscount,
      set: (value) => emit('update:showDiscount', value)
    });

    const showQuantity = computed({
      get: () => props.showQuantity,
      set: (value) => emit('update:showQuantity', value)
    });

    const globalDiscount = computed({
      get: () => props.globalDiscount,
      set: (value) => emit('update:globalDiscount', value)
    });

    const remarks = computed({
      get: () => props.remarks,
      set: (value) => emit('update:remarks', value)
    });

    // 添加planName计算属性
    const planName = computed({
      get: () => props.planName,
      set: (value) => emit('update:planName', value)
    });

    return {
      showDiscount,
      showQuantity,
      globalDiscount,
      remarks,
      planName
    };
  },
  mounted() {
    // 重置状态
    this.$emit('update:showDiscount', true);
    this.$emit('update:showQuantity', true);
    this.$emit('update:globalDiscount', 100);
    this.$emit('update:remarks', '');
    this.$emit('update:planName', '');
    
    // 重置选中的产品
    if (this.selectedProducts) {
      Object.keys(this.selectedProducts).forEach(key => {
        this.selectedProducts[key].checked = false;
        this.selectedProducts[key].discount = 100;
        this.selectedProducts[key].quantity = 1;
      });
    }
    
    // 动态设置高度
    this.$nextTick(() => {
      const contentHeight = this.$refs.quotePlanPage.scrollHeight;
      // this.$refs.quotePlanPage.style.height = `${contentHeight}px`;
    });
  },
  beforeUnmount() {
    this.$el.classList.remove('slide-in');
    this.$el.classList.add('slide-out');
  },
  emits: [
    'update:showDiscount',
    'update:showQuantity',
    'update:globalDiscount',
    'update:remarks',
    'update:planName',
    'generateQuotePlan',
    'goBack'
  ],
  methods: {
    goBack() {
      this.$emit('goBack');
    },
    generateQuoteAndBack() {
      this.$emit('generateQuotePlan');
      this.goBack();
    }
  }
});
</script>

<style scoped>
.quote-plan-page {
  max-width: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background-color: white;
}

.page-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #409eff, #69b1ff);
  color: white;
  border: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.quote-form-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}
</style>