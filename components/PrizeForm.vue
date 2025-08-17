<template>
  <Dialog v-model="nowEditItem" v-model:visible="showEditPrizeModal" title="算法信息" :footer="false" :header="`编辑奖符 - ${nowEditItem?.name}`"
  :on-close="onEndPrizeEdit"
  >
    <Form class=" flex flex-col" :layout="'vertical'" :label-align="'top'">
      <FormItem label="奖符名称" name="name">
        <Input v-model="nowEditItem.name" size="large" placeholder="奖符名称" />
      </FormItem>
      <FormItem label="总数" name="total">
        <InputNumber v-model="nowEditItem.total" size="large" placeholder="总数" suffix="张" min="1" />
      </FormItem>
      <FormItem label="变体数量" name="ismoerCount">
        <InputNumber v-model="nowEditItem.ismoerCount" size="large" placeholder="变体数量" suffix="张" min="1" :max="nowEditItem.total" />
      </FormItem>
      <FormItem label="后缀" name="suffix">
        <Select v-model="nowEditItem.suffix" size="large" placeholder="后缀" required>
          <Option value=".jpg">.jpg</Option>
          <Option value=".png">.png</Option>
          <Option value=".gif">.pdf</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button class="w-full" theme="primary" @click="onEndPrizeEdit" size="large">完成</Button>
      </FormItem>
    </Form>
  </Dialog>
    
  <Form @submit="onSubmit" @reset="onReset" v-if="active">
    <div class="gap-8 flex flex-col " >
      <div class="flex flex-col gap-2">
        <Descriptions bordered :column="4">
        <DescriptionsItem label="总数">{{ props.algorithm.total }}</DescriptionsItem>
        <DescriptionsItem label="特殊数量">{{ props.algorithm.specialCount }}</DescriptionsItem>
        <DescriptionsItem label="列数">{{ props.algorithm.column }}</DescriptionsItem>
        <DescriptionsItem label="流水号">{{ props.algorithm.serialPrefix }}</DescriptionsItem>
        </Descriptions> 
      </div>
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl nt-bold" >操作区</h2>
        <Form :layout="'inline'" :data="newItem" :label-align="'top'" @submit="onAddItem" :rules="addItemRule">
          <FormItem label="奖符名称" name="name">
          <Input v-model="newItem.name" size="large" placeholder="奖符名称" />
          </FormItem>
          <FormItem label="总数" name="total">
          <InputNumber v-model="newItem.total" size="large" placeholder="总数" suffix="张" min="1" />
          </FormItem> 
          <FormItem label="变体数量" name="ismoerCount">
          <InputNumber v-model="newItem.ismoerCount" size="large" placeholder="变体数量" suffix="张" min="1" :max="newItem.total" />
          </FormItem>
          <FormItem label="后缀" name="suffix">
          <Select v-model="newItem.suffix" size="large" placeholder="后缀" required>
            <Option value=".jpg">.jpg</Option>
            <Option value=".png">.png</Option>
            <Option value=".gif">.pdf</Option>
          </Select>
          </FormItem>
          <FormItem label=" ">
          <Button :size="'large'" theme="primary" type="submit">添加新奖符</Button>
          </FormItem>
        </Form>
      </div>
      <Table :columns="prizeColumns" :data="props.algorithm.items" row-key="name" :row-class-name="getItemRowClassName">
          <template #operations="{ row }">
          <div class="flex flex-row gap-2">
            <Link theme="primary" hover="color" @click="onEditPrizeItem(row)">编辑</Link>
            <Link theme="danger" hover="color" @click="onDeletePrizeItem(row)">删除</Link>
          </div>
          </template>
      </Table>
      <div class="flex flex-row gap-4 w-full">
        <Button class="w-full" :size="'large'" theme="default" type="reset">上一步</Button>
        <Button class="w-full" :size="'large'" theme="primary" type="submit">下一步</Button>
      </div>
    </div>
  </Form>


</template>

