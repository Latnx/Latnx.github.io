---
title: 015 单调栈
url: /docs/notes/d-e3f7616b19908d30/n-80a8cdefbe37d4ce/
draft: false
featureimage: img/note-covers/algorithms-b.webp
images:
  - img/note-covers/algorithms-b.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: LeetCode/015 单调栈.md
---

单调栈:**快速找到每个元素左边/右边第一个比它大或小的元素**
- 左：<
- 右：≤

```go
func largestRectangleArea(heights []int)(res int ){
    n := len(heights)
    stack := []int{-1}
    left, right := make([]int,n), make([]int,n)
    for index, val := range heights {
        for len(stack) > 1 && val <= heights[stack[len(stack)-1]] {
            right[stack[len(stack)-1]] = index
            stack = stack[:len(stack)-1]
        }
        left[index] = stack[len(stack)-1]
        stack = append(stack, index)
    }
    for _, i := range stack[1:]{
        right[i] = n
    }
    return
}
```
