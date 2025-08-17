<template>

  <Dialog top="5rem" model="nowEditArrangement" v-model:visible="showEditArrangementModal" title="分配" :footer="false" :header="`添加分配 - ${nowEditArrangement?.name}`">
    <div class="flex-1">
      <Form class=" flex flex-col" :layout="'vertical'" :label-align="'top'" @submit="onSubmitEditArrangement">
          <FormItem label="奖符名称" name="name">
            <Input v-model="nowEditArrangement.name" size="large" placeholder="奖符名称"></Input>
          </FormItem>
          <FormItem label="模式" name="mode">
            <Select v-model="nowEditArrangement.mode" size="large" required>
              <Option label="随机" value="random"></Option>
              <Option label="平均" value="average"></Option>
            </Select>
          </FormItem>
          <FormItem label="数量" name="total">
            <InputNumber :disabled="nowEditArrangement.group == 'fallback'" v-model="nowEditArrangement.total" size="large" placeholder="1" required min="0" :max="Math.min(nowEditArrangement.end - nowEditArrangement.start + 1, props.algorithm.total)"></InputNumber>
          </FormItem>
          <FormItem class="flex-1" label="起始位置" name="start">
            <InputNumber v-model="nowEditArrangement.start" size="large" placeholder="1" required min="1" :max="nowEditArrangement.end"></InputNumber>
          </FormItem>
          <FormItem class="flex-1" label="结束位置" name="end">
            <InputNumber v-model="nowEditArrangement.end" size="large" placeholder="1" required :min="nowEditArrangement.start" :max="props.algorithm.total"></InputNumber>
          </FormItem>
          <FormItem label="组别">
            <Input :disabled="nowEditArrangement.group == 'fallback'" v-model="nowEditArrangement.group" size="large" placeholder="组别"></Input>
          </FormItem>
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
          <div class="w-full flex flex-row gap-4">
            <Button class="w-full" size="large" theme="primary" type="submit">完成</Button>
          </div>
      </Form>
    </div>
  </Dialog> 

  <Form @submit="onGenerateBox" @reset="onReset" v-if="active">
    <div class="flex flex-col gap-8">
      <div>
        <div class="flex flex-row gap-4">
          <h2 class="text-2xl nt-bold">分配区</h2>
          <Link theme="primary" @click="onToggleSnapshot">预览</Link>
        </div>
        <div v-if="showSnapshotModal && props.active">
          <div class="w-full flex flex-row" v-if="props.active">
            <div v-for="item in algorithm.column" class="w-full text-gray-500">
              <div class="h-20 rounded-sm border-white border-2 bg-slate-200 flex items-center justify-center">
                <span>第{{ item }}列</span>
              </div>
            </div>
          </div>
          <div v-for="arrangment in algorithm.arrangements" @click="onEditArrangementItem(arrangment)">
            <div v-if="arrangment.mode == 'filled' || arrangment.mode == 'random' && arrangment.total != 0" class="h-20 rounded-sm border-white border-2 bg-slate-200 flex items-center justify-center" :style="{ position: 'relative', left: `${(arrangment.start / algorithm.total) * 100}%`, width: `${(arrangment.end - arrangment.start) / algorithm.total * 100}%`}">
              {{ arrangment.total }} 个 {{ modeMap[arrangment.mode] }} 的 {{ arrangment.name }}
            </div>
            <div v-else class="flex flex-row w-full flex-nowrap" :style="{ position: 'relative', left: `${(arrangment.start / algorithm.total) * 100}%`, width: `${(arrangment.end - arrangment.start) / algorithm.total * 100}%`}">
              <div v-for="item in arrangment.total" class="min-w-0 w-full h-20 rounded-sm border-white border-2 bg-slate-200 items-center justify-center">
                <div class="w-full h-full flex items-center justify-center break-all text-xs">1 个 {{ arrangment.name }}</div>
              </div>
            </div>
          </div>
        </div>
        <Table :columns="arrangementColumns" :data="props.algorithm.arrangements" row-key="data.index" :row-class-name="getArrangementRowClassName" class="bg-red-200">
          <template #operations="{ row }">
          <div v-if="row.mode != 'filled' " class="flex flex-row gap-2">
            <Link theme="primary" hover="color" @click="onEditArrangementItem(row)">编辑</Link>
            <Link v-if="row.group == 'fallback'" theme="primary" hover="color" @click="onDistributeFallback(row)">分配</Link>
            <Link v-else theme="danger" hover="color" @click="onDeleteArrangementItem(row)">删除</Link>
          </div>
          <div v-else class="flex flex-row gap-2">
            <Link disabled>不可编辑</Link>
          </div>
          </template>
          <template #mode="{ row }">
            {{ modeMap[row.mode] }}
          </template>
          <template #curved="{ row }">
            <Popup :content="curvedMap[row.curved][1]" placement="top">
              {{ curvedMap[row.curved][0] }}
            </Popup>
          </template>
          <template #group="{ row }">
            {{ row.group == 'fallback' ? '剩余' : row.group }}
          </template>
        </Table>
      </div>
      <div class="flex flex-row gap-4 w-full">
        <Button class="w-full" :size="'large'" theme="default" type="reset">上一步</Button>
        <Button class="w-full" :size="'large'" theme="primary" type="submit">生成 {{ boxCount }} 盒</Button>
      </div>
    </div>
  </Form>

</template>

<script setup lang="ts">
import { Popup, Input, Dialog,FormItem, InputNumber, Option, Form, Button, type SubmitContext, Table, type TableProps, Link, type TableRowData, Select, MessagePlugin} from 'tdesign-vue-next';
import type { Algorithm, Arrangement } from '~/types/algorithm';
import { reverseMatrixAndconvertToCsvAndDownload } from '~/utils/CsvUtil';

