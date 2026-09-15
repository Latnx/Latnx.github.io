---
title: context
url: /docs/notes/d-205f3859abe469be/d-f7ccae636d10bb41/d-68099c72ea2c86f8/n-c44123ebaf4dac00/
draft: false
featureimage: img/note-covers/programming-b.webp
images:
  - img/note-covers/programming-b.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: 面试/golang/原理/context.md
---

context 使用场景和用途？
1. context 主要用来在 goroutine 之间传递上下文信息，比如传递请求的trace_id,以便于追踪全局唯一请求​

2. 另一个用处是可以用来做取消控制，通过取消信号和超时时间来控制子goroutine的退出，防止goroutine泄漏​
包括：取消信号、超时时间、截止时间、k-v 等。


