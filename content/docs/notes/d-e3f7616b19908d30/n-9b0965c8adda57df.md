---
title: 018 洪水填充
url: /docs/notes/d-e3f7616b19908d30/n-9b0965c8adda57df/
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
obsidianSource: LeetCode/018 洪水填充.md
---

```go
func dfs(grid [][]byte, i, j int) {
    if i < 0 || i >= len(grid) || j < 0 || j >= len(grid[0]) || grid[i][j] != '1' {
        return
    }
    grid[i][j] = '2'
    dfs(grid, i-1, j)
    dfs(grid, i, j-1)
    dfs(grid, i+1, j)
    dfs(grid, i, j+1)
}
  
func numIslands(grid [][]byte) int {
    res := 0
    for i := range grid {
        for j := range grid[0] {
            if grid[i][j] == '1' {
                dfs(grid, i, j)
                res++
            }
        }
    }
    return res
}
```