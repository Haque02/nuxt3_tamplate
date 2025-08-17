    <template>
        <!-- Beta分布图表容器 -->
        <div class="w-full h-full">
            <!-- SVG元素，用于绘制图表 -->
            <svg ref="svg"></svg>
        </div>
    </template>

    <script setup>
    // 导入Vue 3的响应式API
    import { ref, onMounted } from 'vue';
    // 导入Beta分布计算函数
    import { betaPdf, betaCdf } from '~/utils/BetaDistribution';
    // 导入D3.js数据可视化库
    import * as d3 from 'd3';

    // 定义组件的Props及其默认值
    const props = defineProps({
        alpha: {                    // Beta分布的α参数
            type: Number,
            default: 1
        },
        beta: {                     // Beta分布的β参数
            type: Number,   
            default: 1
        },
        xAxis: {                    // X轴范围配置
            type: Object,
            default: {
                start: 0,           // X轴起始值
                end: 1              // X轴结束值
            }
        },
        mode: {                     // 显示模式：pdf（概率密度函数）或cdf（累积分布函数）
            type: String,
            default: 'pdf'
        },
        width: {                    // 图表宽度
            type: Number,
            default: 500
        },
        height: {                   // 图表高度
            type: Number,
            default: 300
        }
    })

    // 创建SVG元素的引用
    const svg = ref(null);

    // 组件挂载后执行图表绘制
    onMounted(() => {
        // 图表尺寸设置
        const width = props.width;
        const height = props.height;
        // 图表边距设置（上、右、下、左）
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };

        console.log(props.mode)
        
        // 生成数据点：从起始到结束，步长0.01
        const data = d3.range(props.xAxis.start, props.xAxis.end, 0.01).map(x => {
            return {
                x: x,   // X坐标值
                // Y坐标值：根据模式选择PDF或CDF函数
                y: props.mode === 'cdf' ? betaCdf(x, props.alpha, props.beta) : betaPdf(x, props.alpha, props.beta)
            };
        });

        // 计算Y轴的最大值
        const maxY = props.mode === 'cdf' ? 1 : d3.max(data, d => d.y); // CDF的最大值固定为1

        // 创建X轴比例尺：线性映射从数据域到像素域
        const xScale = d3.scaleLinear().domain([props.xAxis.start, props.xAxis.end]).range([margin.left, width - margin.right]);
        // 创建Y轴比例尺：注意Y轴方向是反的（0在顶部）
        const yScale = d3.scaleLinear().domain([0, maxY]).range([height - margin.bottom, margin.top]);

        // 创建线条生成器
        const line = d3.line()
            .x(d => xScale(d.x))    // X坐标映射
            .y(d => yScale(d.y));   // Y坐标映射

        // 选择SVG元素并设置尺寸
        const svgElement = d3.select(svg.value)
            .attr('width', width)
            .attr('height', height);

        // 绘制分布曲线
        svgElement.append('path')
            .datum(data)                // 绑定数据
            .attr('class', 'line')      // CSS类名
            .attr('d', line)            // 使用线条生成器绘制路径
            .attr('fill', 'none')       // 不填充
            .attr('stroke', 'blue');    // 蓝色描边

        // 添加X轴
        svgElement.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)  // 移动到底部
            .call(d3.axisBottom(xScale));   // 调用X轴生成器

        // 添加Y轴
        svgElement.append('g')
            .attr('transform', `translate(${margin.left},0)`)   // 移动到左侧
            .call(d3.axisLeft(yScale));     // 调用Y轴生成器
    });
    </script>