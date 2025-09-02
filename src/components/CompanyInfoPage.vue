<template>
  <div class="company-info-page" ref="companyInfoPage">
    <el-card class="page-header" shadow="hover">
      <div class="header-content">
        <el-button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回报价管理
        </el-button>
        <h1>企业信息设置</h1>
      </div>
    </el-card>

    <div class="company-form-container">
      <el-form label-position="top">
        <el-form-item label="企业名称" size="large">
          <el-input
            v-model="companyName"
            placeholder="请输入企业名称"
          />
        </el-form-item>

        <el-form-item label="联系人" size="large">
          <el-input
            v-model="contactPerson"
            placeholder="请输入联系人"
          />
        </el-form-item>

        <el-form-item label="微信" size="large">
          <el-input
            v-model="wechat"
            placeholder="请输入微信"
          />
        </el-form-item>

        <el-form-item label="电话" size="large">
          <el-input
            v-model="phone"
            placeholder="请输入电话"
          />
        </el-form-item>

        <el-form-item label="企业Logo" size="large">
          <div class="image-input-container">
            <el-radio-group v-model="logoInputType" class="input-type-switch">
              <el-radio label="upload">上传图片</el-radio>
              <el-radio label="url">输入链接</el-radio>
            </el-radio-group>

            <div v-if="logoInputType === 'upload'" class="image-upload-container">
              <el-upload
                class="upload-demo"
                action=""
                :on-change="handleLogoChange"
                :auto-upload="false"
                :show-file-list="false"
              >
                <el-button size="small" type="primary">选择图片</el-button>
              </el-upload>
            </div>

            <div v-if="logoInputType === 'url'" class="image-url-container">
              <el-input
                v-model="logoUrl"
                placeholder="请输入图片链接"
                @blur="loadLogoUrl"
                @keyup.enter="loadLogoUrl"
              />
              <div class="hint-text">按下Enter键或失去焦点时加载图片</div>
            </div>

            <div v-if="logoInputType === 'upload' && logoAttachment" class="preview-container">
              <img :src="logoAttachment" alt="Logo预览" class="preview-image">
              <div @click="deleteLogo" class="delete-icon-container">
                <el-icon class="delete-icon"><Delete /></el-icon>
              </div>
            </div>

            <div v-if="logoInputType === 'url' && logoUrl" class="preview-container">
              <img :src="logoUrl" alt="Logo预览" class="preview-image">
            </div>
          </div>
        </el-form-item>

        <el-form-item label="二维码" size="large">
          <div class="image-input-container">
            <el-radio-group v-model="qrcodeInputType" class="input-type-switch">
              <el-radio label="upload">上传二维码</el-radio>
              <el-radio label="content">输入内容生成</el-radio>
            </el-radio-group>

            <div v-if="qrcodeInputType === 'upload'" class="image-upload-container">
              <el-upload
                class="upload-demo"
                action=""
                :on-change="handleQrcodeChange"
                :auto-upload="false"
                :show-file-list="false"
              >
                <el-button size="small" type="primary">选择二维码</el-button>
              </el-upload>
            </div>

            <div v-if="qrcodeInputType === 'content'" class="image-url-container">
              <el-input
                v-model="qrcodeContent"
                placeholder="请输入二维码内容"
                @blur="generateQrcode"
                @keyup.enter="generateQrcode"
              />
              <div class="hint-text">按下Enter键或失去焦点时生成二维码</div>

              <div class="qrcode-logo-upload">
                <el-form-item label="二维码Logo" size="small">
                  <el-upload
                    class="upload-demo"
                    action=""
                    :on-change="handleQrcodeLogoChange"
                    :auto-upload="false"
                    :show-file-list="false"
                  >
                    <el-button size="small" type="primary">上传二维码Logo</el-button>
                  </el-upload>
                  <div v-if="qrcodeLogoAttachment" class="preview-container small-preview" style="margin-left: 8px;">
                    <img :src="qrcodeLogoAttachment" alt="二维码Logo预览" class="preview-image">
                    <div @click="deleteQrcodeLogo" class="delete-icon-container">
                      <el-icon class="delete-icon"><Delete /></el-icon>
                    </div>
                  </div>
                </el-form-item>
              </div>
            </div>

            <div v-if="qrcodeInputType === 'upload' && qrcodeAttachment" class="preview-container">
              <img :src="qrcodeAttachment" alt="二维码预览" class="preview-image">
              <div @click="deleteQrcode" class="delete-icon-container">
                <el-icon class="delete-icon"><Delete /></el-icon>
              </div>
            </div>

            <div v-if="qrcodeInputType === 'content' && qrcodeFinalAttachment" class="preview-container">
              <img :src="qrcodeFinalAttachment" alt="二维码预览" class="preview-image">
            </div>
            <!-- 隐藏的canvas用于绘制带logo的二维码 -->
            <canvas ref="qrcodeCanvas" style="display: none; width: 200px; height: 200px;"></canvas>
          </div>
        </el-form-item>

        <!-- 新增条款和条件部分 -->
        <el-form-item label="条款和条件" size="large">
          <el-input
            type="textarea"
            v-model="termsAndConditions"
            placeholder="请输入条款和条件，每条条款以换行分隔"
            :rows="5"
          />
          <div class="hint-text mt-2">输入多条条款时，请使用换行分隔，系统将自动转换为列表形式</div>
        </el-form-item>

        <el-form-item size="large">
          <div style="display: flex; align-items: center;">
            <span>多维表格APP_TOKEN</span>
            <el-tooltip content="多维表格 App 的唯一标识。 如果多维表格的 URL 以 feishu.cn/base 开头，则取base后面的值。示例值：'appbcbWCzen6D8dezhoCH2RpMAh'" placement="top">
              <el-icon class="question-icon" style="margin-left: 5px; color: #606266;">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
          <el-input
            v-model="appToken"
            placeholder="请输入多维表格APP_TOKEN"
          />
        </el-form-item>

        <el-form-item size="large">
          <div style="display: flex; align-items: center;">
            <span>机器人App_ID</span>
            <el-tooltip content="机器人应用的唯一标识，在https://open.feishu.cn/app中自建应用后获取。" placement="top">
              <el-icon class="question-icon" style="margin-left: 5px; color: #606266;">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
          <el-input
            v-model="robotAppId"
            placeholder="请输入机器人App_ID"
          />
        </el-form-item>

        <el-form-item size="large">
          <div style="display: flex; align-items: center;">
            <span>机器人App_Secret</span>
            <el-tooltip content="机器人应用的密钥，，在https://open.feishu.cn/app中自建应用后获取。" placement="top">
              <el-icon class="question-icon" style="margin-left: 5px; color: #606266;">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
          <el-input
            v-model="robotAppSecret"
            placeholder="请输入机器人App_Secret"
          />
        </el-form-item>

        <div class="button-group">
          <el-button 
            type="primary"
            size="large"
            @click="saveCompanyInfo"
            :loading="isLoading"
            class="save-btn"
          >
            保存企业信息
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, onUnmounted } from 'vue';
import { ElButton, ElCard, ElIcon, ElForm, ElFormItem, ElInput, ElUpload, ElMessage, ElRadio, ElRadioGroup, ElTooltip } from 'element-plus';
import { ArrowLeft, Delete, QuestionFilled } from '@element-plus/icons-vue';
import QRCode from 'qrcode';

