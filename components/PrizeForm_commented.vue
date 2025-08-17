<template>
  <!-- 编辑奖符的弹窗对话框 -->
  <!-- v-model="nowEditItem": 绑定当前编辑的奖符数据 -->
  <!-- v-model:visible="showEditPrizeModal": 控制弹窗显示/隐藏 -->
  <!-- :on-close: 弹窗关闭时的回调函数 -->
  <Dialog v-model="nowEditItem" v-model:visible="showEditPrizeModal" title="算法信息" :footer="false" :header="`编辑奖符 - ${nowEditItem?.name}`"
  :on-close="onEndPrizeEdit"
  >
    <!-- 弹窗内的表单，垂直布局 -->
    <Form class=" flex flex-col" :layout="'vertical'" :label-align="'top'">
      <!-- 奖符名称输入框 -->
      <FormItem label="奖符名称" name="name">
        <Input v-model="nowEditItem.name" size="large" placeholder="奖符名称" />
      </FormItem>
      <!-- 总数输入框 -->
      <FormItem label="总数" name="total">
        <InputNumber v-model="nowEditItem.total" size="large" placeholder="总数" suffix="张" min="1" />
      </FormItem>
      <!-- 变体数量输入框（一个奖符可以有多个不同的变体图片） -->
      <FormItem label="变体数量" name="ismoerCount">
        <InputNumber v-model="nowEditItem.ismoerCount" size="large" placeholder="变体数量" suffix="张" min="1" :max="nowEditItem.total" />
      </FormItem>
      <!-- 文件后缀选择器 -->
      <FormItem label="后缀" name="suffix">
        <Select v-model="nowEditItem.suffix" size="large" placeholder="后缀" required>
          <Option value=".jpg">.jpg</Option>
          <Option value=".png">.png</Option>
          <Option value=".gif">.pdf</Option>  <!-- 注意：这里应该是.gif，但代码中写的是.pdf -->
        </Select>
      </FormItem>
      <!-- 完成编辑按钮 -->
      <FormItem>
        <Button class="w-full" theme="primary" @click="onEndPrizeEdit" size="large">完成</Button>
      </FormItem>
    </Form>
  </Dialog>
    
  <!-- 主表单区域，只有在组件激活时才显示 -->
  <Form @submit="onSubmit" @reset="onReset" v-if="active">
    <div class="gap-8 flex flex-col " >
      <!-- 产品信息展示区域 -->
      <div class="flex flex-col gap-2">
        <!-- 描述列表组件，展示产品的基本信息，4列布局 -->
        <Descriptions bordered :column="4">
        <DescriptionsItem label="总数">{{ props.algorithm.total }}</DescriptionsItem>
        <DescriptionsItem label="特殊数量">{{ props.algorithm.specialCount }}</DescriptionsItem>
        <DescriptionsItem label="列数">{{ props.algorithm.column }}</DescriptionsItem>
        <DescriptionsItem label="流水号">{{ props.algorithm.serialPrefix }}</DescriptionsItem>
        </Descriptions> 
      </div>
      
      <!-- 操作区域 -->
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl nt-bold" >操作区</h2>
        <!-- 添加新奖符的表单 -->
        <!-- :data="newItem": 绑定新奖符的数据 -->
        <!-- :rules="addItemRule": 绑定验证规则 -->
        <Form :layout="'inline'" :data="newItem" :label-align="'top'" @submit="onAddItem" :rules="addItemRule">
          <!-- 奖符名称输入 -->
          <FormItem label="奖符名称" name="name">
          <Input v-model="newItem.name" size="large" placeholder="奖符名称" />
          </FormItem>
          <!-- 总数输入 -->
          <FormItem label="总数" name="total">
          <InputNumber v-model="newItem.total" size="large" placeholder="总数" suffix="张" min="1" />
          </FormItem> 
          <!-- 变体数量输入 -->
          <FormItem label="变体数量" name="ismoerCount">
          <InputNumber v-model="newItem.ismoerCount" size="large" placeholder="变体数量" suffix="张" min="1" :max="newItem.total" />
          </FormItem>
          <!-- 文件后缀选择 -->
          <FormItem label="后缀" name="suffix">
          <Select v-model="newItem.suffix" size="large" placeholder="后缀" required>
            <Option value=".jpg">.jpg</Option>
            <Option value=".png">.png</Option>
            <Option value=".gif">.pdf</Option>
          </Select>
          </FormItem>
          <!-- 添加按钮 -->
          <FormItem label=" ">
          <Button :size="'large'" theme="primary" type="submit">添加新奖符</Button>
          </FormItem>
        </Form>
      </div>
      
      <!-- 奖符列表表格 -->
      <!-- :columns: 表格列配置 -->
      <!-- :data: 表格数据源 -->
      <!-- row-key: 行的唯一标识字段 -->
      <!-- :row-class-name: 行样式类名函数 -->
      <Table :columns="prizeColumns" :data="props.algorithm.items" row-key="name" :row-class-name="getItemRowClassName">
          <!-- 操作列的自定义模板 -->
          <template #operations="{ row }">
          <div class="flex flex-row gap-2">
            <!-- 编辑链接 -->
            <Link theme="primary" hover="color" @click="onEditPrizeItem(row)">编辑</Link>
            <!-- 删除链接 -->
            <Link theme="danger" hover="color" @click="onDeletePrizeItem(row)">删除</Link>
          </div>
          </template>
      </Table>
      
      <!-- 底部按钮区域 -->
      <div class="flex flex-row gap-4 w-full">
        <!-- 上一步按钮（重置表单） -->
        <Button class="w-full" :size="'large'" theme="default" type="reset">上一步</Button>
        <!-- 下一步按钮（提交表单） -->
        <Button class="w-full" :size="'large'" theme="primary" type="submit">下一步</Button>
      </div>
    </div>
  </Form>

