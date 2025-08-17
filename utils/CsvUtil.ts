import type { Arrangement, Algorithm, Item } from "~/types/algorithm"

// reverse
const reverseMatrixAndconvertToCsvAndDownload = (matrix: Array<Array<any>>, filename: string) => {
    let csvContent = ""
    for (let i = 0; i < matrix[0].length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (!matrix[j][i]) {
                throw new Error('matrix is not valid')
            } 
            csvContent += matrix[j][i] + ','
        }
        csvContent += '\n'
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
}

export { reverseMatrixAndconvertToCsvAndDownload }