const props = defineProps<{
    active: boolean
    algorithm: Algorithm
    onReset: (context: { e?: Event | undefined; }) => void
}>()

const showSnapshotModal = ref(false)

const modeMap: Record<string, string> = {
  'random': '随机',
  'average': '平均',
  'filled': '填充',
}

const curvedMap: Record<string, string[]> = {
  'normal': ['正态分布', '中间概率高，两边概率低'],
  'beta-right-skewed': ['正态右偏', '左边概率高，右边概率低'],
  'linear-right-skewed': ['线性右偏', '左边概率高，右边概率低'],
  'beta-left-skewed': ['正态左偏', '右边概率高，左边概率低'],
  'linear-left-skewed': ['线性左偏', '右边概率高，左边概率低'],
  'random': ['均匀分布', '概率均匀'],
}

const showEditArrangementModal = ref(false)
let isDistributeFallback: boolean = false

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

const maintainFallbackArrangementCount = () => {
  const expectedFallBackCountChangeMap: Map<string, number> = new Map()

  // 若不存在，则创建
  props.algorithm.items.forEach((item) => {
    if (!props.algorithm.arrangements.find((arrangement) => arrangement.name == item.name && arrangement.group == 'fallback')) {
      props.algorithm.arrangements.push({
        name: item.name,
        mode: item.isFallback ? 'filled' : 'random',
        total: item.total,
        start: 1,
        end: props.algorithm.total,
        curved: 'random',
        group: 'fallback',
      })
    }
    expectedFallBackCountChangeMap.set(item.name, item.total)
    return;
  })

  props.algorithm.arrangements.forEach((arrangement) => {
    if (!props.algorithm.items.find((item) => item.name == arrangement.name)) {
      onDeleteArrangementItem(arrangement)
      return;
    }

    if (arrangement.group == 'fallback') {
      expectedFallBackCountChangeMap.set(arrangement.name, expectedFallBackCountChangeMap.get(arrangement.name)! - arrangement.total)
    }

    if (arrangement.group != 'fallback') {
      expectedFallBackCountChangeMap.set(arrangement.name, expectedFallBackCountChangeMap.get(arrangement.name)! - arrangement.total)
    }
  })

  expectedFallBackCountChangeMap.forEach((value, key) => {
      if (value != 0) {
        const fallbackArragement = props.algorithm.arrangements.find((arrangement) => arrangement.name == key && arrangement.group == 'fallback')
        fallbackArragement!.total = fallbackArragement!.total + value
      }
  })

} 

const sortArrangement = () => {
  props.algorithm.arrangements.sort((a, b) => {
    // 填充模式最后
    if (a.mode == 'filled') return 1;
    if (b.mode == 'filled') return -1;
    // 剩余组别最后
    if (a.group == 'fallback' && b.group != 'fallback') return 1;
    if (b.group == 'fallback' && a.group != 'fallback') return -1;
    // 有组别优先
    if (a.group && !b.group && a.group != 'fallback') return -1;
    if (b.group && !a.group && b.group != 'fallback') return 1;
    // 组别排序
    if (a.group && b.group && a.group != 'fallback' && b.group != 'fallback') return a.group.localeCompare(b.group);
    // 名称排序
    return a.name.localeCompare(b.name);
  });
  
}

watch(props.algorithm.arrangements, () => {
  maintainFallbackArrangementCount()
  sortArrangement()
}, {immediate: true, deep: true});

watch(props.algorithm.items, () => {
  maintainFallbackArrangementCount()
  sortArrangement()
}, {immediate: true, deep: true});

let nowEditArrangement:Arrangement = {} as Arrangement

const onSubmitEditArrangement = () => {
  if (isDistributeFallback) {
    props.algorithm.arrangements.push(Object.assign({}, nowEditArrangement))
  }
  isDistributeFallback = false
  showEditArrangementModal.value = false
}

const onEditArrangementItem = (arrangement: Arrangement) => {
  if (arrangement.mode == 'filled') {
    MessagePlugin.warning('填充模式不允许编辑')
    return;
  }
  showEditArrangementModal.value = true
  nowEditArrangement = arrangement
}

const onDistributeFallback = (arrangement: Arrangement) => {
  isDistributeFallback = true
  nowEditArrangement = reactive(Object.assign({}, arrangement))
  nowEditArrangement.group = ''
  showEditArrangementModal.value = true
}

const onDeleteArrangementItem = (arrangement: Arrangement) => {
  props.algorithm.arrangements = props.algorithm.arrangements.filter((_arrangement) => _arrangement != arrangement)
  maintainFallbackArrangementCount()
  sortArrangement()
}


const getArrangementRowClassName: TableProps['rowClassName'] = (row: TableRowData) => {
  let className = ''
  if (row.row.group == 'fallback' && row.row.total == 0) {
    return '!hidden'
  }

  if (row.row.total < 0) {
    className += 'invalid-arrangement-cell'
  }

  if (row.row.group == 'fallback') {
    if (row.row.mode == 'filled') {
      className += ' !bg-gray-400'
    } else {
      className += ' !bg-gray-200'
    }
  }

  return className
}

const onToggleSnapshot = () => {
  showSnapshotModal.value = !showSnapshotModal.value
}

const boxCount = ref(1)

const onGenerateBox = () => {
  console.log(boxCount.value)
  reverseMatrixAndconvertToCsvAndDownload([generatePrize(props.algorithm)], `奖符分布-${props.algorithm.serialPrefix}-${boxCount.value}盒.csv`)
}

</script>


<style>
.invalid-arrangement-cell > td:nth-child(5) {
  background-color: rgb(255, 200, 200);
}
</style>