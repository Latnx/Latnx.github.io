---
title: 3-1 快排
url: /docs/notes/d-e3f7616b19908d30/n-c66dfe556ffe17ea/
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
obsidianSource: LeetCode/3-1 快排.md
---

```go
func partition(nums []int, l, r int) (int, int) {
    pivot := nums[l+rand.Intn(r-l+1)]
    for i := l; i <= r; {
        if nums[i] < pivot {
            nums[i], nums[l] = nums[l], nums[i]
            l++
            i++
        } else if nums[i] > pivot {
            nums[i], nums[r] = nums[r], nums[i]
            r--
        } else {
            i++
        }
    }
    return l, r
}

func quickSort(nums []int, l, r int) {
    if l >= r {
        return
    }
    lt, gt := partition(nums, l, r)
    quickSort(nums, l, lt-1)
    quickSort(nums, gt+1, r)
}
// 手写栈递归
func quickSort(nums []int, l, r int) {
    stack := [][2]int{{0, len(nums) - 1}}
    for len(stack) > 0 {
        top := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        l, r := top[0], top[1]
        if l >= r {
            continue
        }
        a, b := partition(nums, l, r)
        stack = append(stack, [2]int{l, a-1})
        stack = append(stack, [2]int{b+1, r})
    }
}
```