---
title: 012 前缀和与差分
url: /docs/notes/d-e3f7616b19908d30/n-5ed97d0c17a39aea/
draft: false
featureimage: img/note-covers/algorithms-a.webp
images:
  - img/note-covers/algorithms-a.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: LeetCode/012 前缀和与差分.md
---

利用前缀和快速得到区域累加和
子数组是数组中元素的连续非空序列。
哈希表记录前缀和到下标的映射，可求长度
差分数组用来解决典型的区间更新（Range Update）问题
前缀和长度空出零
差分空出0和n+1
可以统一设置成n+2
### 一维前缀和与一维差分 {#h-428182d531d0832a}
```go
// 从 1 开始
  for i, num := range nums {
        preSum[i+1] = preSum[i] + num
  }
```

```go
// 航班预订统计
// 这里有 n 个航班，它们分别从 1 到 n 进行编号。
// 有一份航班预订表 bookings ，
// 表中第 i 条预订记录 bookings[i] = [firsti, lasti, seatsi]
// 意味着在从 firsti 到 lasti
// （包含 firsti 和 lasti ）的 每个航班 上预订了 seatsi 个座位。
// 请你返回一个长度为 n 的数组 answer，里面的元素是每个航班预定的座位总数。
// 测试链接 : https://leetcode.cn/problems/corporate-flight-bookings/

func corpFlightBookings(bookings [][]int, n int) []int {
    res := make([]int, n+2)
    for _, boobooking := range bookings {
        res[boobooking[0]] += boobooking[2]
        res[boobooking[1]+1] -= boobooking[2]
    }
    for i := 1; i < len(res); i++ {
        res[i] += res[i-1]
    }
    return res[1 : len(res)-1]
}
```

### 二维前缀和与二维差分 {#h-aad1f9a277895d51}

```go
            preMatrix[i+1][j+1] = matrix[i][j]
            preMatrix[i][j] = preMatrix[i-1][j] + preMatrix[i][j-1] - preMatrix[i-1][j-1] + preMatrix[i][j]
```

```go
func set(row1, col1, row2, col2 int) {
    diff[row1][col1] += 1
    diff[row1][col2+1] -= 1
    diff[row2+1][col1] -= 1
    diff[row2+1][col2+1] += 1
}
func build() {
    for i := 1; i < len(diff); i++ {
        for j := 1; j < len(diff[0]); j++ {
            diff[i][j] += diff[i-1][j] + diff[i][j-1] - diff[i-1][j-1]
        }
    }
}
```