<script>
import { ref, computed } from 'vue';
import { ElCheckbox, ElSelect, ElOption, ElInput } from 'element-plus';

export default {
  components: {
    ElCheckbox,
    ElSelect,
    ElOption,
    ElInput
  },
  props: {
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
    }
  },
  setup(props) {
    // 验证折扣在有效范围内的函数
    const validateDiscount = (productId) => {
      const discount = props.selectedProducts[productId].discount;
      if (discount < 0) {
        props.selectedProducts[productId].discount = 0;
      } else if (discount > 100) {
        props.selectedProducts[productId].discount = 100;
      } else if (!Number.isInteger(discount)) {
        props.selectedProducts[productId].discount = Math.floor(discount);
      }
    };

    // 验证数量为整数的函数
    const validateQuantity = (productId) => {
      const quantity = props.selectedProducts[productId].quantity;
      if (quantity && !Number.isInteger(quantity)) {
        props.selectedProducts[productId].quantity = Math.floor(quantity);
      }
      if (quantity < 1) {
        props.selectedProducts[productId].quantity = 1;
      }
    };

    // 截断产品名称函数
    const truncateProductName = (name) => {
      if (!name) return '';
      if (name.length <= 8) return name;
      return name.substring(0, 8) + '...';
    };

    return {
      validateQuantity,
      validateDiscount,
      truncateProductName
    };
  }
};
</script>

<template>
  <div class="product-selection">
    <div v-for="product in products" :key="product.id" class="product-item">
      <el-checkbox
        v-model="selectedProducts[product.id].checked"
        class="product-checkbox"
        :title="product.name"
      >
        {{ truncateProductName(product.name) }} - ¥{{ product.price.toFixed(2) }}
      </el-checkbox>
      <div class="input-group"
           v-if="selectedProducts[product.id].checked && showDiscount">
        <span>折扣：</span>
        <el-input
          v-model.number="selectedProducts[product.id].discount"
          type="number"
          min="0"
          max="100"
          style="width: 80px"
          placeholder="输入折扣"
        />
      </div>
      <div class="input-group"
           v-if="selectedProducts[product.id].checked && showQuantity">
        <span>数量：</span>
        <el-input
          v-model.number="selectedProducts[product.id].quantity"
          type="number"
          min="1"
          style="width: 80px"
          @input="validateQuantity(product.id)"
        />
      </div>
    </div>
    <div v-if="products && products.length === 0"
         class="no-products">
      未找到产品数据，请确保表格中包含'产品名称'和'价格'字段
    </div>
  </div>
</template>

<style scoped>
.product-selection {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

@media screen and (max-width: 500px) {
  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .input-group {
    margin-left: 0;
    margin-top: 5px;
  }
}

.product-checkbox {
  flex: 1;
  margin-right: 10px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
}

.input-group span {
  margin-right: 5px;
}

.no-products {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>