<template>
  <div>
    <div class="pl-24 pr-24 pt-20 pb-20">
      <Steps
        :default-current="defaultForm"
        :current="activeForm"
      >
        <StepItem title="产品信息" />
        <StepItem title="奖符信息" />
        <StepItem title="基础分布" />
      </Steps>
      <ClientOnly>
        <div class="overflow-hidden mt-10 flex flex-col">
          <ProductForm
            :active="activeForm === 0"
            :algorithm="algorithm"
            :onSubmit="(result: SubmitContext) => onSubmit(result, 1)"
          />
          <PrizeForm
            :active="activeForm === 1"
            :algorithm="algorithm"
            :onSubmit="(result: SubmitContext) => onSubmit(result, 2)"
            :onReset="() => onReset(0)"
          />
          <ArrangementForm
            :active="activeForm === 2"
            :algorithm="algorithm"
            :onReset="() => onReset(1)"
          />
        </div>
      </ClientOnly>
      <div class="mt-20">
        <div>当前算法
        </div>
        <div class="text-gray-400">{{ algorithm }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StepItem, Steps, type SubmitContext } from 'tdesign-vue-next';
import ProductForm from '~/components/ProductForm.vue';
import PrizeForm from '~/components/PrizeForm.vue';
import ArrangementForm from '~/components/ArrangementForm.vue';
import type { Algorithm } from '~/types/algorithm';


let algorithm: Algorithm = reactive(
  {
    "total": 3800,
    "column": 8,
    "serialPrefix": "HEA",
    "specialCount": 300,
    "items": [
      { "name": "D1", "total": 220, "ismoerCount": 1, "suffix": ".jpg" },
      { "name": "D100", "total": 1, "ismoerCount": 1, "suffix": ".jpg" },
      { "name": "D2", "total": 15, "ismoerCount": 1, "suffix": ".jpg" },
      { "name": "D50", "total": 1, "ismoerCount": 1, "suffix": ".jpg" },
      { "name": "HOLDA", "total": 31, "ismoerCount": 31, "suffix": ".jpg" },
      { "name": "HOLDB", "total": 24, "ismoerCount": 24, "suffix": ".jpg" },
      { "name": "Lose", "total": 3508, "ismoerCount": 3, "suffix": ".jpg", "isFallback": true }
    ],
    "arrangements": [
      { "name": "D100", "mode": "average", "total": 1, "start": 1, "end": 1900, "curved": "linear-right-skewed", "group": "A" },
      { "name": "D50", "mode": "random", "total": 1, "start": 1900, "end": 3799, "curved": "linear-left-skewed", "group": "A" },
      { "name": "HOLDA", "mode": "average", "total": 24, "start": 1, "end": 3769, "curved": "normal", "group": "" },
      { "name": "HOLDA", "mode": "random", "total": 1, "start": 3770, "end": 3799, "curved": "normal", "group": "" },
      { "name": "HOLDA", "mode": "average", "total": 6, "start": 1, "end": 3799, "curved": "random", "group": "" },
      { "name": "D1", "mode": "random", "total": 220, "start": 1, "end": 3800, "curved": "random", "group": "fallback" },
      { "name": "D100", "mode": "average", "total": 0, "start": 1, "end": 3800, "curved": "normal", "group": "fallback" },
      { "name": "D2", "mode": "random", "total": 15, "start": 1, "end": 3800, "curved": "random", "group": "fallback" },
      { "name": "D50", "mode": "random", "total": 0, "start": 1, "end": 3800, "curved": "random", "group": "fallback" },
      { "name": "HOLDA", "mode": "random", "total": 0, "start": 3770, "end": 3800, "curved": "random", "group": "fallback" },
      { "name": "HOLDB", "mode": "average", "total": 24, "start": 1, "end": 3800, "curved": "random", "group": "fallback" },
      { "name": "Lose", "mode": "filled", "total": 3508, "start": 1, "end": 3800, "curved": "random", "group": "fallback" }]
  }
)


let defaultForm = ref(0)
let activeForm = ref(defaultForm.value)

const onSubmit = (context: SubmitContext, val: number) => {
  if (context.validateResult === true) {
    activeForm.value = val;
  }
};


const onReset = (val: number) => {
  activeForm.value = val;
};


</script>
