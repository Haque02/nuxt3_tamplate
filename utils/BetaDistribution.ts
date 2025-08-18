import beta from '@stdlib/random-base-beta'

function betaPdf(x: number, alpha: number, beta: number) {
    if (x < 0 || x > 1) return 0;
    return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / betaFunction(alpha, beta);
}

function betaCdf(x: number, alpha: number, beta: number) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    let sum = 0;
    const n = 1000; // 积分的分割数
    const dx = x / n;
    for (let i = 0; i < n; i++) {
        const xi = i * dx;
      sum += Math.pow(xi, alpha - 1) * Math.pow(1 - xi, beta - 1) * dx;
    }
    return sum / betaFunction(alpha, beta); // 归一化
}

function betaFunction(alpha: number, beta: number) {
    return (gamma(alpha) * gamma(beta)) / gamma(alpha + beta);
}

function gamma(n: number): number {
    if (n < 0) return NaN;
    if (n === 0) return Infinity;
    if (n === 1) return 1;
    if (n === 2) return 1; // 伽马(2) = 1!
    return (n - 1) * gamma(n - 1);
}


const pickPosition = (start: number, end: number, mode: string) => {
    let random = null;
    if (mode === 'random' || mode === 'average') {
        random = beta(1, 1)
    }
    
    if (mode === 'linear-left-skewed') {
        random = beta(1, 2)
    }

    if (mode === 'linear-right-skewed') {
        random = beta(2, 1)
    }

    if (mode === 'normal-left-skewed') {
        random = beta(2, 4)
    }

    if (mode === 'normal-right-skewed') {
        random = beta(4, 2)
    }

    if (mode === 'normal') {
        random = beta(4, 4)
    }
    
    if (!random) {
        throw new Error('random is null')
    }

    return Math.floor(random * (end - start) + start)
}


export { pickPosition }