</template>

<script setup lang="ts">
// 导入TDesign组件和类型
import { Input, Dialog,FormItem, InputNumber, Option, Form, Button, type SubmitContext, Descriptions, DescriptionsItem, Table, type TableProps, Link, type TableRowData, Select, type FormProps, MessagePlugin} from 'tdesign-vue-next';
// 导入类型定义
import type { Algorithm, Item } from '~/types/algorithm';

// 定义组件Props
const props = defineProps<{
    active: boolean                                           // 组件是否激活
    algorithm: Algorithm                                      // 算法配置对象
    onSubmit: (result: SubmitContext) => void               // 提交回调
    onReset: (context: { e?: Event | undefined; }) => void  // 重置回调
}>()

// 控制编辑奖符弹窗的显示状态
const showEditPrizeModal = ref(false)

// 表格行样式函数
const getItemRowClassName: TableProps['rowClassName'] = (row: TableRowData) => {
  let className = ''
  // 如果是fallback项（兜底项），添加灰色背景
  if (row.row.isFallback) {
    className += ' !bg-gray-300'
  }
  // 如果总数小于0，添加无效样式
  if (row.row.total < 0) {
    className += ' invalid-prize-cell'
  }
  return className
}

// 新奖符表单数据，使用reactive创建响应式对象
const newItem = reactive<Item>(
{
  name: '',          // 奖符名称
  total: 1,          // 总数
  ismoerCount: 1,    // 变体数量
  suffix: '.jpg',    // 文件后缀
});

// 添加奖符的表单验证规则
const addItemRule: FormProps['rules'] = {
  name: [
    {
      // 自定义验证：检查名称是否重复
      message: '名称不能和已有名称重复',
      validator: (value: string) => {
        if (props.algorithm.items.find((item) => item.name === value)) {
          return false  // 找到重复名称，验证失败
        }
        return true     // 没有重复，验证通过
      },
    },
    {required: true, message: '名称不能为空'},  // 必填验证
  ]
};

