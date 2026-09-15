---
title: 重试
url: /docs/notes/d-79f326be4409d51f/d-e34e602b75abb796/n-019acef2a1e1bbc7/
draft: false
featureimage: img/note-covers/backend.webp
images:
  - img/note-covers/backend.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: 项目/后端项目/重试.md
---

快速重试：

异步重试
另一种思路是通过任务队列实现异步重试，避免长时间阻塞主业务线程。简单来说，我们用消息队列的话，就是直接扔到队尾（也就是重新投递进消息队列），这样可以自动重试。

重试是提高成功率的有效手段，在我们的系统中，我们同时启用快速重试+异步重试，快速重试是期待快速解决问题，异步重试是为了能过一段时间再重试。