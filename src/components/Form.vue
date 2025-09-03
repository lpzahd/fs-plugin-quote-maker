<script>
import { bitable } from '@lark-base-open/js-sdk';
import { ref, onMounted, computed, watch } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElCard,
  ElDivider,
  ElMessage,
  ElTooltip,
  ElIcon,
} from 'element-plus';
import draggable from 'vuedraggable'
import QuotePlanPage from './QuotePlanPage.vue';
import CompanyInfoPage from './CompanyInfoPage.vue';
import 'element-plus/dist/index.css';
import { HelpFilled, Delete, Refresh } from '@element-plus/icons-vue';

export default {
  components: {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElCard,
    ElDivider,
    ElTooltip,
    ElIcon,
    HelpFilled,
    Refresh,
    QuotePlanPage,
    CompanyInfoPage,
    draggable
  },
  setup() {
    // 会员状态变量
    const isVip = ref(false); // true表示会员，false表示非会员

    // 开通会员按钮点击事件
     const openVip = async () => {
       ElMessage.success('跳转到开通会员页面');
       // const url = 'https://wxahtwfzdz8.feishu.cn/share/base/form/shrcnTB33sNyTXwM2BJekHxTdtc'
       const url = 'https://wxahtwfzdz8.feishu.cn/share/base/form/shrcnoBJfX6RsdigxG7MV8zUfkd'
       const bridge = bitable.bridge
       const baseUserId = await bridge.getBaseUserId()
       const tenantId = await bridge.getTenantKey()
       const uri = url + `?prefill_u_id=${baseUserId}&hide_u_id=1&prefill_t_id=${tenantId}&hide_t_id=1`
       window.open(uri, '_blank');
       // 这里可以添加跳转到会员开通页面的逻辑

       isVip.value = true
     };

    // 定义字段类型常量
    const FieldType = {
      Text: 1,
      Number: 2,
      SingleSelect: 3,
      DateTime: 5,
      Phone: 13,
      Url: 15,
      Attachment: 17,
      SingleLink: 18,
      CreatedTime: 1001,
      CreatedUser: 1003,
      ModifiedUser: 1004,
      AutoNumber: 1005,
      Currency: 99003
    };

    // const formData = ref({ table: '' });
    const productTableId = ref('');
    const companyInfoTableId = ref('');
    const quotePlanTableId = ref('');
    const quotePlanBrowseCountTableId = ref('');
    const quotePlanBrowseTableId = ref('');
    const tableMetaList = ref([]);
    const products = ref([]);
    const selectedProducts = ref({});
    const quotePlans = ref([]);
    const globalDiscount = ref(100);
    const isLoading = ref(false);
    const showHelp = ref(false);
    const planName = ref('');
    const showDiscount = ref(true);
    const showQuantity = ref(true);
    // 附加备注
    const remarks = ref('');
    // 产品表格状态
    const productTableStatus = ref('initial'); // initial, loading, success, error
    const productTableStatusText = ref('');
    // 企业信息表格状态
    const companyInfoTableStatus = ref('initial'); // initial, loading, success, error
    const companyInfoTableStatusText = ref('');
    // 报价方案表格状态
    const quotePlanTableStatus = ref('initial'); // initial, loading, success, error
    const quotePlanTableStatusText = ref('');
    // 报价浏览次数表表格状态
    const quotePlanBrowseCountTableStatus = ref('initial'); // initial, loading, success, error
    const quotePlanBrowseCountTableStatusText = ref('');
    // 报价浏览时长表表格状态
    const quotePlanBrowseTableStatus = ref('initial'); // initial, loading, success, error
    const quotePlanBrowseTableStatusText = ref('');

    // 计算属性：检查是否有选中的产品
    const hasSelectedProducts = computed(() => {
      return Object.values(selectedProducts.value || {}).some(item => item.checked);
    });

    // 创建默认表格
    const createDefaultTable = async () => {
      isLoading.value = true;
      try {
        // 检查产品报价表是否存在，如果不存在则进行创建
        ElMessage.success('检查产品报价表是否存在');
        const productTableExist = await existsTableByName('产品报价表');
        if (!productTableExist) {
          await createProductTable();
        }
        ElMessage.success('检查企业信息表是否存在');
        const companyInfoTableExist = await existsTableByName('企业信息表');
        if (!companyInfoTableExist) {
          await createCompanyInfoTable();
        }
        ElMessage.success('检查报价方案表是否存在');
        const quotePlanTableExist = await existsTableByName('报价方案表');
        let quotePlanTableId = '';
        if (!quotePlanTableExist) {
          quotePlanTableId = await createQuotePlanTable();
        } else {
          const table = await bitable.base.getTableByName('报价方案表');
          quotePlanTableId = table.id;
        }

        ElMessage.success('检查报价浏览次数表是否存在');
        const quotePlanBrowseCountTableExist = await existsTableByName('报价浏览次数表');
        if (!quotePlanBrowseCountTableExist) {
          await createQuotePlanBrowseCountTable(quotePlanTableId);
        }

        ElMessage.success('检查报价浏览时长表是否存在');
        const quotePlanBrowseTableExist = await existsTableByName('报价浏览时长表');
        if (!quotePlanBrowseTableExist) {
          await createQuotePlanBrowseTable(quotePlanTableId);
        }
        
        // 刷新表格列表
        const tableList = await bitable.base.getTableMetaList();
        tableMetaList.value = tableList;

      } catch (error) {
        ElMessage.error('创建表格失败: ' + error.message);
        console.error('创建表格失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 加载产品数据
    const loadProducts = async () => {
      const tableId = productTableId.value;
      if (!tableId) {
        productTableStatus.value = 'initial';
        productTableStatusText.value = '';
        return;
      }

      isLoading.value = true;
      productTableStatus.value = 'loading';
      productTableStatusText.value = '正在加载产品数据...';

      try {
        const table = await bitable.base.getTableById(tableId);
        // 获取全部字段
        const fields = await table.getFieldList();
        
        // 创建字段名称到ID的映射
        const fieldMap = new Map();
        for (const field of fields) {
          const name = await field.getName();
          fieldMap.set(name, field.id);
        }
        
        // 检查是否包含必要字段
        if (!fieldMap.has('产品名称') || !fieldMap.has('价格') || !fieldMap.has('产品功能介绍')) {
          productTableStatus.value = 'error';
          productTableStatusText.value = '表格选取失败：缺少"产品名称"或"价格"或者"产品功能介绍"字段';
          ElMessage.error(productTableStatusText.value);
          return;
        }

        // 获取记录
        const recordsRes = await table.getRecords({});
        const records = recordsRes.records
        console.info('记录是', records)
        
        // 从records中根据字段id提取产品名称和价格
        products.value = records.map(record => ({
          id: record.recordId,
          name: record.fields[fieldMap.get('产品名称')]?.text || '未命名产品',
          description: record.fields[fieldMap.get('产品功能介绍')].map(it => it.text).join(''),
          price: record.fields[fieldMap.get('价格')] || 0
        }));

        // 初始化选中产品对象
        products.value.forEach(product => {
          if (!selectedProducts.value[product.id]) {
            selectedProducts.value[product.id] = {
              checked: false,
              discount: 100, // 默认不打折
              quantity: 1
            };
          }
        });

        // 加载成功
        productTableStatus.value = 'success';
        productTableStatusText.value = `产品表加载成功，共${products.value.length}个产品`;
        ElMessage.success('加载产品表成功');

      } catch (error) {
        productTableStatus.value = 'error';
        productTableStatusText.value = '加载产品失败: ' + error.message;
        ElMessage.error(productTableStatusText.value);
        console.error('加载产品失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 加载企业信息表
    const loadCompanyTable = async () => {
      const tableId = companyInfoTableId.value;
      if (!tableId) {
        companyInfoTableStatus.value = 'initial';
        companyInfoTableStatusText.value = '';
        return;
      }

      isLoading.value = true;
      companyInfoTableStatus.value = 'loading';
      companyInfoTableStatusText.value = '正在加载产品数据...';

      try {
        const table = await bitable.base.getTableById(tableId);
        // 获取全部字段
        const fields = await table.getFieldList();
        
        // 创建字段名称到ID的映射
        const fieldMap = new Map();
        for (const field of fields) {
          const name = await field.getName();
          fieldMap.set(name, field.id);
        }
        
        // 检查字段是否缺失
        const necessaryFields = [
          // '编号',
          '企业名称',
          '联系人',
          '微信',
          '电话',
          '企业Logo选用方式',
          '企业Logo附件',
          '企业Logo链接',
          '二维码选用方式',
          '二维码附件',
          '二维码内容',
          '二维码Logo',
          '最终企业Logo',
          '最终二维码',
          '条款和条件',
          '多维表格APP_TOKEN',
          '机器人App_ID',
          '机器人App_Secret'
        ]
        if (necessaryFields.some(field => !fieldMap.has(field))) {
          companyInfoTableStatus.value = 'error';
          companyInfoTableStatusText.value = '企业信息表加载失败';
          ElMessage.error(companyInfoTableStatusText.value);
          return;
        }

        // 加载成功
        companyInfoTableStatus.value = 'success';
        companyInfoTableStatusText.value = `✅`;
        ElMessage.success('加载企业信息表成功');

      } catch (error) {
        companyInfoTableStatus.value = 'error';
        companyInfoTableStatusText.value = '加载企业信息表失败: ' + error.message;
        ElMessage.error(companyInfoTableStatusText.value);
        console.error('加载企业信息表失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 加载报价方案表
    const loadQuotePlanTable = async () => {
      const tableId = quotePlanTableId.value;
      if (!tableId) {
        quotePlanTableStatus.value = 'initial';
        quotePlanTableStatusText.value = '';
        return;
      }

      isLoading.value = true;
      quotePlanTableStatus.value = 'loading';
      quotePlanTableStatusText.value = '正在加载报价方案数据...';

      try {
        const table = await bitable.base.getTableById(tableId);
        // 获取全部字段
        const fields = await table.getFieldList();
        
        // 创建字段名称到ID的映射
        const fieldMap = new Map();
        for (const field of fields) {
          const name = await field.getName();
          fieldMap.set(name, field.id);
        }
        
        // 检查字段是否缺失
        const necessaryFields = [
          // '编号',
          '报价方案',
          '创建时间'
        ]
        if (necessaryFields.some(field => !fieldMap.has(field))) {
          quotePlanTableStatus.value = 'error';
          quotePlanTableStatusText.value = '报价方案表加载失败';
          ElMessage.error(quotePlanTableStatusText.value);
          return;
        }

        // 加载成功
        quotePlanTableStatus.value = 'success';
        quotePlanTableStatusText.value = `✅`;
        ElMessage.success('加载报价方案表成功');

      } catch (error) {
        quotePlanTableStatus.value = 'error';
        quotePlanTableStatusText.value = '加载报价方案表失败: ' + error.message;
        ElMessage.error(quotePlanTableStatusText.value);
        console.error('加载报价方案表失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 加载报价浏览次数表
    const loadQuotePlanBrowseCountTable = async () => {
      const tableId = quotePlanBrowseCountTableId.value;
      if (!tableId) {
        quotePlanBrowseCountTableStatus.value = 'initial';
        quotePlanBrowseCountTableStatusText.value = '';
        return;
      }

      isLoading.value = true;
      quotePlanBrowseCountTableStatus.value = 'loading';
      quotePlanBrowseCountTableStatusText.value = '正在加载报价方案浏览次数数据...';

      try {
        const table = await bitable.base.getTableById(tableId);
        // 获取全部字段
        const fields = await table.getFieldList();
        
        // 创建字段名称到ID的映射
        const fieldMap = new Map();
        for (const field of fields) {
          const name = await field.getName();
          fieldMap.set(name, field.id);
        }
        
        // 检查字段是否缺失
        const necessaryFields = [
          // '编号',
          '报价方案',
          '日期',
          'IP',
          '浏览器类型与版本',
          '操作系统',
          '语言'
        ]
        if (necessaryFields.some(field => !fieldMap.has(field))) {
          quotePlanBrowseCountTableStatus.value = 'error';
          quotePlanBrowseCountTableStatusText.value = '报价浏览次数表加载失败';
          ElMessage.error(quotePlanBrowseCountTableStatusText.value);
          return;
        }

        // 加载成功
        quotePlanBrowseCountTableStatus.value = 'success';
        quotePlanBrowseCountTableStatusText.value = `✅`;
        ElMessage.success('加载报价浏览次数表成功');

      } catch (error) {
        quotePlanBrowseCountTableStatus.value = 'error';
        quotePlanBrowseCountTableStatusText.value = '加载报价浏览次数表失败: ' + error.message;
        ElMessage.error(quotePlanBrowseCountTableStatusText.value);
        console.error('加载报价浏览次数表失败', error);
      } finally {
        isLoading.value = false;
      }
    }

    // 加载报价浏览时长表
    const loadQuotePlanBrowseTable = async () => {
      const tableId = quotePlanBrowseTableId.value;
      if (!tableId) {
        quotePlanBrowseTableStatus.value = 'initial';
        quotePlanBrowseTableStatusText.value = '';
        return;
      }

      isLoading.value = true;
      quotePlanBrowseTableStatus.value = 'loading';
      quotePlanBrowseTableStatusText.value = '正在加载报价方案浏览时长数据...';

      try {
        const table = await bitable.base.getTableById(tableId);
        // 获取全部字段
        const fields = await table.getFieldList();
        
        // 创建字段名称到ID的映射
        const fieldMap = new Map();
        for (const field of fields) {
          const name = await field.getName();
          fieldMap.set(name, field.id);
        }
        
        // 检查字段是否缺失
        const necessaryFields = [
          // '编号',
          '报价方案',
          '浏览时长',
          '日期',
          'IP',
          '浏览器类型与版本',
          '操作系统',
          '语言'
        ]
        if (necessaryFields.some(field => !fieldMap.has(field))) {
          quotePlanBrowseTableStatus.value = 'error';
          quotePlanBrowseTableStatusText.value = '报价浏览时长表加载失败';
          ElMessage.error(quotePlanBrowseTableStatusText.value);
          return;
        }

        // 加载成功
        quotePlanBrowseTableStatus.value = 'success';
        quotePlanBrowseTableStatusText.value = `✅`;
        ElMessage.success('加载报价浏览时长表成功');

      } catch (error) {
        quotePlanBrowseTableStatus.value = 'error';
        quotePlanBrowseTableStatusText.value = '加载报价浏览时长表失败: ' + error.message;
        ElMessage.error(quotePlanBrowseTableStatusText.value);
        console.error('加载报价浏览时长表失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 生成报价方案
    const generateQuotePlan = () => {
      const selectedItems = Object.entries(selectedProducts.value)
        .filter(([id, { checked }]) => checked)
        .map(([id, { discount, quantity }]) => {
          const product = products.value.find(p => p.id === id);
          return { ...product, discount, quantity };
        });

      console.info('selectedItems', selectedItems)
      if (selectedItems.length === 0) {
        ElMessage.warning('请选择至少一个产品');
        return;
      }

      // 计算产品级折扣后的小计
      const productLevelSubtotal = selectedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity * item.discount / 100);
      }, 0);
      
      // // 应用全局折扣
      // const globalDiscountAmount = productLevelSubtotal * (100 - globalDiscount.value) / 100;
      // const total = productLevelSubtotal - globalDiscountAmount;
      // 移除全局折扣
      const total = productLevelSubtotal;

      // 计算总计优惠金额
      const originalSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalDiscountAmount = originalSubtotal - total;

      // 添加到报价方案列表
      const id = Date.now()
      const planNameText = planName.value.trim() || `报价方案 #${id.toString().slice(-4) + 1}`;
      // 获取附加备注
      const remarksText = remarks.value.trim();

      quotePlans.value.push({          
        id,          
        planName: planNameText,          
        items: [...selectedItems],          
        originalSubtotal, 
        productLevelSubtotal,          
        // globalDiscount: globalDiscount.value,          
        totalDiscountAmount,          
        total,          
        remarks: remarksText        
      });

      ElMessage.success('报价方案生成成功！');
    };

    // 移除报价方案
    const removeQuotePlan = (id) => {
      quotePlans.value = quotePlans.value.filter(plan => plan.id !== id);
      ElMessage.success('报价方案已删除');
    };

    // 页面状态管理
    const currentPage = ref('main'); // 'main', 'quotePlan' 或 'companyInfo'
    const showQuotePlan = ref(false);
    const showCompanyInfo = ref(false);
    // // 企业信息
    // const companyInfo = ref({
    //   companyName: localStorage.getItem('companyName') || '',
    //   contactPerson: localStorage.getItem('contactPerson') || '',
    //   wechat: localStorage.getItem('wechat') || '',
    //   phone: localStorage.getItem('phone') || '',
    //   logoUrl: localStorage.getItem('logoUrl') || '',
    //   qrcodeUrl: localStorage.getItem('qrcodeUrl') || ''
    // });

    // 切换到报价方案设置页面
    const goToQuotePlanPage = () => {
      showQuotePlan.value = true;
    };

    // 返回主页面
    const goBackToMainPage = () => {
      showQuotePlan.value = false;
      showCompanyInfo.value = false;
    };

    // 切换到企业信息页面
    const goToCompanyInfoPage = () => {
      if (companyInfoTableStatus.value != 'success') {
        ElMessage.warning('请先选择企业信息表');
        return;
      }
      showCompanyInfo.value = true;
    };

    // 保存企业信息
    const saveCompanyInfo = (info) => {
      // companyInfo.value = {...info};
    };

    const handleAfterLeave = () => {
      currentPage.value = 'main'
    };

    // 监听showQuotePlan状态变化以更新currentPage
    watch(showQuotePlan, (newVal) => {
      if (newVal) {
        currentPage.value = 'quotePlan';
      } else {
        // 不在这里立即修改currentPage，保持主视图始终显示
      }
    });

    // 跳转到指定的报价方案
    const scrollToQuote = (planId) => {
      const element = document.getElementById(`quote-plan-${planId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    onMounted(async () => {
      try {
        const [tableList, selection] = await Promise.all([
          bitable.base.getTableMetaList(),
          bitable.base.getSelection()
        ]);
        tableMetaList.value = tableList;

        const productTableExist = await existsTableByName("产品报价表")
        if (productTableExist) {
          const productTable = await bitable.base.getTableByName("产品报价表");
          productTableId.value = productTable.id;
        } else {
          productTableId.value = selection.tableId;
        }

        // 如果有选中的表格，加载产品数据
        if (productTableId.value) {
          loadProducts();
        }

        const companyInfoTableExist = await existsTableByName("企业信息表")
        if (companyInfoTableExist) {
          const companyInfoTable = await bitable.base.getTableByName("企业信息表");
          companyInfoTableId.value = companyInfoTable.id;
        }

        // 如果有选中的表格，加载企业信息表
        if (companyInfoTableId.value) {
          loadCompanyTable();
        }

        const quotePlanTableExist = await existsTableByName("报价方案表")
        if (quotePlanTableExist) {
          const quotePlanTable = await bitable.base.getTableByName("报价方案表");
          quotePlanTableId.value = quotePlanTable.id;
        }

        // 如果有选中的表格，加载报价方案表
        if (quotePlanTableId.value) {
          loadQuotePlanTable();
        }

        const quotePlanBrowseCountTableExist = await existsTableByName("报价浏览次数表")
        if (quotePlanBrowseCountTableExist) {
          const quotePlanBrowseCountTable = await bitable.base.getTableByName("报价浏览次数表");
          quotePlanBrowseCountTableId.value = quotePlanBrowseCountTable.id;
        }

        // 如果有选中的表格，加载报价浏览次数表
        if (quotePlanBrowseCountTableId.value) {
          loadQuotePlanBrowseCountTable();
        }

        const quotePlanBrowseTableExist = await existsTableByName("报价浏览时长表")
        if (quotePlanBrowseTableExist) {
          const quotePlanBrowseTable = await bitable.base.getTableByName("报价浏览时长表");
          quotePlanBrowseTableId.value = quotePlanBrowseTable.id;
        }

        // 如果有选中的表格，加载报价浏览时长表
        if (quotePlanBrowseTableId.value) {
          loadQuotePlanBrowseTable();
        }

      } catch (error) {
        console.error('初始化失败', error);
      }
    });

    // 安全的获取附件链接
    const safeGetAttachmentUrls = async (field, recordId) => {
      try {
        return await field?.getAttachmentUrls(recordId) || []
      } catch (error) {
        console.warn('获取附件链接失败:', error);
        return []
      }
    }

    // 加载附件 URL，返回 base64 格式的 data URL
    const readAttachmentUrl = (url) => {
      return fetch(url)
        .then(response => response.blob())
        .then(blob => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
        .catch(error => {
          console.error('获取图片失败:', error);
          return null;
        });
    };

    // 从表格中读取企业信息
    const readCompanyInfoFromTable = async () => {
      if (!companyInfoTableId.value) {
        throw new Error('未能加载企业信息表')
      }

      const table = await bitable.base.getTableById(companyInfoTableId.value)

      if (!table) {
        throw new Error('未能加载企业信息表')
      }

      const recordList = await table.getRecordList()
      if (recordList.length == 0) {
        throw new Error('企业信息表暂无数据，请先设置企业信息')
      }

      if (recordList.length > 1) {
        ElMessage.warning('企业信息表中存在多条数据，建议仅保留一条');
      }

      const companyInfo = {

      }

      for (const record of recordList) {
        // 企业名称
        const companyNameField = await table.getField('企业名称');
        const companyNameCell = await record.getCellByField(companyNameField);
        const companyNameValue = await companyNameCell.getValue();
        console.info('companyNameCell', companyNameValue)
        companyInfo.companyName = companyNameValue?.[0]?.text || '';
        
        // 联系人
        const contactPersonField = await table.getField('联系人');
        const contactPersonCell = await record.getCellByField(contactPersonField);
        const contactPersonValue = await contactPersonCell.getValue();
        console.info('contactPersonCell', contactPersonValue)
        companyInfo.contactPerson = contactPersonValue?.[0]?.text || '';

        // 微信
        const wechatField = await table.getField('微信');
        const wechatCell = await record.getCellByField(wechatField);
        const wechatValue = await wechatCell.getValue();
        console.info('wechatCell', wechatValue)
        companyInfo.wechat = wechatValue?.[0]?.text || '';

        // 电话
        const phoneField = await table.getField('电话');
        const phoneCell = await record.getCellByField(phoneField);
        const phoneValue = await phoneCell.getValue();
        console.info('phoneCell', phoneValue)
        companyInfo.phone = phoneValue || '';
        
       
        // 最终二维码
        const finalLogoAttachmentField = await table.getField('最终企业Logo')
        const finalLogoAttachmentUrls = await safeGetAttachmentUrls(finalLogoAttachmentField, record.id)
        if (finalLogoAttachmentUrls?.length > 0) {
          const finalLogoAttachmentUrl = finalLogoAttachmentUrls[0]
          console.info('finalLogoAttachmentUrl', finalLogoAttachmentUrl)
          companyInfo.logoBase64 = await readAttachmentUrl(finalLogoAttachmentUrl)
        } 

        // 最终二维码
        const qrcodeFinalAttachmentField = await table.getField('最终二维码')
        const qrcodeFinalAttachmentUrls = await safeGetAttachmentUrls(qrcodeFinalAttachmentField, record.id)
        if (qrcodeFinalAttachmentUrls?.length > 0) {
          const qrcodeFinalAttachmentUrl = qrcodeFinalAttachmentUrls[0]
          console.info('qrcodeFinalAttachmentUrl', qrcodeFinalAttachmentUrl)
          companyInfo.qrcodeBase64 = await readAttachmentUrl(qrcodeFinalAttachmentUrl)
        } 

        // 条款和条件
        const termsAndConditionsField = await table.getField('条款和条件')
        const termsAndConditionsCell = await record.getCellByField(termsAndConditionsField);
        const termsAndConditionsValue = await termsAndConditionsCell.getValue();
        console.info('termsAndConditionsCell', termsAndConditionsValue)
        companyInfo.termsAndConditions = (termsAndConditionsValue?.map(it => it.text).join('') || '').trim().split('\n');

        // 多维表格APP_TOKEN
        const appTokenField = await table.getField('多维表格APP_TOKEN');
        const appTokenCell = await record.getCellByField(appTokenField);
        const appTokenValue = await appTokenCell.getValue();
        console.info('appTokenCell', appTokenValue)
        companyInfo.appToken = appTokenValue?.[0]?.text || '';

        // 机器人App_ID
        const appIdField = await table.getField('机器人App_ID');
        const appIdCell = await record.getCellByField(appIdField);
        const appIdValue = await appIdCell.getValue();
        console.info('appIdCell', appIdValue)
        companyInfo.appId = appIdValue?.[0]?.text || '';

        // 机器人App_Secret
        const appSecretField = await table.getField('机器人App_Secret');
        const appSecretCell = await record.getCellByField(appSecretField);
        const appSecretValue = await appSecretCell.getValue();
        console.info('appSecretCell', appSecretValue)
        companyInfo.appSecret = appSecretValue?.[0]?.text || '';
        
        break;
      }

      return companyInfo
    }

    const generateQuotePage = async () => {
      if (quotePlans.value.length === 0) {
        ElMessage.warning('请先生成报价方案');
        return;
      }

      isLoading.value = true;
      try {
        // 从表格中读取企业信息
        const companyInfo = await readCompanyInfoFromTable()

        // 新增报价方案记录
        const quotePlanTable = await bitable.base.getTableById(quotePlanTableId.value)
        const quotePlanRecordId = await quotePlanTable.addRecord([]);

        // 读取模板文件
        const response = await fetch('/quote-template.template');
        const template = await response.text();

        // 替换占位符
        const plansJson = JSON.stringify(quotePlans.value);
        const companyInfoJson = JSON.stringify(companyInfo);
        const htmlContent = template
          .replace('#{appToken}', JSON.stringify(companyInfo.appToken))
          .replace('#{countTableId}', JSON.stringify(quotePlanBrowseCountTableId.value))
          .replace('#{durationTableId}', JSON.stringify(quotePlanBrowseTableId.value))
          .replace('#{quotePlanRecordId}', JSON.stringify(quotePlanRecordId))
          .replace('#{appId}', JSON.stringify(companyInfo.appId))
          .replace('#{appSecret}', JSON.stringify(companyInfo.appSecret))
          .replace('#{plans}', plansJson)
          .replace('#{companyInfo}', companyInfoJson);


        // 创建Blob
        const blob = new Blob([htmlContent], { type: 'text/html' });

        // 由于需要记录的id，所以先新增记录，再设置值
        const quotePlanAttachmentField = await quotePlanTable.getField('报价方案');
        const quotePlanAttachmentFile = new File([blob], `quote-page_${Date.now()}.html`, { type: 'text/html' });
        await quotePlanAttachmentField.setValue(quotePlanRecordId, quotePlanAttachmentFile);

        // 下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quote-page.html';
        document.body.appendChild(a);
        a.click();

        // 直接在新窗口中打开
        window.open(url, '_blank');

        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ElMessage.success('报价页面生成成功！');
      } catch (error) {
        ElMessage.error('生成报价页面失败: ' + error.message);
        console.error('生成报价页面失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 等待Vue应用渲染完成的工具函数
    const waitForVueRender = (doc, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkRendered = () => {
          // 检查是否已超过超时时间
          if (Date.now() - startTime > timeout) {
            reject(new Error('等待Vue渲染超时'));
            return;
          }
          
          // 检查是否存在内容元素 - 根据模板中的结构
          const appElement = doc.getElementById('app');
          if (appElement && appElement.querySelector('h1') && 
              appElement.querySelector('table') && 
              appElement.textContent.trim().length > 100) {
            // 如果存在标题、表格且内容不为空，则认为已渲染完成
            resolve();
          } else {
            // 继续检查
            setTimeout(checkRendered, 100);
          }
        };
        
        // 开始检查
        setTimeout(checkRendered, 100);
      });
    };

    // 直接生成PDF
    const generateQuotePDF = async () => {
      if (quotePlans.value.length === 0) {
        ElMessage.warning('请先生成报价方案');
        return;
      }

      isLoading.value = true;
      try {
        // 从表格中读取企业信息
        const companyInfo = await readCompanyInfoFromTable()

        // 新增报价方案记录
        const quotePlanTable = await bitable.base.getTableById(quotePlanTableId.value)
        const quotePlanRecordId = await quotePlanTable.addRecord([]);

        // 读取模板文件
        const response = await fetch('/quote-template.template');
        const template = await response.text();

        // 替换占位符
        const plansJson = JSON.stringify(quotePlans.value);
        const companyInfoJson = JSON.stringify(companyInfo);
        const htmlContent = template
          .replace('#{appToken}', JSON.stringify(companyInfo.appToken))
          .replace('#{countTableId}', JSON.stringify(quotePlanBrowseCountTableId.value))
          .replace('#{durationTableId}', JSON.stringify(quotePlanBrowseTableId.value))
          .replace('#{quotePlanRecordId}', JSON.stringify(quotePlanRecordId))
          .replace('#{appId}', JSON.stringify(companyInfo.appId))
          .replace('#{appSecret}', JSON.stringify(companyInfo.appSecret))
          .replace('#{plans}', plansJson)
          .replace('#{companyInfo}', companyInfoJson);

        // 创建一个隐藏的iframe来加载HTML内容
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '100%'; // 设置为可见宽度以确保内容正确渲染
        iframe.style.height = '1000px'; // 设置足够的高度
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        iframe.onload = async () => {
          try {
            // 使用iframe中的html2pdf而不是在主窗口加载
            const iframeHtml2pdf = iframe.contentWindow.html2pdf;
            
            // 等待Vue应用渲染完成 - 使用更可靠的检测方式
            await waitForVueRender(iframe.contentDocument);

            // 获取按钮容器元素
            const actionButtons = iframe.contentDocument.getElementById('action-buttons');
            
            // 隐藏按钮
            if (actionButtons) {
                actionButtons.style.display = 'none';
            }

            // 优化PDF生成配置，确保内容适应A4纸张
            iframeHtml2pdf()
              .from(iframe.contentDocument.getElementById('app'))
              .set({
                margin:       5,
                filename:     '报价方案.pdf',
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all'] },
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, letterRendering: true, useCORS: true, logging: false },
                enableLinks:  true
              })
              .outputPdf('blob')
              .then((pdfBlob) => {
                // 验证PDF内容是否有效
                if (pdfBlob.size < 1024) { // 如果PDF文件太小，可能是空的
                  throw new Error('生成的PDF文件内容为空');
                }
                
                // 创建PDF文件并保存到表格
                const pdfFileName = `quote-pdf_${Date.now()}.pdf`;
                const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
                
                // 保存到表格
                quotePlanTable.getField('报价方案')
                  .then(field => {
                    return field.setValue(quotePlanRecordId, pdfFile);
                  })
                  .then(() => {
                    // 保存成功后下载PDF
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = pdfUrl;
                    a.download = pdfFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(pdfUrl);
                    
                    // 通知用户PDF生成成功
                    ElMessage.success('PDF生成成功！');
                  })
                  .catch(tableError => {
                    console.error('保存PDF到表格失败:', tableError);
                    ElMessage.warning('PDF生成成功，但保存到表格失败');
                    
                    // 即使保存失败，仍然下载PDF
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = pdfUrl;
                    a.download = pdfFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(pdfUrl);
                  })
                  .finally(() => {
                    // 清理
                    document.body.removeChild(iframe);
                    isLoading.value = false;
                  });
              })
              .catch(error => {
                console.error('PDF生成失败:', error);
                ElMessage.error('PDF生成失败: ' + error.message);
                document.body.removeChild(iframe);
                isLoading.value = false;
              });
          } catch (error) {
            console.error('PDF生成过程中发生错误:', error);
            ElMessage.error('PDF生成失败: ' + error.message);
            document.body.removeChild(iframe);
            isLoading.value = false;
          }
        };

        // 设置iframe的内容
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

      } catch (error) {
        ElMessage.error('生成PDF失败: ' + error.message);
        console.error('生成PDF失败', error);
        isLoading.value = false;
      }
    };

    return {
      productTableId,
      companyInfoTableId,
      quotePlanTableId,
      quotePlanBrowseCountTableId,
      quotePlanBrowseTableId,
      planName,
      showDiscount,
      showQuantity,
      tableMetaList,
      products,
      selectedProducts,
      quotePlans,
      globalDiscount,
      isLoading,
      showHelp,
      hasSelectedProducts,
      createDefaultTable,
      loadProducts,
      loadCompanyTable,
      loadQuotePlanTable,
      loadQuotePlanBrowseTable,
      loadQuotePlanBrowseCountTable,
      generateQuotePDF,
      generateQuotePlan,
      generateQuotePage,
      removeQuotePlan,
      remarks,
      currentPage,
      goToQuotePlanPage,
      goBackToMainPage,
      scrollToQuote,
      showQuotePlan,
      handleAfterLeave,
      productTableStatus,
      productTableStatusText,
      companyInfoTableStatus,
      companyInfoTableStatusText,
      quotePlanTableStatus,
      quotePlanTableStatusText,
      quotePlanBrowseCountTableStatus,
      quotePlanBrowseCountTableStatusText,
      quotePlanBrowseTableStatus,
      quotePlanBrowseTableStatusText,
      showCompanyInfo,
      goToCompanyInfoPage,
      saveCompanyInfo,
      isVip,
      openVip
    };

    // 判断表格是否存在
    async function existsTableByName(tableName) {
      try {
          const table = await bitable.base.getTableByName(tableName);
          return table !== null; // 如果获取到了表格，返回 true，否则返回 false
      } catch (error) {
          // 如果出现错误，表示没有找到表格
          return false;
      }
    }

    // 创建产品报价表
    async function createProductTable() {
      const addTableResult = await bitable.base.addTable({
        name: '产品报价表',
        // 字段有： 产品编号（自动编号），产品名称（单选），一级产品（单选），产品类型（单选），计算单位（单选），价格（价格），售卖状态（单选），产品功能介绍（文本），创建人（创建人），修改人（修改人）
        fields: [
          {
            name: '产品编号',
            type: FieldType.AutoNumber // 自动编号
          },
          {
            name: '产品名称',
            type: FieldType.SingleSelect, // 单选
            property: {
              options: [
                { name: '产品A', color: 1 },
                { name: '产品B', color: 2 },
                { name: '产品C', color: 3 }
              ]
            }
          },
          {
            name: '一级产品',
            type: FieldType.SingleSelect, // 单选
            property: {
              options: [
                { name: '硬件', color: 4 },
                { name: '软件', color: 5 },
                { name: '服务', color: 6 }
              ]
            }
          },
          {
            name: '产品类型',
            type: FieldType.SingleSelect, // 单选
            property: {
              options: [
                { name: '标准', color: 7 },
                { name: '定制', color: 8 },
                { name: '套餐', color: 9 }
              ]
            }
          },
          {
            name: '计算单位',
            type: FieldType.SingleSelect, // 单选
            property: {
              options: [
                { name: '个', color: 10 },
                { name: '套', color: 11 },
                { name: '台', color: 12 }
              ]
            }
          },
          {
            name: '价格',
            type: FieldType.Currency // 价格
          },
          {
            name: '售卖状态',
            type: FieldType.SingleSelect, // 单选
            property: {
              options: [
                { name: '在售', color: 13 },
                { name: '缺货', color: 14 },
                { name: '停产', color: 15 }
              ]
            }
          },
          {
            name: '产品功能介绍',
            type: FieldType.Text // 文本
          },
          {
            name: '创建人',
            type: FieldType.CreatedUser // 创建人
          },
          {
            name: '修改人',
            type: FieldType.ModifiedUser // 修改人
          }
        ]
      });

      // 添加示例数据
      const table = await bitable.base.getTableById(addTableResult.tableId);
      // 先获取表格字段信息，确保字段存在
      const fields = await table.getFieldList();

      // 创建字段名称到ID和选项的映射
      const fieldMap = new Map();
      for (const field of fields) {
        const name = await field.getName();
        const fieldData = {
          id: field.id,
          options: null
        };
        if (field.getOptions) {
          fieldData.options = await field.getOptions();
          console.info(name, fieldData.options);
        }
        fieldMap.set(name, fieldData);
      }

      // 添加完整的示例数据
      await table.addRecords([
        {
          fields: {
            [fieldMap.get('产品名称').id]: { id: fieldMap.get('产品名称').options[0].id },
            [fieldMap.get('一级产品').id]: { id: fieldMap.get('一级产品').options[0].id },
            [fieldMap.get('产品类型').id]: { id: fieldMap.get('产品类型').options[0].id },
            [fieldMap.get('计算单位').id]: { id: fieldMap.get('计算单位').options[0].id },
            [fieldMap.get('价格').id]: 100,
            [fieldMap.get('售卖状态').id]: { id: fieldMap.get('售卖状态').options[0].id },
            [fieldMap.get('产品功能介绍').id]: '这是产品A的详细介绍，具有多种功能和优势。'
          }
        },
        {
          fields: {
            [fieldMap.get('产品名称').id]: { id: fieldMap.get('产品名称').options[1].id },
            [fieldMap.get('一级产品').id]: { id: fieldMap.get('一级产品').options[1].id },
            [fieldMap.get('产品类型').id]: { id: fieldMap.get('产品类型').options[1].id },
            [fieldMap.get('计算单位').id]: { id: fieldMap.get('计算单位').options[1].id },
            [fieldMap.get('价格').id]: 200,
            [fieldMap.get('售卖状态').id]: { id: fieldMap.get('售卖状态').options[0].id },
            [fieldMap.get('产品功能介绍').id]: '这是产品B的详细介绍，适合企业级应用。'
          }
        },
        {
          fields: {
            [fieldMap.get('产品名称').id]: { id: fieldMap.get('产品名称').options[2].id },
            [fieldMap.get('一级产品').id]: { id: fieldMap.get('一级产品').options[2].id },
            [fieldMap.get('产品类型').id]: { id: fieldMap.get('产品类型').options[2].id },
            [fieldMap.get('计算单位').id]: { id: fieldMap.get('计算单位').options[2].id },
            [fieldMap.get('价格').id]: 300,
            [fieldMap.get('售卖状态').id]: { id: fieldMap.get('售卖状态').options[1].id },
            [fieldMap.get('产品功能介绍').id]: '这是产品C的详细介绍，高性能低价格。'
          }
        }
      ]);

      ElMessage.success('产品报价表创建成功！');
      
      productTableId.value = table.id;
      // 加载产品数据
      loadProducts();
    }

    // 创建企业信息表
    async function createCompanyInfoTable() {
      const addTableResult = await bitable.base.addTable({
        name: '企业信息表',
        // 字段有： 编号（自动编号），企业名称（文本），联系人（文本），微信（文本），电话（电话），企业Logo选用方式（单选），企业Logo附件（附件），企业Logo链接（超链接），
        // 二维码选用方式（单选），二维码附件（附件），二维码内容（文本），二维码Logo（附件），最终企业Logo（附件），最终二维码（附件），条款和条件（文本）
        // 多维表格APP_TOKEN(文本), 机器人App_ID（文本），机器人App_Secret（文本）
        fields: [
          {
            name: '编号',
            type: FieldType.AutoNumber // 自动编号
          },
          {
            name: '企业名称',
            type: FieldType.Text
          },
          {
            name: '联系人',
            type: FieldType.Text
          },
          {
            name: '微信',
            type: FieldType.Text
          },
          {
            name: '电话',
            type: FieldType.Phone
          },
          {
            name: '企业Logo选用方式',
            type: FieldType.SingleSelect,
            property: {
              options: [
                { name: '附件', color: 16 },
                { name: '链接', color: 17 }
              ]
            }
          },
          {
            name: '企业Logo附件',
            type: FieldType.Attachment
          },
          {
            name: '企业Logo链接',
            type: FieldType.Url
          },
          {
            name: '二维码选用方式',
            type: FieldType.SingleSelect,
            property: {
              options: [
                { name: '附件', color: 16 },
                { name: '内容', color: 17 }
              ]
            }
          },
          {
            name: '二维码附件',
            type: FieldType.Attachment
          },
          {
            name: '二维码内容',
            type: FieldType.Text
          },
          {
            name: '二维码Logo',
            type: FieldType.Attachment
          },
          {
            name: '最终企业Logo',
            type: FieldType.Attachment
          },
          {
            name: '最终二维码',
            type: FieldType.Attachment
          },
          {
            name: '条款和条件',
            type: FieldType.Text
          },
          {
            name: '多维表格APP_TOKEN',
            type: FieldType.Text
          },
          {
            name: '机器人App_ID',
            type: FieldType.Text
          },
          {
            name: '机器人App_Secret',
            type: FieldType.Text
          }
        ]
      });

      companyInfoTableId.value = addTableResult.tableId;
      // 加载产品数据
      loadCompanyTable();
    }

    // 创建报价方案表
    async function createQuotePlanTable() {
      const addTableResult = await bitable.base.addTable({
        name: '报价方案表',
        fields: [
          {
            name: '编号',
            type: FieldType.AutoNumber // 自动编号
          },
          {
            name: '报价方案',
            type: FieldType.Attachment // 附件
          },
          {
            name: '创建时间',
            type: FieldType.CreatedTime, // 创建时间: 2025/01/30 14:00
            property: {
              displayTimeZone: false,
              dateFormat: 'yyyy/MM/dd HH:mm'
            }
          }
        ]
      });

      ElMessage.success('报价方案表创建成功！');

      quotePlanTableId.value = addTableResult.tableId;
      // 加载报价方案数据
      loadQuotePlanTable();

      return addTableResult.tableId;
    }

    // 创建报价浏览次数表
    async function createQuotePlanBrowseCountTable(quotePlanTableId) {
      const addTableResult = await bitable.base.addTable({
        name: '报价浏览次数表',
        fields: [
          {
            name: '编号',
            type: FieldType.AutoNumber // 自动编号
          },
          {
            name: '报价方案',
            type: FieldType.SingleLink, // 单向引用
            property: {
              tableId: quotePlanTableId // 选项将在使用时动态添加
            }
          },
          {
            name: '日期',
            type: FieldType.DateTime, // 日期: 2025/01/30 14:00
            property: {
              displayTimeZone: false,
              dateFormat: 'yyyy/MM/dd HH:mm'
            }
          },
          {
            name: 'IP',
            type: FieldType.Text
          },
          {
            name: '浏览器类型与版本',
            type: FieldType.Text
          },
          {
            name: '操作系统',
            type: FieldType.Text
          },
          {
            name: '语言',
            type: FieldType.Text
          }
        ]
      });

      ElMessage.success('报价浏览次数表创建成功！');

      quotePlanBrowseCountTableId.value = addTableResult.tableId;
      // 加载报价方案浏览数据
      loadQuotePlanBrowseCountTable();
    }

    // 创建报价浏览时长表
    async function createQuotePlanBrowseTable(quotePlanTableId) {
      const addTableResult = await bitable.base.addTable({
        name: '报价浏览时长表',
        fields: [
          {
            name: '编号',
            type: FieldType.AutoNumber // 自动编号
          },
          {
            name: '报价方案',
            type: FieldType.SingleLink, // 单向引用
            property: {
              tableId: quotePlanTableId // 选项将在使用时动态添加
            }
          },
          {
            name: '浏览时长',
            type: FieldType.Number, // 数字，存储整数
            property: {
              formatter: "0"
            }
          },
          {
            name: '日期',
            type: FieldType.DateTime, // 日期: 2025/01/30 14:00
            property: {
              displayTimeZone: false,
              dateFormat: 'yyyy/MM/dd HH:mm'
            }
          },
          {
            name: 'IP',
            type: FieldType.Text
          },
          {
            name: '浏览器类型与版本',
            type: FieldType.Text
          },
          {
            name: '操作系统',
            type: FieldType.Text
          },
          {
            name: '语言',
            type: FieldType.Text
          }
        ]
      });

      ElMessage.success('报价浏览时长表创建成功！');

      quotePlanBrowseTableId.value = addTableResult.tableId;
      // 加载报价方案浏览数据
      loadQuotePlanBrowseTable();
    }
  }
};
</script>

<template>
  <div class="quote-maker">
    <!-- 主页面 -->
    <div>
      <el-card class="header-card" shadow="hover">
        <div class="header-actions">
          <div class="logo-container">
            <img class="logo" src="/quote-logo.png" alt="logo" />
            <!-- <div class="logo"></div> -->
            <h1>报价生成器<span v-if="isVip" style="margin-left: 8px;">👑</span></h1>
          </div>
          <div class="header-buttons">
            <el-tooltip
              placement="left"
              effect="light"
              content="操作指南: 1. 创建产品表格 2. 选择产品 3. 设置折扣 4. 生成报价方案"
              :visible-arrow="true"
            >
              <el-button size="small" class="help-btn"><el-icon><HelpFilled /></el-icon></el-button>
            </el-tooltip>
            <!-- <el-button 
              v-if="!isVip"
              type="warning"
              @click="openVip"
              size="small"
              class="vip-btn"
            >
              开通会员
            </el-button> -->
            <el-button 
              type="primary"
              @click="createDefaultTable"
              :loading="isLoading"
              class="create-table-btn"
            >
              一键创建
            </el-button>
          </div>
        </div>
      </el-card>

      <el-form ref="form" class="form" :model="companyInfoTableId" label-position="top">
        <el-form-item label="选择企业信息表" size="large">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-select 
                v-model="companyInfoTableId"
                placeholder="请选择企业信息表"
                style="flex: 1; min-width: 240px;"
                @change="loadCompanyTable"
              >
                <el-option
                  v-for="meta in tableMetaList"
                  :key="meta.id"
                  :label="meta.name"
                  :value="meta.id"
                />
              </el-select>
              <div v-if="companyInfoTableStatusText"
               :style="{
                 color: companyInfoTableStatus === 'success' ? 'green' : companyInfoTableStatus === 'error' ? 'red' : 'gray',
                 fontSize: '12px',
                 marginTop: '4px'
               }"
                >
                  {{ companyInfoTableStatusText }}
                </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择产品表" size="large">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-select 
                v-model="productTableId"
                placeholder="请选择产品表"
                style="flex: 1; min-width: 240px;"
                @change="loadProducts"
              >
                <el-option
                  v-for="meta in tableMetaList"
                  :key="meta.id"
                  :label="meta.name"
                  :value="meta.id"
                />
              </el-select>
              <el-button
                icon="Refresh"
                size="small"
                @click="productTableId && loadProducts()"
                :disabled="!productTableId || isLoading"
              />
            </div>
            <div v-if="productTableStatusText"
               :style="{
                 color: productTableStatus === 'success' ? 'green' : productTableStatus === 'error' ? 'red' : 'gray',
                 fontSize: '12px',
                 marginTop: '4px'
               }"
            >
              {{ productTableStatusText }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择报价方案表" size="large">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-select 
                v-model="quotePlanTableId"
                placeholder="请选择报价方案表"
                style="flex: 1; min-width: 240px;"
                @change="loadQuotePlanTable"
              >
                <el-option
                  v-for="meta in tableMetaList"
                  :key="meta.id"
                  :label="meta.name"
                  :value="meta.id"
                />
              </el-select>
              <div v-if="quotePlanTableStatusText"
               :style="{
                 color: quotePlanTableStatus === 'success' ? 'green' : quotePlanTableStatus === 'error' ? 'red' : 'gray',
                 fontSize: '12px',
                 marginTop: '4px'
               }"
                >
                  {{ quotePlanTableStatusText }}
                </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择报价浏览次数表" size="large">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-select 
                v-model="quotePlanBrowseCountTableId"
                placeholder="请选择报价浏览次数表"
                style="flex: 1; min-width: 240px;"
                @change="loadQuotePlanBrowseCountTable"
              >
                <el-option
                  v-for="meta in tableMetaList"
                  :key="meta.id"
                  :label="meta.name"
                  :value="meta.id"
                />
              </el-select>
              <div v-if="quotePlanBrowseCountTableStatusText"
               :style="{
                 color: quotePlanBrowseCountTableStatus === 'success' ? 'green' : quotePlanBrowseCountTableStatus === 'error' ? 'red' : 'gray',
                 fontSize: '12px',
                 marginTop: '4px'
               }"
                >
                  {{ quotePlanBrowseCountTableStatusText }}
                </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择报价浏览时长表" size="large">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-select 
                v-model="quotePlanBrowseTableId"
                placeholder="请选择报价浏览时长表"
                style="flex: 1; min-width: 240px;"
                @change="loadQuotePlanBrowseTable"
              >
                <el-option
                  v-for="meta in tableMetaList"
                  :key="meta.id"
                  :label="meta.name"
                  :value="meta.id"
                />
              </el-select>
              <div v-if="quotePlanBrowseTableStatusText"
               :style="{
                 color: quotePlanBrowseTableStatus === 'success' ? 'green' : quotePlanBrowseTableStatus === 'error' ? 'red' : 'gray',
                 fontSize: '12px',
                 marginTop: '4px'
               }"
                >
                  {{ quotePlanBrowseTableStatusText }}
                </div>
            </div>
          </div>
        </el-form-item>

        <div class="button-group">
          <el-button 
            type="primary"
            size="large"
            @click="goToQuotePlanPage"
            :loading="isLoading"
            class="add-plan-btn"
          >
            添加报价方案
          </el-button>
          <el-button 
            type="info"
            size="large"
            @click="goToCompanyInfoPage"
            :loading="isLoading"
            class="company-info-btn"
          >
            企业信息设置
          </el-button>
        </div>

        <div class="button-group">
          <el-button 
            type="success"
            size="large"
            @click="generateQuotePage"
            :loading="isLoading"
            :disabled="quotePlans.length === 0"
            class="generate-page-btn"
          >
            生成报价页面
          </el-button>
          <el-button 
            type="primary"
            size="large"
            @click="generateQuotePDF"
            :loading="isLoading"
            :disabled="quotePlans.length === 0"
            class="generate-pdf-btn"
          >
            直接生成PDF
          </el-button>
        </div>
      </el-form>

      <el-divider class="quotes-divider" />

      <div class="quote-plans">
        <h2>报价方案列表</h2>
        <div v-if="quotePlans.length === 0" class="no-quotes">
          暂无报价方案，请生成新的报价
        </div>
        <!-- 报价方案标签列表 -->
        <draggable v-if="quotePlans.length > 0" v-model="quotePlans" item-key="id" class="quote-tags">
          <template #item="{element}">
              <el-tag
                :key="element.id"
                closable
                @click="scrollToQuote(element.id.toString())"
                @close="removeQuotePlan(element.id)"
                class="quote-tag"
              >
                {{ element.planName }}
              </el-tag>
          </template>
        </draggable>
        <el-card
          v-for="plan in quotePlans"
          :key="plan.id"
          :id="`quote-plan-${plan.id}`"
          class="quote-card"
          shadow="hover"
        >
          <div class="quote-header">
            <h3>{{ plan.planName }}</h3>
            <el-button
              type="danger"
              size="small"
              @click="removeQuotePlan(plan.id)"
            >
              删除
            </el-button>
          </div>
          <el-divider />
          <div class="quote-items">
            <div v-for="item in plan.items" :key="item.id" class="quote-item">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</span>
              <span class="item-discount">(折扣: {{ item.discount }}%)</span>
              <span class="item-final-price">¥{{ (item.price * item.quantity * item.discount / 100).toFixed(2) }}</span>
            </div>
          </div>
          <el-divider />
          <div class="quote-summary">
            <div class="summary-row">
              <span>产品原价小计:</span>
              <span>¥{{ plan.originalSubtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row">              <span>产品折扣后小计:</span>              <span>¥{{ plan.productLevelSubtotal.toFixed(2) }}</span>            </div>            <div class="summary-row">              </div>
            <div class="summary-row">
              <span>优惠金额:</span>
              <span>¥{{ plan.totalDiscountAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>总计:</span>
              <span>¥{{ plan.total.toFixed(2) }}</span>
            </div>
            <div v-if="plan.remarks" class="summary-row remarks">
              <span style="min-width: 80px;">附加备注:</span>
              <span>{{ plan.remarks }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 报价方案设置页面 -->
    <transition name="quote-plan-transition" @after-leave="handleAfterLeave">
      <div v-if="showQuotePlan" class="quote-plan-container">
        <QuotePlanPage
            v-model:planName="planName"
            v-model:showDiscount="showDiscount"
            v-model:showQuantity="showQuantity"
            v-model:globalDiscount="globalDiscount"
            v-model:remarks="remarks"
            :products="products"
            :selected-products="selectedProducts"
            :hasSelectedProducts="hasSelectedProducts"
            :isLoading="isLoading"
            @generateQuotePlan="generateQuotePlan"
            @goBack="goBackToMainPage"
          />
        </div>
      </transition>

      <!-- 企业信息设置页面 -->
      <transition name="quote-plan-transition" @after-leave="handleAfterLeave">
        <div v-if="showCompanyInfo" class="quote-plan-container">
          <CompanyInfoPage
              :companyInfoTableId="companyInfoTableId"
              :companyInfo="companyInfo"
              :isLoading="isLoading"
              @saveCompanyInfo="saveCompanyInfo"
              @goBack="goBackToMainPage"
            />
          </div>
        </transition>
  </div>
</template>

<style scoped>
.quote-maker {
  max-width: 100%;
  width: 100%;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  background-color: white;
  box-sizing: border-box;
  overflow: auto;
  position: relative;
}

.quote-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.quote-tag {
  cursor: pointer;
  background-color: #f0f2f5;
  color: #606266;
}

.quote-tag:hover {
  background-color: #e4e7ed;
}

.quote-tag:focus {
  background-color: #409eff;
  color: white;
}

.quote-plan-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f0f2f5;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.5s ease;
  position: absolute;
  width: 100%;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-enter-to {
  transform: translateX(0);
}

.slide-leave-from {
  transform: translateX(0);
}

.slide-leave-to {
  transform: translateX(100%);
}

.remarks-input {
  width: 100%;
}

.summary-row.remarks {
  color: #606266;
  font-style: italic;
}

.header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #409eff, #69b1ff);
  color: white;
  border: none;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  width: 40px;
  height: 40px;
  background-color: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #409eff;
  font-size: 20px;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.display-settings {
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.help-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
}

.create-table-btn {
  background-color: white;
  color: #409eff;
  border: none;
}

.create-table-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.vip-btn {
  background-color: #ff9800;
  color: white;
  border: none;
}

.vip-btn:hover {
  background-color: #e68a00;
}

h1 {
  color: white;
  margin: 0;
}

.form {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.generate-btn,
.generate-page-btn {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.add-plan-btn,
.company-info-btn,
.generate-pdf-btn,
.generate-page-btn {
  flex: 1;
  padding: 12px 0;
  font-size: 16px;
}

.add-plan-btn {
  background-color: #409eff;
  color: white;
}

.generate-page-btn {
  background-color: #67c23a;
  color: white;
}

.generate-pdf-btn {
  background-color: #12c23a;
  color: white;
}

.quote-form-container {
  margin-bottom: 30px;
}

.quote-tabs {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.quotes-divider {
  margin: 30px 0;
}

.quote-plans {
  margin-top: 30px;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.quote-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
}

.quote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  color: #409eff;
}

.quote-items {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.quote-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.item-name {
  font-weight: 500;
  flex: 2;
}

.item-price {
  flex: 1;
  text-align: right;
  color: #67c23a;
}

.item-discount {
  flex: 1;
  text-align: right;
  color: #909399;
}

.item-final-price {
  flex: 1;
  text-align: right;
  font-weight: bold;
}

.quote-summary {
  margin-top: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total {
  font-weight: bold;
  color: #f56c6c;
  font-size: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #e4e7ed;
}

/* 滑动动画样式 */
.quote-plan-transition-enter-active, .quote-plan-transition-leave-active {
  transition: transform 0.3s ease;
}
.quote-plan-transition-enter-from {
  transform: translateX(100%);
}
.quote-plan-transition-leave-to {
  transform: translateX(100%);
}
.quote-plan-container {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: white;
}
</style>
