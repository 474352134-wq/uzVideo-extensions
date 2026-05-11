// ignore

//@name:{LHM}豆瓣
//@version:7
//@webSite:https://movie.douban.com
//@remark:使用网页爬取的方式实现豆瓣视频源，已在年份过滤中加入 2026 年
//@order:A00          // 在订阅列表中排在最前面（可自行调节）
//@codeID:            // 如不加密可留空
//@env:
//@isAV:0
//@deprecated:0

// ignore



// ignore
// 不支持导入，这里只是本地开发用于代码提示
// 如需添加通用依赖，请联系 https://t.me/uzVideoAppbot
import {
    FilterLabel,
    FilterTitle,
    VideoClass,
    VideoSubclass,
    VideoDetail,
    RepVideoClassList,
    RepVideoSubclassList,
    RepVideoList,
    RepVideoDetail,
    RepVideoPlayUrl,
    UZArgs,
    UZSubclassVideoListArgs,
} from '../core/uzVideo.js'

//-------------------------------
// ① 必要导入（保持不动）
//-------------------------------
import {
    FilterLabel,
    FilterTitle,
    VideoClass,
    VideoSubclass,
    VideoDetail,
    RepVideoClassList,
    RepVideoSubclassList,
    RepVideoList,
    RepVideoDetail,
    RepVideoPlayUrl,
    UZArgs,
    UZSubclassVideoListArgs,
} from '../core/uzVideo.js'

import {
    UZUtils,
    ProData,
    ReqResponseType,
    ReqAddressType,
    req,
    toast,
    formatBackData,
} from '../core/uzUtils.js'

import { cheerio, Crypto, Encrypt, JSONbig } from '../core/uz3lib.js'

//-------------------------------
// ② 辅助函数：生成年份列表（这里把 2026 加进去）
//-------------------------------
function makeYearList(start, end) {
  const years = [{ name: '全部', id: '' }]
  for (let y = start; y >= end; y--) {
    years.push({ name: String(y), id: String(y) })
  }
  return years
}

