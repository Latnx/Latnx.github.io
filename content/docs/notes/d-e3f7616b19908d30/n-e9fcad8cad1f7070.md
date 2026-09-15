---
title: 019 建图 拓扑排序
url: /docs/notes/d-e3f7616b19908d30/n-e9fcad8cad1f7070/
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
obsidianSource: LeetCode/019 建图 拓扑排序.md
---

```go
  
func findOrder(numCourses int, prerequisites [][]int) []int {
    // 建图
    adj := make([][]int, numCourses)
    for i := range numCourses {
        adj[i] = make([]int, 0)
    }
    for i := range prerequisites {
        adj[prerequisites[i][1]] = append(adj[prerequisites[i][1]], prerequisites[i][0])
    }
    
    // 添加入度
    indegree := make([]int, numCourses)
    for i := range adj {
        for j := range adj[i] {
            indegree[adj[i][j]]++
        }
    }

    // 反复寻找入度为零的点
    queue := make([]int, numCourses)
    l, r := 0, 0
    for i := range indegree {
        if indegree[i] == 0 {
            queue[r] = i
            r++
        }
    }

    for l < r {
        for i := range adj[queue[l]] {
            indegree[adj[queue[l]][i]]--
            if indegree[adj[queue[l]][i]] == 0 {
                queue[r] = adj[queue[l]][i]
                r++
            }
        }
        l++
    }
    if r != numCourses {
        return []int{}
    }
    return queue
}
```