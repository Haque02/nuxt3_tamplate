<template>
    <!-- 产品信息配置表单，整体布局：垂直排列，间距为8个单位 -->
    <!-- label-align="top": 标签在输入框上方 -->
    <!-- @submit: 绑定提交事件处理函数 -->
    <!-- v-show="active": 只有当组件激活时才显示 -->
    <!-- :data="algorithm": 将算法数据绑定到表单 -->
    <!-- layout="inline": 表单项采用内联布局 -->
    <Form class="w-full flex flex-col gap-8" :label-align="'top'" @submit="onSubmit" v-show="active" :data="algorithm" :layout="'inline'">
        
        <!-- 总数输入框表单项 -->

        <FormItem label="总数" name="total">
            <!-- 数字输入框组件 -->
            <!-- :auto-width="true": 自动宽度调整 -->
            <!-- v-model: 双向绑定到算法对象的total字段 -->
            <!-- size="large": 大尺寸输入框 -->
            <!-- suffix="张": 显示单位后缀 -->
            <!-- min="0": 最小值为0 -->
            <InputNumber :auto-width="true" style="min-width: 200px;" v-model="algorithm.total" size="large" placeholder="总数" suffix="张" min="0"/> 
        </FormItem>
        
        <!-- 特殊号数量输入框 - 已注释掉（自动计算） -->
        <!-- <FormItem label="特殊号数量" name="specialCount"> 
            <InputNumber :auto-width="true" style=" min-width: 200px;" v-model="algorithm.specialCount" size="large" placeholder="特殊卡数量" suffix="张" min="0" :max="algorithm.total"/> 
        </FormItem> -->
        
        <!-- 列数输入框表单项 -->
        <FormItem label="列数" name="column">
            <!-- 数字输入框，用于设置卡片排列的列数 -->
            <InputNumber :auto-width="true" style=" min-width: 200px;" v-model="algorithm.column" size="large" placeholder="列数" suffix="列" min="0"/> 
        </FormItem>
        
        <!-- 流水号前缀输入框表单项 -->
        <FormItem label="流水号" name="serialPrefix">
            <!-- 文本输入框，用于设置产品流水号的前缀 -->
            <Input style=" min-width: 200px;" :auto-width="true" v-model="algorithm.serialPrefix" size="large" placeholder="流水号前缀，如SLA" />
        </FormItem>
        
        <!-- 提交按钮表单项 -->
        <FormItem class="w-full">
            <!-- 主题色按钮，type="submit"表示这是提交按钮 -->
            <Button class="w-full" :size="'large'" theme="primary" type="submit">下一步</Button>
        </FormItem>
    </Form>
</template>

<script setup lang="ts">
// 从TDesign Vue Next导入所需的组件和类型
import { Form, FormItem, Input, InputNumber, Button, type SubmitContext, type FormProps, type InputNumberValue, type ChangeContext } from 'tdesign-vue-next';
// 导入算法数据类型定义
import type { Algorithm } from '~/types/algorithm';

// 定义组件的Props类型
defineProps<{
    active: boolean                                    // 组件是否激活状态
    algorithm: Algorithm                              // 算法配置对象
    onSubmit: (result: SubmitContext) => void        // 表单提交回调函数
}>()

</script>