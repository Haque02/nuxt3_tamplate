export interface Algorithm {
  total: number
  column: number
  serialPrefix: string
  specialCount: number
  items: Item[]
  arrangements: Arrangement[]
}

export interface Item {
  name: string
  total: number
  ismoerCount: number
  suffix: string
  isFallback?: boolean | undefined | null
}

export interface Arrangement {
  name: string
  mode: string
  total: number
  start: number
  end: number
  curved: string
  group: string
}


export interface UnitArrangement {
  nameList: string[]
  mode: string
  total: number
  start: number
  end: number
  curved: string
}