//-------------------------------
// ③ 1️⃣ 主分类列表（电影、电视剧、综艺、动漫、纪录片）
//-------------------------------
async function getClassList(args) {
  const backData = new RepVideoClassList()
  try {
    backData.data = [
      { type_id: '1', type_name: '电影', hasSubclass: true },
      { type_id: '2', type_name: '电视剧', hasSubclass: true },
      { type_id: '3', type_name: '综艺', hasSubclass: true },
      { type_id: '4', type_name: '动漫', hasSubclass: true },
      { type_id: '5', type_name: '纪录片', hasSubclass: true },
    ]
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

//-------------------------------
// ④ 2️⃣ 二级过滤器（加入年份 2026）
//-------------------------------
async function getSubclassList(args) {
  const backData = new RepVideoSubclassList()
  const id = String(args.url || '')

  // 公共地区、排序（保持与官方一致）
  const commonArea = [
    { name: '全部', id: '' },
    { name: '中国大陆', id: '中国大陆' },
    { name: '香港', id: '香港' },
    { name: '台湾', id: '台湾' },
    { name: '美国', id: '美国' },
    { name: '日本', id: '日本' },
    { name: '韩国', id: '韩国' },
    { name: '英国', id: '英国' },
    { name: '法国', id: '法国' },
    { name: '其他', id: '其他' },
  ]

  const commonSort = [
    { name: '时间排序', id: 'time' },
    { name: '人气排序', id: 'hits' },
    { name: '评分排序', id: 'score' },
  ]

  // 为每个主分类准备自己的“剧情/类型”列表，下面仅示例电影，其他可自行补全
  let filter = []
  switch (id) {
    case '1': // 电影
      filter = [
        {
          name: '剧情',
          list: [
            { name: '全部', id: '' },
            { name: '喜剧', id: '喜剧' },
            { name: '爱情', id: '爱情' },
            { name: '动作', id: '动作' },
            { name: '科幻', id: '科幻' },
            { name: '动画', id: '动画' },
            { name: '悬疑', id: '悬疑' },
            { name: '犯罪', id: '犯罪' },
            // …自行补足更多类型
          ],
        },
        { name: '地区', list: commonArea },
        // ★ 关键点：年份列表从 2026 开始
        { name: '年份', list: makeYearList(2026, 1990) },
        { name: '排序', list: commonSort },
      ]
      break

    case '2': // 电视剧
      filter = [
        {
          name: '剧情',
          list: [
            { name: '全部', id: '' },
            { name: '古装', id: '古装' },
            { name: '现代', id: '现代' },
            // …自行补足
          ],
        },
        { name: '地区', list: commonArea },
        { name: '年份', list: makeYearList(2026, 2000) },
        { name: '排序', list: commonSort },
      ]
      break

    case '3': // 综艺
      filter = [
        {
          name: '类别',
          list: [
            { name: '全部', id: '' },
            { name: '选秀', id: '选秀' },
            { name: '访谈', id: '访谈' },
            // …自行补足
          ],
        },
        { name: '地区', list: commonArea },
        { name: '年份', list: makeYearList(2026, 2010) },
        { name: '排序', list: commonSort },
      ]
      break

    case '4': // 动漫
      filter = [
        {
          name: '类型',
          list: [
            { name: '全部', id: '' },
            { name: '爱情', id: '爱情' },
            { name: '科幻', id: '科幻' },
            // …自行补足
          ],
        },
        { name: '地区', list: commonArea },
        { name: '年份', list: makeYearList(2026, 1999) },
        { name: '排序', list: commonSort },
      ]
      break

    case '5': // 纪录片
      filter = [
        {
          name: '主题',
          list: [
            { name: '全部', id: '' },
            { name: '自然', id: '自然' },
            { name: '历史', id: '历史' },
            // …自行补足
          ],
        },
        { name: '地区', list: commonArea },
        // 这里示例只到 2025，若想 2026 同样改为 makeYearList(2026,1999)
        { name: '年份', list: makeYearList(2025, 1999) },
        { name: '排序', list: commonSort },
      ]
      break

    default:
      filter = []
  }

  backData.data = new VideoSubclass()
  backData.data.filter = filter
  return JSON.stringify(backData)
}

//-------------------------------
// ⑤ 3️⃣ 视频列表（示例：搜索豆瓣 Top250）
//-------------------------------
async function getVideoList(args) {
  const backData = new RepVideoList()
  try {
    const classId = String(args.url || '')   // 1、2、3… 对应上面的 type_id
    const page = Number(args.page || 1)

    // 这里采用豆瓣“Top250”作为演示数据源。你可以自行改为任意列表页面（例如分类、标签等）。
    const startIdx = (page - 1) * 25
    const url = `https://movie.douban.com/top250?start=${startIdx}&limit=25`

    const resp = await req(url, {
      // 为防止豆瓣拒绝爬虫，伪装成常见浏览器
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },
    })
    const $ = cheerio.load(resp.data || '')

    const items = $('.grid_view li')
    const list = items
      .toArray()
      .map((el) => {
        const $el = $(el)
        const a = $el.find('a')
        const img = $el.find('img')
        const info = $el.find('.info')

        const vd = new VideoDetail()
        vd.vod_id = a.attr('href') || ''          // 这里把详情页 url 直接当作 id
        vd.vod_name = img.attr('alt') || ''
        vd.vod_pic = img.attr('src') || ''
        vd.vod_remarks = info.find('.star').text().trim() // 包含评分、评价人数等
        return vd
      })

    backData.data = list
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

//-------------------------------
// ⑥ 4️⃣ 视频详情（抓取豆瓣单条详情页）
//-------------------------------
async function getVideoDetail(args) {
  const backData = new RepVideoDetail()
  try {
    const detailUrl = String(args.vod_id || '')
    if (!detailUrl) throw new Error('缺少 vod_id')

    const resp = await req(detailUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },
    })
    const $ = cheerio.load(resp.data || '')

    const detail = new VideoDetail()
    detail.vod_id = detailUrl
    detail.vod_name = $('.subject h1 span').first().text().trim()
    detail.vod_pic = $('.subject .nbg img').attr('src') || ''
    detail.vod_remarks = $('.rating_self .rating_num').text().trim()
    // 简单的简介
    detail.vod_content = $('#link-report .intro p')
      .toArray()
      .map((p) => $(p).text().trim())
      .join('\n')

    // 将年份也放进 detail（可选）
    const yearText = $('.subject .info span[property="v:initialReleaseDate"]').first()
      .text()
      .trim()
    if (yearText) detail.vod_year = yearText

    backData.data = detail
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

//-------------------------------
// ⑦ 播放地址（豆瓣本身没有播放链接，这里返回空字符串）
//-------------------------------
async function getVideoPlayUrl(args) {
  const backData = new RepVideoPlayUrl()
  // 若你在后面自行接入磁力链、网盘、云盘等资源，这里返回对应的 URL 即可
  backData.data.play_url = ''
  return JSON.stringify(backData)
}

//-------------------------------
// ⑧ 搜索（简单关键字搜索）
//-------------------------------
async function searchVideo(args) {
  const backData = new RepVideoList()
  try {
    const kw = String(args.keywords || '')
    if (!kw) throw new Error('缺少搜索关键字')

    const url = `https://movie.douban.com/j/search_subjects?type=movie&tag=热门&sort=recommend&page_limit=20&page_start=0&keyword=${encodeURIComponent(
      kw
    )}`
    const resp = await req(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },
    })
    const json = JSONbig.parse(resp.data || '{}')
    const list = (json?.subjects || []).map((s) => {
      const vd = new VideoDetail()
      vd.vod_id = s.url
      vd.vod_name = s.title
      vd.vod_pic = s.cover
      vd.vod_remarks = `评分 ${s.rating}`
      return vd
    })
    backData.data = list
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

//-------------------------------
// ⑨ 导出（保持不改）
//-------------------------------
export {
  getClassList,
  getSubclassList,
  getVideoList,
  getVideoDetail,
  getVideoPlayUrl,
  searchVideo,
}