// 添加奖符表单提交处理函数
const onAddItem: FormProps['onSubmit'] = ({ validateResult, firstError, e }) => {
  e?.preventDefault()  // 阻止默认提交行为
  if (validateResult === true) {
    // 验证通过，添加新奖符到算法配置中
    props.algorithm.items.push(Object.assign({}, newItem))  // 深拷贝新奖符数据
    maintainFallBackItemCount()   // 维护fallback项的数量
    sortItems()                   // 排序奖符列表
    maintainSpecialCount()        // 维护特殊数量统计
    MessagePlugin.success("添加成功")  // 显示成功消息
  }
  else {
    MessagePlugin.error("信息有误，请检查")    // 显示错误消息
  }
}

// 维护特殊数量统计（非fallback项的总数）
const maintainSpecialCount = () => {
  props.algorithm.specialCount = props.algorithm.items.filter(item => !item.isFallback).reduce((total, item) => total + item.total!, 0)
}

// 删除奖符处理函数
const onDeletePrizeItem = (item: TableRowData) => {
  if (item.isFallback) {
    MessagePlugin.error("不能删除 fallback 奖符")  // fallback项不能删除
    return
  }
  // 从奖符列表中移除选中项
  props.algorithm.items = props.algorithm.items.filter((_item) => _item != item)
  maintainFallBackItemCount()   // 重新计算fallback项数量
  sortItems()                   // 重新排序
  maintainSpecialCount()        // 重新计算特殊数量
}

// 维护fallback项的数量（自动调整以保证总数一致）
const maintainFallBackItemCount = () => {
  // 找到fallback项（兜底项，用于填充剩余数量）
  const fallBackItem = props.algorithm.items.find(item => item.isFallback)
  
  if (!fallBackItem) {
    throw Error();  // 必须存在fallback项
  };

  // 计算非fallback项的总数
  const nonFallBackTotal = props.algorithm.items.filter(item => !item.isFallback).reduce((total, item) => total + item.total!, 0)
  // 计算fallback项应有的数量（总数 - 非fallback总数）
  const fallBackTotal = props.algorithm.total! - nonFallBackTotal
  fallBackItem.total = fallBackTotal

  props.algorithm.specialCount = nonFallBackTotal
}

// 奖符列表排序函数
const sortItems = () => {
  props.algorithm.items.sort((a, b) => {
    // fallback项排在最后
    if (a.isFallback) {
      return 1
    }
    if (b.isFallback) {
      return -1
    }
    // 其他项按名称字母顺序排序
    return a.name.localeCompare(b.name)
  })
}

// 监听奖符列表变化，自动维护数据一致性
watch(props.algorithm.items, () => {
  maintainFallBackItemCount();  // 维护fallback项数量
  sortItems();                  // 重新排序
}, {immediate: true, deep: true});  // immediate: 立即执行, deep: 深度监听

// 表格列配置
const prizeColumns = ref<TableProps['columns']>([
  {
    colKey: 'name',
    title: '奖符名称'
  },
  {
    colKey: 'total',
    title: '总数'
  },
  {
    colKey: 'ismoerCount',
    title: '变体数量',
  },
  {
    colKey: 'suffix',
    title: '后缀'
  },
  {
    colKey: 'operations',
    title: '操作'
  } 
]);

// 当前编辑的奖符数据
const nowEditItem = ref<Item>({
  name: '',
  total: 1,
  ismoerCount: 1,
  suffix: '.jpg',
}) 

// 点击编辑奖符时的处理函数
const onEditPrizeItem = (item: Item) => {
  showEditPrizeModal.value = true  // 显示编辑弹窗
  nowEditItem.value = item         // 设置当前编辑的奖符
}

// 结束编辑奖符时的处理函数
const onEndPrizeEdit = () => {
  showEditPrizeModal.value = false  // 隐藏编辑弹窗
}

</script>

<style>
/* 无效奖符单元格的样式：第2列（总数列）背景色为淡红色 */
.invalid-prize-cell > td:nth-child(2) {
  background-color: rgb(255, 200, 200);
}
</style>