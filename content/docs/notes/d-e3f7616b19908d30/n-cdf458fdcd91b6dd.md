---
title: 017 并查集
url: /docs/notes/d-e3f7616b19908d30/n-cdf458fdcd91b6dd/
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
obsidianSource: LeetCode/017 并查集.md
---

```go
const MAXN = 1000001

var arr [MAXN]int
func build() {
    for i := 0; i < MAXN; i++ {
        arr[i] = i
    }
}

func find(i int) int {
    if arr[i] != i {
        arr[i] = find(arr[i])
    }
    return arr[i]
}

func isSameSet(a, b int) bool {
    return find(a) == find(b)
}

func union(a, b int) {
    arr[find(a)] = find(b)
}
```

