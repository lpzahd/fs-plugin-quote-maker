<script>
import { ref, computed } from 'vue';
import { ElForm, ElFormItem, ElCheckbox, ElInputNumber, ElInput, ElButton, ElMessage } from 'element-plus';
import ProductSelection from './ProductSelection.vue';

export default {
  components: {
    ElForm,
    ElFormItem,
    ElCheckbox,
    ElInputNumber,
    ElInput,
    ElButton,
    ProductSelection
  },
  props: {
    planName: {
      type: String,
      default: ''
    },
    products: {
      type: Array,
      required: true
    },
    selectedProducts: {
      type: Object,
      required: true
    },
    showDiscount: {
      type: Boolean,
      default: true
    },
    showQuantity: {
      type: Boolean,
      default: true
    },
    globalDiscount: {
      type: Number,
      default: 100
    },
    remarks: {
      type: String,
      default: ''
    },
    hasSelectedProducts: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:showDiscount', 'update:showQuantity', 'update:globalDiscount', 'update:remarks', 'update:planName', 'generateQuotePlan'],
  setup(props, { emit }) {
    // 计算属性，将props转换为可写的ref
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

    const planName = computed({
      get: () => props.planName,
      set: (value) => emit('update:planName', value)
    });

    const handleGenerateQuotePlan = () => {
      emit('generateQuotePlan');
    };

    // 应用统一折扣到所有选中的产品
    const applyUniformDiscount = () => {
      // 遍历所有产品
      for (const productId in props.selectedProducts) {
        // 只应用到已选中的产品
        if (props.selectedProducts[productId].checked) {
          props.selectedProducts[productId].discount = globalDiscount.value;
        }
      }
      ElMessage({
        message: '折扣已应用到所有选中的产品',
        type: 'success'
      });
    };

    return {
      showDiscount,
      showQuantity,
      globalDiscount,
      remarks,
      planName,
      handleGenerateQuotePlan,
      applyUniformDiscount
    };
  }
};
</script>

<template>
  <div class="quote-form">
    <el-form label-position="top">
      <el-form-item label="方案名称" size="large">
        <el-input
          v-model="planName"
          placeholder="请输入方案名称"
        />
      </el-form-item>

      <el-form-item label="显示设置" size="large">
        <div class="display-settings">
          <el-checkbox v-model="showDiscount">显示折扣设置</el-checkbox>
          <el-checkbox v-model="showQuantity">显示数量设置</el-checkbox>
        </div>
      </el-form-item>

      <el-form-item label="产品选择" size="large">
        <product-selection
          :products="products"
          :selected-products="selectedProducts"
          :show-discount="showDiscount"
          :show-quantity="showQuantity"
        />
      </el-form-item>

      <el-form-item label="统一设置折扣 (%)" size="large">
        <div class="uniform-discount-container">
          <el-input-number
            v-model="globalDiscount"
            :min="0"
            :max="100"
            :step="1"
            style="width: 80%"
          />
          <el-button
            type="primary"
            @click="applyUniformDiscount"
            :disabled="!hasSelectedProducts"
            style="width: 80px"
          >
            应用
          </el-button>
        </div>
        <div class="discount-hint">
          注：点击应用按钮，将此折扣应用到所有已选中的产品
        </div>
      </el-form-item>

      <el-form-item label="附加备注" size="large">
        <el-input
          v-model="remarks"
          type="textarea"
          :rows="4"
          :maxlength="500"
          placeholder="请输入附加备注（如保修期限、赠送礼品等）"
          class="remarks-input"
        />
      </el-form-item>

      <div class="button-group">
        <el-button 
          type="primary"
          size="large"
          @click="handleGenerateQuotePlan"
          :loading="isLoading"
          :disabled="!hasSelectedProducts"
          class="generate-btn"
        >
          生成报价方案
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.quote-form {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.display-settings {
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.remarks-input {
  width: 100%;
}

.uniform-discount-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.uniform-discount-container .el-input-number {
  flex: 1;
  height: 40px;
}

/* 确保输入框和按钮高度一致 */
.uniform-discount-container .el-input-number {
  height: 40px;
}

.uniform-discount-container .el-button {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.generate-btn {
  width: 200px;
}
</style>