new Vue({
    el: '#app',
    data: {
        url: null,
        keyWord: '',
        responseList: [],
        pagination: {
            first: null,
            last: null,
            prev: null,
            next: null,
            page: null
        },
        wordsFound: 0,
        urlValidation: false,
        videoId: null,
        videoTitle: '',
        videoChannel: '',
        channelUrl: '',
        errorCode: null,
        errorMessage: null
    },
    watch: {
        url: pDebounce(async function handleUrl(url) {
            if (url && url.length >= 3) {
                await this.validation(url, this.url)
            } else {
                this.clearResultAndPagination()
            }
        }, 250),
        keyWord: pDebounce(async function handleKeywords(keyWord) {
            if (keyWord && keyWord.length >= 3) {
                await this.cari(keyWord, this.url)
            } else {
                this.clearResultAndPagination()
            }
        }, 250)
    },
    methods: {
        validation(url) {
            var regExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
            if (regExp.test(url)) {
                this.urlValidation = false
                var match = url.match(regExp)
                if (match && match[5].length == 11) {
                    this.videoId = 'https://www.youtube.com/embed/'+match[5]
                    this.videoApi(match[5])
                } else {
                    this.urlValidation = true
                }
            } else {
                this.urlValidation = true
            }
        },
        async videoApi(videoId) {
            const response = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+ videoId +'&fields=items(id,snippet)&key=AIzaSyB0fl8R_UJhBzBbbRGqZbmqENQG1IDFve4')
            const data = await response.json()
            errorCode = data.error
            if (errorCode==='undefined'||errorCode==null){
                this.videoTitle = data.items[0].snippet.title
                this.videoChannel = data.items[0].snippet.channelTitle
                this.channelUrl = 'https://youtube.com/channel/'+data.items[0].snippet.channelId
            } else {
                const response = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+ videoId +'&fields=items(id,snippet)&key=AIzaSyAZr7DL1Ywxa5va36Z2ep24JTX4-ezsksQ')
                const data = await response.json()
                errorCode = data.error
                if (errorCode==='undefined'||errorCode==null) {
                    this.videoTitle = data.items[0].snippet.title
                    this.videoChannel = data.items[0].snippet.channelTitle
                    this.channelUrl = 'https://youtube.com/channel/' + data.items[0].snippet.channelId
                } else {
                    this.errorCode = data.error.code
                    this.errorMessage = data.error.errors[0].reason
                }
            }
        },
        async cari(keyWord, url, pagination) {
            try {
                const respon = await fetch(
                    pagination
                        ? pagination
                        : `https://cari-teks-video-api.vercel.app/api/search?q=${keyWord}&url=${encodeURIComponent(url)}`
                ).then(_ => (_.ok ? _.json() : []))
                this.responseList = respon.data
                this.pagination.first = respon.first
                this.pagination.last = respon.last
                this.pagination.prev = respon.prev
                this.pagination.next = respon.next
                this.pagination.page = respon.page
                this.wordsFound = respon.total
            } catch (error) {}
        },
        timeStart(time){
            var pad = function(num, size) { return ('000' + num).slice(size * -1); },
                time = parseFloat(time).toFixed(3),
                hours = Math.floor(time / 60 / 60),
                minutes = Math.floor(time / 60) % 60,
                seconds = Math.floor(time - minutes * 60)
            return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2)
        },
        async navigation(type) {
            if (!this.pagination[type]) {
                return
            }
            await this.cari(this.keyWord, this.url, this.pagination[type])
        },
        clearResultAndPagination() {
            this.responseList = []
            this.pagination = {
                first: null,
                last: null,
                prev: null,
                next: null,
                page: null
            },
                this.wordsFound = 0
        }
    }
})