import { bitable } from '@lark-base-open/js-sdk';

export default defineComponent({
  name: 'CompanyInfoPage',
  components: {
    ElButton,
    ElCard,
    ElIcon,
    ArrowLeft,
    ElForm,
    ElFormItem,
    ElInput,
    ElUpload,
    ElRadio,
    ElRadioGroup,
    ElTooltip
    },
  props: {
    companyInfoTableId: String,
    isLoading: Boolean
  },
  setup(props, { emit }) {

    // 加载企业信息
    async function loadCompanyInfo() {
      const table = await bitable.base.getTableById(props.companyInfoTableId);

      if (!table) {
        ElMessage.error('未能加载企业信息表');
        return;
      }

      const recordList = await table.getRecordList();
      if (recordList.length == 0) {
        return;
      }

      if (recordList.length > 1) {
        ElMessage.warning('企业信息表中存在多条数据，建议仅保留一条');
      }

      for (const record of recordList) {
        // 企业名称
        const companyNameField = await table.getField('企业名称');
        const companyNameCell = await record.getCellByField(companyNameField);
        const companyNameValue = await companyNameCell.getValue();
        console.info('companyNameCell', companyNameValue);
        companyName.value = companyNameValue?.[0]?.text || '';

        // 联系人
        const contactPersonField = await table.getField('联系人');
        const contactPersonCell = await record.getCellByField(contactPersonField);
        const contactPersonValue = await contactPersonCell.getValue();
        console.info('contactPersonCell', contactPersonValue);
        contactPerson.value = contactPersonValue?.[0]?.text || '';

        // 微信
        const wechatField = await table.getField('微信');
        const wechatCell = await record.getCellByField(wechatField);
        const wechatValue = await wechatCell.getValue();
        console.info('wechatCell', wechatValue);
        wechat.value = wechatValue?.[0]?.text || '';

        // 电话
        const phoneField = await table.getField('电话');
        const phoneCell = await record.getCellByField(phoneField);
        const phoneValue = await phoneCell.getValue();
        console.info('phoneCell', phoneValue);
        phone.value = phoneValue || '';

        // 企业Logo选用方式
        const logoTypeField = await table.getField('企业Logo选用方式');
        const logoTypeCell = await record.getCellByField(logoTypeField);
        const logoTypeValue = await logoTypeCell.getValue();
        console.info('logoTypeCell', logoTypeValue);
        logoInputType.value = logoTypeValue?.text == '附件' ? 'upload' : 'url';

        // 企业Logo附件
        const logoAttachmentField = await table.getField('企业Logo附件');
        console.info('企业Logo附件', logoAttachmentField);
        const logoAttachmentUrls = await safeGetAttachmentUrls(logoAttachmentField, record.id);
        console.info('logoAttachmentUrls', logoAttachmentUrls);
        if (logoAttachmentUrls?.length > 0) {
          const logoAttachmentUrl = logoAttachmentUrls[0];
          loadAttachmentUrl(logoAttachmentUrl, logoAttachment);
        }

        // 企业Logo链接
        const logoUrlField = await table.getField('企业Logo链接');
        const logoUrlCell = await record.getCellByField(logoUrlField);
        const logoUrlValue = await logoUrlCell.getValue();
        console.info('logoUrlCell', logoUrlValue);
        logoUrl.value = logoUrlValue?.[0]?.link || '';

        // 二维码选用方式
        const qrcodeTypeField = await table.getField('二维码选用方式');
        const qrcodeTypeCell = await record.getCellByField(qrcodeTypeField);
        const qrcodeTypeValue = await qrcodeTypeCell.getValue();
        console.info('qrcodeTypeCell', qrcodeTypeValue);
        qrcodeInputType.value = qrcodeTypeValue?.text == '附件' ? 'upload' : 'content';

        // 二维码附件
        const qrcodeAttachmentField = await table.getField('二维码附件');
        const qrcodeAttachmentUrls = await safeGetAttachmentUrls(qrcodeAttachmentField, record.id);
        // console.info('qrcodeAttachmentUrls', qrcodeAttachmentUrls)
        if (qrcodeAttachmentUrls?.length > 0) {
          const qrcodeAttachmentUrl = qrcodeAttachmentUrls[0];
          console.info('qrcodeAttachmentUrl', qrcodeAttachmentUrl);
          loadAttachmentUrl(qrcodeAttachmentUrl, qrcodeAttachment);
        }

        // 二维码内容
        const qrcodeContentField = await table.getField('二维码内容');
        const qrcodeContentCell = await record.getCellByField(qrcodeContentField);
        const qrcodeContentValue = await qrcodeContentCell.getValue();
        console.info('qrcodeContentCell', qrcodeContentValue);
        qrcodeContent.value = qrcodeContentValue?.[0]?.text || '';

        // 二维码Logo
        const qrcodeLogoField = await table.getField('二维码Logo');
        console.info('二维码Logo', qrcodeLogoField);
        const qrcodeLogoUrls = await safeGetAttachmentUrls(qrcodeLogoField, record.id);
        if (qrcodeLogoUrls?.length > 0) {
          const qrcodeLogoUrl = qrcodeLogoUrls[0];
          console.info('qrcodeLogoUrl', qrcodeLogoUrl);
          loadAttachmentUrl(qrcodeLogoUrl, qrcodeLogoAttachment);
        }

        // 最终二维码
        const qrcodeFinalAttachmentField = await table.getField('最终二维码');
        const qrcodeFinalAttachmentUrls = await safeGetAttachmentUrls(qrcodeFinalAttachmentField, record.id);
        if (qrcodeFinalAttachmentUrls?.length > 0) {
          const qrcodeFinalAttachmentUrl = qrcodeFinalAttachmentUrls[0];
          console.info('qrcodeFinalAttachmentUrl', qrcodeFinalAttachmentUrl);
          loadAttachmentUrl(qrcodeFinalAttachmentUrl, qrcodeFinalAttachment);
        }

        // 条款和条件
        const termsAndConditionsField = await table.getField('条款和条件');
        const termsAndConditionsCell = await record.getCellByField(termsAndConditionsField);
        const termsAndConditionsValue = await termsAndConditionsCell.getValue();
        console.info('termsAndConditionsCell', termsAndConditionsValue);
        termsAndConditions.value = termsAndConditionsValue?.map(it => it.text).join('') || '';

        // 多维表格APP_TOKEN
        const appTokenField = await table.getField('多维表格APP_TOKEN');
        const appTokenCell = await record.getCellByField(appTokenField);
        const appTokenValue = await appTokenCell.getValue();
        console.info('appTokenCell', appTokenValue);
        appToken.value = appTokenValue?.[0]?.text || '';

        // 机器人App_ID
        const robotAppIdField = await table.getField('机器人App_ID');
        const robotAppIdCell = await record.getCellByField(robotAppIdField);
        const robotAppIdValue = await robotAppIdCell.getValue();
        console.info('robotAppIdCell', robotAppIdValue);
        robotAppId.value = robotAppIdValue?.[0]?.text || '';

        // 机器人App_Secret
        const robotAppSecretField = await table.getField('机器人App_Secret');
        const robotAppSecretCell = await record.getCellByField(robotAppSecretField);
        const robotAppSecretValue = await robotAppSecretCell.getValue();
        console.info('robotAppSecretCell', robotAppSecretValue);
        robotAppSecret.value = robotAppSecretValue?.[0]?.text || '';
        break;
      }
    }

    // 加载附件url到element上
    const loadAttachmentUrl = (url, element) => {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          // 使用FileReader读取Blob
          const reader = new FileReader();
          reader.onload = (e) => {
            // e.target.result就是base64格式的data URL
            element.value = e.target.result;
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('获取图片失败:', error);
        });
    }

    // 安全的获取附件链接
    const safeGetAttachmentUrls = async (field, recordId) => {
      try {
        return await field?.getAttachmentUrls(recordId) || []
      } catch (error) {
        console.warn('获取附件链接失败:', error);
        return []
      }
    }

    // 获取app_token
    const getAppToken = async () => {
      const table = await bitable.base.getTableById(props.companyInfoTableId)
      const viewList = await table.getViewList()
      if (viewList.length > 0) {
        const view = viewList[0]
        const bitableUrl = await bitable.bridge.getBitableUrl({
          tableId: view.tableId,
          viewId: view.id,
        })
        console.info('bitableUrl', bitableUrl)
        // 使用正则表达式提取 app_token
        const regex = /base\/([^\/?]+)/;
        const match = bitableUrl.match(regex);

        if (match) {
            const appToken = match[1]; // 提取到的 app_token
            console.log(appToken); // 输出: EIsabPgLUa1OdbsxqClcMfrknRd
            return appToken
        } else {
            console.log("未找到 app_token");
        }
      }
      return ""
    }

    onMounted(async () => {
      await loadCompanyInfo();
      // 加载完成后发现仍然没有app_token，则尝试获取
      if (!appToken.value) {
        appToken.value = await getAppToken();
      }
    });

    const isLoading = ref(false)

    // 初始化企业信息
    const companyName = ref('');
    const contactPerson = ref('');
    const wechat = ref('');
    const phone = ref('');
    const logoAttachment = ref('');
    const logoUrl = ref('');
    const qrcodeAttachment = ref('');
    const qrcodeFinalAttachment = ref('');
    const qrcodeContent = ref('');
    const qrcodeLogoAttachment = ref('');
    const qrcodeCanvas = ref(null);
    const termsAndConditions = ref('');
    const appToken = ref('');
    const robotAppId = ref('');
    const robotAppSecret = ref('');

    // 添加文件暂存变量
    const logoFile = ref(null);
    const qrcodeFile = ref(null);
    const qrcodeLogoFile = ref(null);

    // 输入类型切换
    const logoInputType = ref('upload');
    const qrcodeInputType = ref('upload');

    // 加载Logo链接
    const loadLogoUrl = () => {
      if (logoUrl.value) {
        // 验证URL是否有效
        const img = new Image();
        img.onload = () => {
          ElMessage.success('Logo图片加载成功');
        };
        img.onerror = () => {
          ElMessage.error('Logo图片加载失败，请检查链接是否有效');
          logoUrl.value = '';
        };
        img.src = logoUrl.value;
      }
    };

    // 生成二维码
    const generateQrcode = async () => {
      if (qrcodeContent.value) {
        try {
          if (qrcodeLogoAttachment.value && qrcodeCanvas.value) {
            // 生成带logo的二维码
            qrcodeFinalAttachment.value = await generateQrcodeWithLogo(qrcodeContent.value, qrcodeLogoAttachment.value);
          } else {
            // 生成普通二维码
            qrcodeFinalAttachment.value = await QRCode.toDataURL(qrcodeContent.value, { errorCorrectionLevel: 'H', width: 200, margin: 0 });
          }
          ElMessage.success('二维码生成成功');
        } catch (error) {
          ElMessage.error('生成二维码失败: ' + error.message);
        }
      } else {
        qrcodeFinalAttachment.value = '';
        ElMessage.warning('请输入二维码内容');
      }
    };

    // 生成带logo的二维码
    const generateQrcodeWithLogo = async (content, logoUrl) => {
      return new Promise((resolve, reject) => {
        if (!qrcodeCanvas.value) {
          reject(new Error('Canvas元素未找到'));
          return;
        }

        const canvas = qrcodeCanvas.value;
        const ctx = canvas.getContext('2d');
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        // 清除画布
        ctx.clearRect(0, 0, size, size);

        // 生成二维码
        QRCode.toCanvas(canvas, content, { errorCorrectionLevel: 'H', width: size, margin: 0 }, (error) => {
          if (error) {
            reject(error);
            return;
          }

          // 加载logo图片
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            try {
              // 计算logo大小(二维码的1/4)和位置
              const logoSize = size / 4;
              const logoX = (size - logoSize) / 2;
              const logoY = (size - logoSize) / 2;
              const borderRadius = 10; // 圆角半径

              // 绘制圆角方形背景
              ctx.fillStyle = 'white';
              ctx.beginPath();
              ctx.moveTo(logoX + borderRadius, logoY);
              ctx.lineTo(logoX + logoSize - borderRadius, logoY);
              ctx.arcTo(logoX + logoSize, logoY, logoX + logoSize, logoY + borderRadius, borderRadius);
              ctx.lineTo(logoX + logoSize, logoY + logoSize - borderRadius);
              ctx.arcTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - borderRadius, logoY + logoSize, borderRadius);
              ctx.lineTo(logoX + borderRadius, logoY + logoSize);
              ctx.arcTo(logoX, logoY + logoSize, logoX, logoY + logoSize - borderRadius, borderRadius);
              ctx.lineTo(logoX, logoY + borderRadius);
              ctx.arcTo(logoX, logoY, logoX + borderRadius, logoY, borderRadius);
              ctx.closePath();
              ctx.fill();

              // 绘制logo
              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

              // 将canvas转换为data URL
              const dataUrl = canvas.toDataURL('image/png');
              resolve(dataUrl);
            } catch (err) {
              reject(err);
            }
          };
          logoImg.onerror = () => {
            ElMessage.warning('加载二维码Logo图片失败，将生成普通二维码');
            // 返回不带logo的二维码
            resolve(canvas.toDataURL('image/png'));
          };
          logoImg.src = logoUrl;
        });
      });
    };

    // 处理Logo上传 - 只暂存文件
    const handleLogoChange = (file) => {
      logoFile.value = file;
      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        logoAttachment.value = e.target.result;
      };
      reader.readAsDataURL(file.raw);
      ElMessage.success('图片已选择，将在保存时上传');
    };

    // 删除Logo图片
    const deleteLogo = () => {
      logoAttachment.value = '';
      logoFile.value = null;
      ElMessage.success('Logo图片已删除');
    };

    // 删除二维码图片
    const deleteQrcode = () => {
      qrcodeAttachment.value = '';
      qrcodeFile.value = null;
      ElMessage.success('二维码图片已删除');
    };

    // 删除二维码Logo图片
    const deleteQrcodeLogo = () => {
      qrcodeLogoAttachment.value = '';
      qrcodeLogoFile.value = null;
      // 如果已有二维码内容，重新生成不带logo的二维码
      if (qrcodeContent.value) {
        generateQrcode();
      }
      ElMessage.success('二维码Logo图片已删除');
    };

    // 处理二维码上传 - 只暂存文件
    const handleQrcodeChange = (file) => {
      qrcodeFile.value = file;
      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        qrcodeAttachment.value = e.target.result;
      };
      reader.readAsDataURL(file.raw);
      ElMessage.success('二维码已选择，将在保存时上传');
    };

    // 处理二维码Logo图片上传 - 只暂存文件
    const handleQrcodeLogoChange = (file) => {
      qrcodeLogoFile.value = file;
      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        qrcodeLogoAttachment.value = e.target.result;
        // 如果已有二维码内容，重新生成带logo的二维码
        if (qrcodeContent.value) {
          generateQrcode();
        }
      };
      reader.readAsDataURL(file.raw);
      ElMessage.success('二维码Logo图片已选择，将在保存时上传');
    };

    // 保存企业信息
    const saveCompanyInfo = async () => {
      const table = await bitable.base.getTableById(props.companyInfoTableId)

      if (!table) {
        ElMessage.error('未能加载企业信息表');
        return;
      }

      isLoading.value = true;

      try {
        // 清空旧数据
        const recordIdList = await table.getRecordIdList() || []
        if (recordIdList.length > 0) {
          ElMessage.success('发现旧数据，将其删除');
          await table.deleteRecords(recordIdList);
        }
        
        // 添加新记录
        ElMessage.success('保存数据到企业信息表');
        const companyNameField = await table.getField('企业名称');
        const companyNameCell = await companyNameField.createCell(companyName.value);
        const contactPersonField = await table.getField('联系人');
        const contactPersonCell = await contactPersonField.createCell(contactPerson.value);
        const wechatField = await table.getField('微信');
        const wechatCell = await wechatField.createCell(wechat.value);
        const phoneField = await table.getField('电话');
        const phoneCell = await phoneField.createCell(phone.value);

        // 企业Logo选用方式
        const logoInputTypeField = await table.getField('企业Logo选用方式')
        const logoInputTypeCell = await logoInputTypeField.createCell(logoInputType.value === "upload" ? "附件" : "链接");

        // 企业Logo附件
        let logoAttachmentCell = null
        let logoAttachmentFile = null
        if (logoAttachment.value) {
          const logoAttachmentResponse = await fetch(logoAttachment.value);
          const logoAttachmentBlob = await logoAttachmentResponse.blob();
          logoAttachmentFile = new File([logoAttachmentBlob], `company_logo_${Date.now()}.png`, { type: 'image/png' });
          const logoAttachmentField = await table.getField('企业Logo附件');
          logoAttachmentCell = await logoAttachmentField.createCell(logoAttachmentFile);
        }
       
        // 企业Logo链接
        const logoUrlField = await table.getField('企业Logo链接')
        const logoUrlCell = await logoUrlField.createCell(logoUrl.value);

        // 二维码选用方式
        const qrcodeInputTypeField = await table.getField('二维码选用方式')
        const qrcodeInputTypeCell = await qrcodeInputTypeField.createCell(qrcodeInputType.value === "upload" ? "附件" : "内容");

        // 二维码附件
        let qrcodeAttachmentCell = null;
        let qrcodeAttachmentFile = null;
        if (qrcodeAttachment.value) {
          const qrcodeAttachmentResponse = await fetch(qrcodeAttachment.value);
          const qrcodeAttachmentBlob = await qrcodeAttachmentResponse.blob();
          qrcodeAttachmentFile = new File([qrcodeAttachmentBlob], `qrcode_${Date.now()}.png`, { type: 'image/png' });
          const qrcodeAttachmentField = await table.getField('二维码附件');
          qrcodeAttachmentCell = await qrcodeAttachmentField.createCell(qrcodeAttachmentFile);
        }
        
        // 二维码内容
        const qrcodeContentField = await table.getField('二维码内容')
        const qrcodeContentCell = await qrcodeContentField.createCell(qrcodeContent.value);

        // 二维码Logo
        let qrcodeLogoAttachmentCell = null
        if (qrcodeLogoAttachment.value) {
          const qrcodeLogoAttachmentResponse = await fetch(qrcodeLogoAttachment.value);
          const qrcodeLogoAttachmentBlob = await qrcodeLogoAttachmentResponse.blob();
          const qrcodeLogoAttachmentFile = new File([qrcodeLogoAttachmentBlob], `qrcode_${Date.now()}.png`, { type: 'image/png' });
          const qrcodeLogoAttachmentField = await table.getField('二维码Logo');
          qrcodeLogoAttachmentCell = await qrcodeLogoAttachmentField.createCell(qrcodeLogoAttachmentFile);
        }
       
        // 最终企业Logo
        const finalLogoAttachmentField = await table.getField('最终企业Logo');
        let finalLogoAttachmentCell;
        if (logoInputType.value === "upload") {
          // 附件方式
          if (logoAttachmentFile) {
            finalLogoAttachmentCell = await finalLogoAttachmentField.createCell(logoAttachmentFile);
          }
        } else {
          // 链接方式
          if (logoUrl.value) {
            const finalLogoAttachmentResponse = await fetch(logoUrl.value);
            const finalLogoAttachmentBlob = await finalLogoAttachmentResponse.blob();
            const finalLogoAttachmentFile = new File([finalLogoAttachmentBlob], `final_company_logo_${Date.now()}.png`, { type: 'image/png' });
            finalLogoAttachmentCell = await finalLogoAttachmentField.createCell(finalLogoAttachmentFile);
          }
        }

        // 最终二维码
        const finalQrcodeAttachmentField = await table.getField('最终二维码');
        let finalQrcodeAttachmentCell;
        if (qrcodeInputType.value === "upload") {
          // 附件方式
          if (qrcodeAttachmentFile) {
            finalQrcodeAttachmentCell = await finalQrcodeAttachmentField.createCell(qrcodeAttachmentFile);
          }
        } else {
          // 内容方式
          if (qrcodeFinalAttachment.value) {
            const finalQrcodeAttachmentResponse = await fetch(qrcodeFinalAttachment.value);
            const finalQrcodeAttachmentBlob = await finalQrcodeAttachmentResponse.blob();
            const finalQrcodeAttachmentFile = new File([finalQrcodeAttachmentBlob], `final_qrcode_${Date.now()}.png`, { type: 'image/png' });
            finalQrcodeAttachmentCell = await finalQrcodeAttachmentField.createCell(finalQrcodeAttachmentFile);
          }
        }

        // 条款和条件
        const termsAndConditionsField = await table.getField('条款和条件')
        const termsAndConditionsCell = await termsAndConditionsField.createCell(termsAndConditions.value);

        // 多维表格APP_TOKEN
        const appTokenField = await table.getField('多维表格APP_TOKEN');
        const appTokenCell = await appTokenField.createCell(appToken.value);

        // 机器人App_ID
        const robotAppIdField = await table.getField('机器人App_ID');
        const robotAppIdCell = await robotAppIdField.createCell(robotAppId.value);

        // 机器人App_Secret
        const robotAppSecretField = await table.getField('机器人App_Secret');
        const robotAppSecretCell = await robotAppSecretField.createCell(robotAppSecret.value);

        // 保存记录
        await table.addRecord([
          companyNameCell, 
          contactPersonCell, 
          wechatCell, 
          phoneCell, 
          logoInputTypeCell, 
          logoAttachmentCell, 
          logoUrlCell, 
          qrcodeInputTypeCell,
          qrcodeAttachmentCell,
          qrcodeContentCell,
          qrcodeLogoAttachmentCell,
          finalLogoAttachmentCell,
          finalQrcodeAttachmentCell,
          termsAndConditionsCell,
          appTokenCell,
          robotAppIdCell,
          robotAppSecretCell,
        ].filter(cell => cell != null));

        // 本地存储数据
        const info = {
          companyName: companyName.value,
          contactPerson: contactPerson.value,
          wechat: wechat.value,
          phone: phone.value,
          logoUrl: logoUrl.value,
          qrcodeFinalAttachment: qrcodeFinalAttachment.value,
          qrcodeContent: qrcodeContent.value,
          qrcodeLogoAttachment: qrcodeLogoAttachment.value,
          logoInputType: logoInputType.value,
          qrcodeInputType: qrcodeInputType.value,
          termsAndConditions: termsAndConditions.value,
          appToken: appToken.value,
          robotAppId: robotAppId.value,
          robotAppSecret: robotAppSecret.value
        };

        emit('saveCompanyInfo', info);
        ElMessage.success('企业信息保存成功！');
        goBack();
      } catch (error) {
        console.error('添加记录失败:', error);
        ElMessage.error('保存企业信息失败: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // 返回主页面
    const goBack = () => {
      emit('goBack');
    };

    // 组件卸载时清理
    onUnmounted(() => {
    });

    return {
      isLoading,
      companyName,
      contactPerson,
      wechat,
      phone,
      logoAttachment,
      logoUrl,
      qrcodeAttachment,
      qrcodeFinalAttachment,
      qrcodeContent,
      qrcodeLogoAttachment,
      logoInputType,
      qrcodeInputType,
      qrcodeCanvas,
      termsAndConditions,
      appToken,
      robotAppId,
      robotAppSecret,
      loadLogoUrl,
      generateQrcode,
      handleLogoChange,
      handleQrcodeChange,
      handleQrcodeLogoChange,
      saveCompanyInfo,
      goBack,
      deleteLogo,
      deleteQrcode,
      deleteQrcodeLogo
    };

  },
  beforeUnmount() {
    this.$el.classList.remove('slide-in');
    this.$el.classList.add('slide-out');
  },
  emits: [
    'saveCompanyInfo',
    'goBack'
  ]
});
</script>

<style scoped>
.company-info-page {
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

.company-form-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}

.image-input-container {
  display: flex;
  flex-direction: column;
}

.input-type-switch {
  margin-bottom: 15px;
  display: flex;
  gap: 20px;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
}

.image-url-container {
  display: flex;
  flex-direction: column;
}

.hint-text {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.qrcode-logo-upload {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e4e7ed;
}

.preview-container {
  margin-top: 15px;
  max-width: 200px;
  position: relative;
}

.delete-icon-container {
  position: absolute;
  top: -10px;
  right: -22px;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;
}

.delete-icon-container:hover {
  background-color: rgba(255, 0, 0, 0.9);
}

.delete-icon {
  color: white;
  font-size: 14px;
}

.small-preview {
  max-width: 100px;
  position: relative;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 5px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

save-btn {
  width: 200px;
}
</style>