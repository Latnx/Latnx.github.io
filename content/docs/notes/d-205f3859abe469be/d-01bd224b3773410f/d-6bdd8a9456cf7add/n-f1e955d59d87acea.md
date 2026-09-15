---
title: 4 事务
url: /docs/notes/d-205f3859abe469be/d-01bd224b3773410f/d-6bdd8a9456cf7add/n-f1e955d59d87acea/
draft: false
featureimage: img/note-covers/data-b.webp
images:
  - img/note-covers/data-b.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: 面试/数据库/MySQL/4 事务.md
---

## 事务四大特性 ACID {#h-f394263d5c46a74a}

1. **原子性**（Atomicity）：一个事务中的所有操作，要么全部完成，要么全部不完成。
2. **一致性**（Consistency）：是指事务操作前和操作后，数据库保持一致性状态。
3. **隔离性**（Isolation）：有若干并发事务，事务在不受外部并发操作的影响下的独立环境运行的。
4. **持久性**（Durability）：事务处理结束后，对数据的修改就是永久的。

	1. 持久性是通过 redo log （重做日志）来保证的；
	2. 原子性是通过 undo log（回滚日志） 来保证的；
	3. 隔离性是通过 MVCC（多版本并发控制，使用了undolog） 和锁机制来保证的；
	4. 一致性则是通过持久性+原子性+隔离性来保证；

