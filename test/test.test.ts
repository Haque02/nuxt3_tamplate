import { assert, describe, test } from 'vitest'
import { pickPosition } from '../utils/BetaDistribution'
import { generatePrize } from '../utils/PrizeUtil'

const prizeJson = { "total": 5000, "column": 8, "serialPrefix": "TABU", "specialCount": 494, "items": [ { "name": "D1", "total": 425, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D125", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D150", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D25", "total": 6, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D350", "total": 3, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "D50", "total": 6, "ismoerCount": 1, "suffix": ".jpg" }, { "name": "HOLDA", "total": 24, "ismoerCount": 24, "suffix": ".jpg" }, { "name": "HOLDB", "total": 24, "ismoerCount": 24, "suffix": ".jpg" }, { "name": "Lose", "total": 4506, "ismoerCount": 3, "suffix": ".jpg", "isFallback": true } ], "arrangements": [ { "name": "D350", "mode": "average", "total": 3, "start": 1, "end": 5000, "curved": "random", "group": "A" }, { "name": "D150", "mode": "average", "total": 3, "start": 1, "end": 5000, "curved": "random", "group": "A" }, { "name": "D1", "mode": "random", "total": 425, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D125", "mode": "random", "total": 3, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D150", "mode": "random", "total": 0, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D25", "mode": "random", "total": 6, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D350", "mode": "random", "total": 0, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "D50", "mode": "random", "total": 6, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "HOLDA", "mode": "random", "total": 24, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "HOLDB", "mode": "random", "total": 24, "start": 1, "end": 5000, "curved": "random", "group": "fallback" }, { "name": "Lose", "mode": "filled", "total": 4506, "start": 1, "end": 5000, "curved": "random", "group": "fallback" } ] }


describe('BetaDistributionTest', async () => {
  test('pickPosition', () => {
    // const start = 1
    // const end = 10
    // const mode = 'random'
    // for (let i = 0; i < 1000; i++) {
    //     const result = pickPosition(start, end, mode)
    //     console.log(result)
    // }
  })
})


describe('prizeUtilTest', async() => {
  test('generatePrizeName', () => {
    console.log(generatePrize(prizeJson))
  })
})