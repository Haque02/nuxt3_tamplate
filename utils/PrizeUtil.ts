import type { Arrangement, Item, Algorithm, UnitArrangement } from "~/types/algorithm"
import { pickPosition } from '~/utils/BetaDistribution'

const prizeJson = { "total": 5000, "column": 8, "serialPrefix": "TABU", "specialCount": 494, "items": [ { "name": "D1", "total": 425, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D125", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D150", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D25", "total": 6, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D350", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D50", "total": 6, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "HOLDA", "total": 24, "ismoerCount": 24, "suffix": ".jpg" }, { "name": "HOLDB", "total": 24, "ismoerCount": 24, "suffix": ".jpg" }, { "name": "Lose", "total": 4506, "ismoerCount": 3, "suffix": ".jpg", "isFallback": true } ], "arrangements": [ { "name": "D350", "mode": "average", "total": 3, "start": 1251, "end": 5000, "curved": "random", "group": "A" }, { "name": "D150", "mode": "average", "total": 3, "start": 1251, "end": 5000, "curved": "random", "group": "A" }, { "name": "D1", "mode": "random", "total": 425, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D125", "mode": "random", "total": 3, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D150", "mode": "random", "total": 0, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D25", "mode": "random", "total": 6, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D350", "mode": "random", "total": 0, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D50", "mode": "random", "total": 6, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "HOLDA", "mode": "random", "total": 24, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "HOLDB", "mode": "random", "total": 24, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "Lose", "mode": "filled", "total": 4506, "start": 1, "end": 5000, "curved": "random", "group": "fallback" } ] }

/**
 * 生成一个由 奖品 name 为 Key，{name}.{isomoeCount}.{suffix} 为 Value 的 Map
 * 例 item: { name: 'D1', total: 425, ismoerCount: 1, suffix: '.jpg' }
 * 返回 Map: { D1: [D1-0001.suffix] }
 * @param itemList 
 */
const generatePrizeName = (itemList: Item[])  => {
    const prizeNameMap = new Map<string, Array<string>>()

    itemList.forEach(item => {
        const itemNameList = []
        for (let index = 0; index < item.total; index++) {
            const ordinal = index % item.ismoerCount + 1
            itemNameList.push(`${item.name}-${ordinal.toString().padStart(4, "0")}${item.suffix}`)
        }
        // 打乱顺序
        itemNameList.sort(() => Math.random() - 0.5)
        prizeNameMap.set(item.name, itemNameList)
    })
    
    return prizeNameMap
}


const generatePrize = (algorithm: Algorithm) => {
    const unitArrangementList: UnitArrangement[] = []
    const prizeNameMap = generatePrizeName(algorithm.items)

    const prizeResult: String[] = new Array(algorithm.total).fill(null)

    // fallback arrangements 单个成组处理
    const fallbackArrangement = 
    algorithm.arrangements.filter(arrangement => arrangement.group == 'fallback' && arrangement.total > 0)
        .forEach(arrangement => unitArrangementList.push(...convertGroupedArrangementToUnitArrangement(arrangement, prizeNameMap)))

    // grouped arrangements 合并成组处理
    algorithm.arrangements
        .filter(arrangement => arrangement.group !== 'fallback')
        .reduce((groups, arrangement) => {
            const group = arrangement.group
            if (!groups.has(group)) {
                groups.set(group, [])
            }
            groups.get(group)?.push(arrangement)
            return groups
        }, new Map<string, Arrangement[]>())
        .forEach((arrangements, _) => unitArrangementList.push(...convertGroupedArrangementToUnitArrangement(arrangements, prizeNameMap)))


    // 先填多的，再填少的
    unitArrangementList.sort((a, b) => b.total - a.total).filter(unitArrangement => unitArrangement.mode !== 'filled').forEach(unitArrangement => {
        if (unitArrangement.total != unitArrangement.nameList.length) {
            throw new Error("unitArrangement total is not equal to nameList length")
        }

        unitArrangement.nameList.forEach(prize => {
            let position = pickPosition(unitArrangement.start, unitArrangement.end, unitArrangement.curved)
            let retry = 0
            while (prizeResult[position]) {
                console.log("using params: ", unitArrangement.start, unitArrangement.end, unitArrangement.curved)
                console.log(`put prize ${prize} failed, position: ${position}, already has prize: ${prizeResult[position]}`)
                retry++
                position = pickPosition(unitArrangement.start, unitArrangement.end, unitArrangement.curved)
                if (retry > 100) {
                    throw new Error("put prize failed")
                }
            }
            prizeResult[position] = prize
        })
    })

    // filled arrangements 单独处理，只允许存在一个，并检查是否填满。
    let hasFilled = false
    unitArrangementList.filter(unitArrangement => unitArrangement.mode === 'filled').forEach(unitArrangement => {
        if (hasFilled) {
            throw new Error("has more than one filled unitArrangement")
        }
        
        for (let index = 0; index < prizeResult.length; index++) {
            if (prizeResult[index]) {
                continue
            }

            if (unitArrangement.nameList.length === 0) {
                throw new Error("unitArrangement nameList is not enough")
            }

            prizeResult[index] = unitArrangement.nameList.pop()!
        }

        hasFilled = true;
    })

    return prizeResult
}

/**
 * 将单个 fallbackArrangement 或多个同组别的 Arrangement 转换为一个 UnitArrangement
 * @param groupedArrangements 
 * @param prizeNameMap 
 */
const convertGroupedArrangementToUnitArrangement = (groupedArrangements: Arrangement[] | Arrangement, prizeNameMap: Map<string, Array<string>>): UnitArrangement[] => {
    groupedArrangements = Array.isArray(groupedArrangements) ? groupedArrangements : [groupedArrangements]
    
    if (groupedArrangements.length === 0) {
        throw new Error("arrangements is empty")
    }

    const result: UnitArrangement = {
        total: 0,
        nameList: [],
        mode: groupedArrangements[0].mode,
        start: groupedArrangements[0].start,
        end: groupedArrangements[0].end,
        curved: groupedArrangements[0].curved
    }

    groupedArrangements.map(arrangement => {
        result.total += arrangement.total
        result.nameList.push(...prizeNameMap.get(arrangement.name)?.splice(0, arrangement.total)??[])
    })

    if (result.mode === 'average') {
        return breakDownAverageUnitArrangment(result)
    }

    return [result]
}

const breakDownAverageUnitArrangment = (arrangement: UnitArrangement): UnitArrangement[] => {
    const result: UnitArrangement[] = []
    const step = Math.floor((arrangement.end - arrangement.start) / arrangement.total)
    for (let index = 0; index < arrangement.total; index++) {
        const unitArrangement: UnitArrangement = {
            total: 1,
            nameList: [arrangement.nameList[index]],
            mode: arrangement.mode,
            start: step * index + arrangement.start,
            // TODO: (Fix or clearify) 最后一个奖品区间可能比正常情况更大
            end: index + 1 == arrangement.total ? arrangement.end : step * (index + 1) + arrangement.start - 1,
            curved: arrangement.curved
        }
        result.push(unitArrangement)
    }
    return result
}

export { generatePrizeName, generatePrize }