<template>
    <Form class="w-full flex flex-col gap-8" :label-align="'top'" @submit="onSubmit" v-show="active" :data="algorithm" :layout="'inline'">
        <FormItem label="总数" name="total">
            <InputNumber :auto-width="true" style="min-width: 200px;" v-model="algorithm.total" size="large" placeholder="总数" suffix="张" min="0"/> 
        </FormItem>
        <!-- 自动计算 disabled -->
        <!-- <FormItem label="特殊号数量" name="specialCount"> 
            <InputNumber :auto-width="true" style=" min-width: 200px;" v-model="algorithm.specialCount" size="large" placeholder="特殊卡数量" suffix="张" min="0" :max="algorithm.total"/> 
        </FormItem> -->
        <FormItem label="列数" name="column">
            <InputNumber :auto-width="true" style=" min-width: 200px;" v-model="algorithm.column" size="large" placeholder="列数" suffix="列" min="0"/> 
        </FormItem>
        <FormItem label="流水号" name="serialPrefix">
            <Input style=" min-width: 200px;" :auto-width="true" v-model="algorithm.serialPrefix" size="large" placeholder="流水号前缀，如SLA" />
        </FormItem>
        <FormItem class="w-full">
            <Button class="w-full" :size="'large'" theme="primary" type="submit">下一步</Button>
        </FormItem>
    </Form>
</template>

<script setup lang="ts">
import { Form, FormItem, Input, InputNumber, Button, type SubmitContext, type FormProps, type InputNumberValue, type ChangeContext } from 'tdesign-vue-next';
import type { Algorithm } from '~/types/algorithm';

defineProps<{
    active: boolean
    algorithm: Algorithm
    onSubmit: (result: SubmitContext) => void
}>()


</script>