<script setup lang="ts">
import { Input, Dialog,FormItem, InputNumber, Option, Form, Button, type SubmitContext, Descriptions, DescriptionsItem, Table, type TableProps, Link, type TableRowData, Select, type FormProps, MessagePlugin} from 'tdesign-vue-next';
import type { Algorithm, Item } from '~/types/algorithm';

const props = defineProps<{
    active: boolean
    algorithm: Algorithm
    onSubmit: (result: SubmitContext) => void
    onReset: (context: { e?: Event | undefined; }) => void
}>()


const showEditPrizeModal = ref(false)

const getItemRowClassName: TableProps['rowClassName'] = (row: TableRowData) => {
  let className = ''
  if (row.row.isFallback) {
    className += ' !bg-gray-300'
  }
  if (row.row.total < 0) {
    className += ' invalid-prize-cell'
  }
  return className
}

// 添加奖符 - 表单数据
const newItem = reactive<Item>(
{
  name: '',
  total: 1,
  ismoerCount: 1,
  suffix: '.jpg',
});

// 添加奖符 - 表单验证
const addItemRule: FormProps['rules'] = {
  name: [
    {
      message: '名称不能和已有名称重复',
      validator: (value: string) => {
        if (props.algorithm.items.find((item) => item.name === value)) {
          return false
        }
        return true
      },
    },
    {required: true, message: '名称不能为空'},
  ]
};

// 添加奖符 - 表单提交
const onAddItem: FormProps['onSubmit'] = ({ validateResult, firstError, e }) => {
  e?.preventDefault()
  if (validateResult === true) {
    props.algorithm.items.push(Object.assign({}, newItem)) 
    maintainFallBackItemCount()
    sortItems()
    maintainSpecialCount()
    MessagePlugin.success("添加成功")
  }
  else {
    MessagePlugin.error("信息有误，请检查")
  }

}


const maintainSpecialCount = () => {
  props.algorithm.specialCount = props.algorithm.items.filter(item => !item.isFallback).reduce((total, item) => total + item.total!, 0)
}

// 删除奖符
const onDeletePrizeItem = (item: TableRowData) => {
  if (item.isFallback) {
    MessagePlugin.error("不能删除 fallback 奖符")
    return
  }
  props.algorithm.items = props.algorithm.items.filter((_item) => _item != item)
  maintainFallBackItemCount()
  sortItems()
  maintainSpecialCount()
}


// 检查特殊总数是否一致
const maintainFallBackItemCount = () => {
  const fallBackItem = props.algorithm.items.find(item => item.isFallback)
  
  if (!fallBackItem) {
    throw Error();
  };

  const nonFallBackTotal = props.algorithm.items.filter(item => !item.isFallback).reduce((total, item) => total + item.total!, 0)
  const fallBackTotal = props.algorithm.total! - nonFallBackTotal
  fallBackItem.total = fallBackTotal

  props.algorithm.specialCount = nonFallBackTotal
}

// 排序
const sortItems = () => {
  props.algorithm.items.sort((a, b) => {
    if (a.isFallback) {
      return 1
    }
    if (b.isFallback) {
      return -1
    }
    return a.name.localeCompare(b.name)
  })
}

// 监控 items 变化，并立即执行
watch(props.algorithm.items, () => {
  maintainFallBackItemCount();
  sortItems();
}, {immediate: true, deep: true});


// 表格列元信息
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


// 编辑表格双向绑定对象
const nowEditItem = ref<Item>({
  name: '',
  total: 1,
  ismoerCount: 1,
  suffix: '.jpg',
}) 


// 点击编辑时 - 打开窗口
const onEditPrizeItem = (item: Item) => {
  showEditPrizeModal.value = true
  nowEditItem.value = item
}

// 结束编辑时 - 关闭窗口
const onEndPrizeEdit = () => {
  showEditPrizeModal.value = false
}


</script>

<style>
.invalid-prize-cell > td:nth-child(2) {
  background-color: rgb(255, 200, 200);
}
</style>