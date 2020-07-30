// Source: https://github.com/sindresorhus/p-debounce/blob/master/index.js
function pDebounce(fn, wait, options = {}) {
    if (!Number.isFinite(wait)) {
        throw new TypeError("Expected `wait` to be a finite number")
    }

    let leadingValue
    let timer
    let resolveList = []

    return function(...arguments_) {
        return new Promise(resolve => {
            const runImmediately = options.leading && !timer

            clearTimeout(timer)

            timer = setTimeout(() => {
                timer = null

                const result = options.leading
                    ? leadingValue
                    : fn.apply(this, arguments_)

                for (resolve of resolveList) {
                    resolve(result)
                }

                resolveList = []
            }, wait)

            if (runImmediately) {
                leadingValue = fn.apply(this, arguments_)
                resolve(leadingValue)
            } else {
                resolveList.push(resolve)
            }
        })
    }
}