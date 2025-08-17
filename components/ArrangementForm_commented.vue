<template>

  <!-- 编辑分配的弹窗对话框 -->
  <!-- top="5rem": 弹窗距离顶部5rem -->
  <!-- model="nowEditArrangement": 绑定当前编辑的分配数据 -->
  <Dialog top="5rem" model="nowEditArrangement" v-model:visible="showEditArrangementModal" title="分配" :footer="false" :header="`添加分配 - ${nowEditArrangement?.name}`">
    <div class="flex-1">
      <!-- 分配编辑表单 -->
      <Form class=" flex flex-col" :layout="'vertical'" :label-align="'top'" @submit="onSubmitEditArrangement">
          <!-- 奖符名称输入框 -->
          <FormItem label="奖符名称" name="name">
            <Input v-model="nowEditArrangement.name" size="large" placeholder="奖符名称"></Input>
          </FormItem>
          <!-- 分配模式选择 -->
          <FormItem label="模式" name="mode">
            <Select v-model="nowEditArrangement.mode" size="large" required>
              <Option label="随机" value="random"></Option>      <!-- 随机分布 -->
              <Option label="平均" value="average"></Option>     <!-- 平均分布 -->
            </Select>
          </FormItem>
          <!-- 分配数量输入 -->
          <FormItem label="数量" name="total">
            <!-- :disabled: 如果是fallback组则禁用编辑 -->
            <!-- :max: 最大值为起始结束位置范围和总数的较小值 -->
            <InputNumber :disabled="nowEditArrangement.group == 'fallback'" v-model="nowEditArrangement.total" size="large" placeholder="1" required min="0" :max="Math.min(nowEditArrangement.end - nowEditArrangement.start + 1, props.algorithm.total)"></InputNumber>
          </FormItem>
          <!-- 起始位置输入 -->
          <FormItem class="flex-1" label="起始位置" name="start">
            <InputNumber v-model="nowEditArrangement.start" size="large" placeholder="1" required min="1" :max="nowEditArrangement.end"></InputNumber>
          </FormItem>
          <!-- 结束位置输入 -->
          <FormItem class="flex-1" label="结束位置" name="end">
            <InputNumber v-model="nowEditArrangement.end" size="large" placeholder="1" required :min="nowEditArrangement.start" :max="props.algorithm.total"></InputNumber>
          </FormItem>
          <!-- 组别输入 -->
          <FormItem label="组别">
            <!-- fallback组不允许编辑组别 -->
            <Input :disabled="nowEditArrangement.group == 'fallback'" v-model="nowEditArrangement.group" size="large" placeholder="组别"></Input>
          </FormItem>
          <!-- 分布曲线类型选择 -->
          <FormItem label="偏移方法" name="curved" required>
            <Select v-model="nowEditArrangement.curved" size="large">
              <Option label="正态分布(中间概率高，两边概率低)" value="normal"></Option>
              <Option label="正态右偏(左边概率高，右边概率低)" value="beta-right-skewed"></Option>
              <Option label="线性右偏(左边概率高，右边概率低)" value="linear-right-skewed"></Option>
              <Option label="正态左偏(右边概率高，左边概率低)" value="beta-left-skewed"></Option>
              <Option label="线性左偏(右边概率高，左边概率低)" value="linear-left-skewed"></Option>
              <Option label="均匀分布(概率均匀)" value="random"></Option>
            </Select>
          </FormItem>
          <!-- 完成按钮 -->
          <div class="w-full flex flex-row gap-4">
            <Button class="w-full" size="large" theme="primary" type="submit">完成</Button>
          </div>
      </Form>
    </div>
  </Dialog> 

  <!-- 主分配配置表单 -->
  <Form @submit="onGenerateBox" @reset="onReset" v-if="active">
    <div class="flex flex-col gap-8">
      <div>
        <!-- 标题和预览链接 -->
        <div class="flex flex-row gap-4">
          <h2 class="text-2xl nt-bold">分配区</h2>
          <Link theme="primary" @click="onToggleSnapshot">预览</Link>
        </div>
        
        <!-- 预览区域：显示分配的可视化布局 -->
        <div v-if="showSnapshotModal && props.active">
          <!-- 列头显示 -->
          <div class="w-full flex flex-row" v-if="props.active">
            <div v-for="item in algorithm.column" class="w-full text-gray-500">
              <div class="h-20 rounded-sm border-white border-2 bg-slate-200 flex items-center justify-center">
                <span>第{{ item }}列</span>
              </div>
            </div>
          </div>
          
          <!-- 分配项的可视化显示 -->
          <div v-for="arrangment in algorithm.arrangements" @click="onEditArrangementItem(arrangment)">
            <!-- 填充模式或有数量的随机模式：显示为单个块 -->
            <div v-if="arrangment.mode == 'filled' || arrangment.mode == 'random' && arrangment.total != 0" class="h-20 rounded-sm border-white border-2 bg-slate-200 flex items-center justify-center" :style="{ position: 'relative', left: `${(arrangment.start / algorithm.total) * 100}%`, width: `${(arrangment.end - arrangment.start) / algorithm.total * 100}%`}">
              {{ arrangment.total }} 个 {{ modeMap[arrangment.mode] }} 的 {{ arrangment.name }}
            </div>
            <!-- 平均模式：显示为多个小块 -->
            <div v-else class="flex flex-row w-full flex-nowrap" :style="{ position: 'relative', left: `${(arrangment.start / algorithm.total) * 100}%`, width: `${(arrangment.end - arrangment.start) / algorithm.total * 100}%`}">
              <div v-for="item in arrangment.total" class="min-w-0 w-full h-20 rounded-sm border-white border-2 bg-slate-200 items-center justify-center">
                <div class="w-full h-full flex items-center justify-center break-all text-xs">1 个 {{ arrangment.name }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分配列表表格 -->
        <Table :columns="arrangementColumns" :data="props.algorithm.arrangements" row-key="data.index" :row-class-name="getArrangementRowClassName" class="bg-red-200">
          <!-- 操作列自定义模板 -->
          <template #operations="{ row }">
          <!-- 非填充模式的操作按钮 -->
          <div v-if="row.mode != 'filled' " class="flex flex-row gap-2">
            <Link theme="primary" hover="color" @click="onEditArrangementItem(row)">编辑</Link>
            <!-- fallback组显示分配按钮，其他组显示删除按钮 -->
            <Link v-if="row.group == 'fallback'" theme="primary" hover="color" @click="onDistributeFallback(row)">分配</Link>
            <Link v-else theme="danger" hover="color" @click="onDeleteArrangementItem(row)">删除</Link>
          </div>
          <!-- 填充模式不可编辑 -->
          <div v-else class="flex flex-row gap-2">
            <Link disabled>不可编辑</Link>
          </div>
          </template>
          
          <!-- 模式列自定义显示 -->
          <template #mode="{ row }">
            {{ modeMap[row.mode] }}
          </template>
          
          <!-- 偏度列自定义显示（带提示信息） -->
          <template #curved="{ row }">
            <Popup :content="curvedMap[row.curved][1]" placement="top">
              {{ curvedMap[row.curved][0] }}
            </Popup>
          </template>
          
          <!-- 组别列自定义显示 -->
          <template #group="{ row }">
            {{ row.group == 'fallback' ? '剩余' : row.group }}
          </template>
        </Table>
      </div>
      
      <!-- 底部按钮区域 -->
      <div class="flex flex-row gap-4 w-full">
        <Button class="w-full" :size="'large'" theme="default" type="reset">上一步</Button>
        <!-- 生成按钮，显示当前盒数 -->
        <Button class="w-full" :size="'large'" theme="primary" type="submit">生成 {{ boxCount }} 盒</Button>
      </div>
    </div>
  </Form>

</template>

<script setup lang="ts">
// 导入所需组件和工具函数
import { Popup, Input, Dialog,FormItem, InputNumber, Option, Form, Button, type SubmitContext, Table, type TableProps, Link, type TableRowData, Select, MessagePlugin} from 'tdesign-vue-next';
import type { Algorithm, Arrangement } from '~/types/algorithm';
import { reverseMatrixAndconvertToCsvAndDownload } from '~/utils/CsvUtil';

// 组件Props定义
const props = defineProps<{
    active: boolean                                     // 组件是否激活
    algorithm: Algorithm                               // 算法配置对象
    onReset: (context: { e?: Event | undefined; }) => void  // 重置回调
}>()

// 控制预览显示状态
const showSnapshotModal = ref(false)

// 模式映射：将英文模式转换为中文显示
const modeMap: Record<string, string> = {
  'random': '随机',
  'average': '平均',
  'filled': '填充',
}

// 分布曲线映射：[显示名称, 详细说明]
const curvedMap: Record<string, string[]> = {
  'normal': ['正态分布', '中间概率高，两边概率低'],
  'beta-right-skewed': ['正态右偏', '左边概率高，右边概率低'],
  'linear-right-skewed': ['线性右偏', '左边概率高，右边概率低'],
  'beta-left-skewed': ['正态左偏', '右边概率高，左边概率低'],
  'linear-left-skewed': ['线性左偏', '右边概率高，左边概率低'],
  'random': ['均匀分布', '概率均匀'],
}

// 控制编辑分配弹窗显示状态
const showEditArrangementModal = ref(false)
// 标记是否是分配fallback操作
let isDistributeFallback: boolean = false

// 分配表格列配置
const arrangementColumns = ref<TableProps['columns']>([
  {
    colKey: 'name',
    title: '奖符名称'
  },
  {
    colKey: 'mode',
    title: '模式'
  },
  {
    colKey: 'start',
    title: '起始位置'
  },
  {
    colKey: 'end',
    title: '结束位置'
  },
  {
    colKey: 'total',
    title: '数量'
  },
  {
    colKey: 'curved',
    title: '偏度'
  },
  {
    colKey: 'group',
    title: '组'
  },
  {
    colKey: 'operations',
    title: '操作'
  }
])

// 维护fallback分配数量的一致性
const maintainFallbackArrangementCount = () => {
  // 创建期望的fallback数量变化映射
  const expectedFallBackCountChangeMap: Map<string, number> = new Map()

  // 为每个奖符创建fallback分配（如果不存在）
  props.algorithm.items.forEach((item) => {
    if (!props.algorithm.arrangements.find((arrangement) => arrangement.name == item.name && arrangement.group == 'fallback')) {
      // 创建新的fallback分配
      props.algorithm.arrangements.push({
        name: item.name,
        mode: item.isFallback ? 'filled' : 'random',  // fallback项用填充模式，其他用随机模式
        total: item.total,
        start: 1,
        end: props.algorithm.total,
        curved: 'random',
        group: 'fallback',
      })
    }
    // 设置期望的数量
    expectedFallBackCountChangeMap.set(item.name, item.total)
    return;
  })

  // 处理不存在的奖符分配和计算数量差异
  props.algorithm.arrangements.forEach((arrangement) => {
    // 如果奖符已被删除，删除对应的分配
    if (!props.algorithm.items.find((item) => item.name == arrangement.name)) {
      onDeleteArrangementItem(arrangement)
      return;
    }

    // 计算fallback分配的数量差异
    if (arrangement.group == 'fallback') {
      expectedFallBackCountChangeMap.set(arrangement.name, expectedFallBackCountChangeMap.get(arrangement.name)! - arrangement.total)
    }

    // 计算非fallback分配的数量差异
    if (arrangement.group != 'fallback') {
      expectedFallBackCountChangeMap.set(arrangement.name, expectedFallBackCountChangeMap.get(arrangement.name)! - arrangement.total)
    }
  })

  // 应用数量调整
  expectedFallBackCountChangeMap.forEach((value, key) => {
      if (value != 0) {
        // 找到对应的fallback分配并调整数量
        const fallbackArragement = props.algorithm.arrangements.find((arrangement) => arrangement.name == key && arrangement.group == 'fallback')
        fallbackArragement!.total = fallbackArragement!.total + value
      }
  })
} 

// 分配列表排序函数
const sortArrangement = () => {
  props.algorithm.arrangements.sort((a, b) => {
    // 填充模式排在最后
    if (a.mode == 'filled') return 1;
    if (b.mode == 'filled') return -1;
    // fallback组排在最后
    if (a.group == 'fallback' && b.group != 'fallback') return 1;
    if (b.group == 'fallback' && a.group != 'fallback') return -1;
    // 有组别的优先显示（非fallback）
    if (a.group && !b.group && a.group != 'fallback') return -1;
    if (b.group && !a.group && b.group != 'fallback') return 1;
    // 组别内按组名排序
    if (a.group && b.group && a.group != 'fallback' && b.group != 'fallback') return a.group.localeCompare(b.group);
    // 最后按奖符名称排序
    return a.name.localeCompare(b.name);
  });
}

// 监听分配列表变化，自动维护数据一致性
watch(props.algorithm.arrangements, () => {
  maintainFallbackArrangementCount()
  sortArrangement()
}, {immediate: true, deep: true});

// 监听奖符列表变化，自动维护分配一致性
watch(props.algorithm.items, () => {
  maintainFallbackArrangementCount()
  sortArrangement()
}, {immediate: true, deep: true});

// 当前编辑的分配对象
let nowEditArrangement:Arrangement = {} as Arrangement

// 提交编辑分配
const onSubmitEditArrangement = () => {
  if (isDistributeFallback) {
    // 如果是分配fallback，添加新的分配
    props.algorithm.arrangements.push(Object.assign({}, nowEditArrangement))
  }
  isDistributeFallback = false
  showEditArrangementModal.value = false
}

// 编辑分配项
const onEditArrangementItem = (arrangement: Arrangement) => {
  if (arrangement.mode == 'filled') {
    MessagePlugin.warning('填充模式不允许编辑')
    return;
  }
  showEditArrangementModal.value = true
  nowEditArrangement = arrangement
}

// 分配fallback项
const onDistributeFallback = (arrangement: Arrangement) => {
  isDistributeFallback = true
  // 创建副本用于编辑
  nowEditArrangement = reactive(Object.assign({}, arrangement))
  nowEditArrangement.group = ''  // 清空组别，让用户重新指定
  showEditArrangementModal.value = true
}

// 删除分配项
const onDeleteArrangementItem = (arrangement: Arrangement) => {
  props.algorithm.arrangements = props.algorithm.arrangements.filter((_arrangement) => _arrangement != arrangement)
  maintainFallbackArrangementCount()
  sortArrangement()
}

// 表格行样式函数
const getArrangementRowClassName: TableProps['rowClassName'] = (row: TableRowData) => {
  let className = ''
  // 隐藏数量为0的fallback行
  if (row.row.group == 'fallback' && row.row.total == 0) {
    return '!hidden'
  }

  // 数量小于0的行标记为无效
  if (row.row.total < 0) {
    className += 'invalid-arrangement-cell'
  }

  // fallback组的样式
  if (row.row.group == 'fallback') {
    if (row.row.mode == 'filled') {
      className += ' !bg-gray-400'    // 填充模式用深灰色
    } else {
      className += ' !bg-gray-200'    // 普通fallback用浅灰色
    }
  }

  return className
}

// 切换预览显示状态
const onToggleSnapshot = () => {
  showSnapshotModal.value = !showSnapshotModal.value
}

// 盒数设置（暂时固定为1）
const boxCount = ref(1)

// 生成奖符分布并下载CSV
const onGenerateBox = () => {
  console.log(boxCount.value)
  // 调用工具函数生成奖符分布并转换为CSV下载
  reverseMatrixAndconvertToCsvAndDownload([generatePrize(props.algorithm)], `奖符分布-${props.algorithm.serialPrefix}-${boxCount.value}盒.csv`)
}

</script>

<style>
/* 无效分配单元格的样式：第5列（数量列）背景色为淡红色 */
.invalid-arrangement-cell > td:nth-child(5) {
  background-color: rgb(255, 200, 200);
}
</style>