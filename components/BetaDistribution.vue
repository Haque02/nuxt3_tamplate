<template>
	<div class="w-full h-full">
		<svg ref="svg"></svg>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { betaPdf, betaCdf } from "~/utils/BetaDistribution";
import * as d3 from "d3";

const props = defineProps({
	alpha: {
		type: Number,
		default: 1,
	},
	beta: {
		type: Number,
		default: 1,
	},
	xAxis: {
		type: Object,
		default: {
			start: 0,
			end: 1,
		},
	},
	mode: {
		type: String,
		default: "pdf",
	},
	width: {
		type: Number,
		default: 500,
	},
	height: {
		type: Number,
		default: 300,
	},
});

const svg = ref(null);

onMounted(() => {
	const width = props.width;
	const height = props.height;
	const margin = { top: 20, right: 30, bottom: 30, left: 40 };

	console.log(props.mode);
	const data = d3.range(props.xAxis.start, props.xAxis.end, 0.01).map((x) => {
		return {
			x: x,
			y:
				props.mode === "cdf"
					? betaCdf(x, props.alpha, props.beta)
					: betaPdf(x, props.alpha, props.beta), // 根据模式选择
		};
	});

	// 找到 y 值的最大值
	const maxY = props.mode === "cdf" ? 1 : d3.max(data, (d) => d.y); // CDF 的最大值为 1

	const xScale = d3
		.scaleLinear()
		.domain([props.xAxis.start, props.xAxis.end])
		.range([margin.left, width - margin.right]);
	const yScale = d3
		.scaleLinear()
		.domain([0, maxY])
		.range([height - margin.bottom, margin.top]);

	const line = d3
		.line()
		.x((d) => xScale(d.x))
		.y((d) => yScale(d.y));

	const svgElement = d3
		.select(svg.value)
		.attr("width", width)
		.attr("height", height);

	svgElement
		.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.attr("fill", "none")
		.attr("stroke", "blue");

	// 添加 x 轴
	svgElement
		.append("g")
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(xScale));

	// 添加 y 轴
	svgElement
		.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(yScale));
});
</script>
