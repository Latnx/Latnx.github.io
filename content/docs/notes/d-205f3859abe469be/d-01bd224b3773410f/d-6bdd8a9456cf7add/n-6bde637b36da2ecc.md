---
title: 5 锁
url: /docs/notes/d-205f3859abe469be/d-01bd224b3773410f/d-6bdd8a9456cf7add/n-6bde637b36da2ecc/
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
obsidianSource: 面试/数据库/MySQL/5 锁.md
---

## 全局锁 {#h-6fb25f34060aeae2}

全局锁主要应用于做全库逻辑备份，这样在备份数据库期间，不会因为数据或表结构的更新，而出现备份文件的数据与预期的不一样。
数据库一致性备份
## 表级锁 {#h-c5d93a7c62cd2b44}

**表锁**：
	1. 表共享读锁
	2. 表独占写锁

**元数据锁**（MDL）：MDL 是为了保证当用户对表执行 CRUD 操作时，防止其他线程对这个表结构做了变更。
	1. 对一张表进行 CRUD 操作时，加的是 MDL 读锁；
	2. 对一张表做结构变更操作的时候，加的是 MDL 写锁；
 
**意向锁**：意向共享锁和意向独占锁是表级锁，不会和行级的共享锁和独占锁发生冲突，而且意向锁之间也不会发生冲突，只会和共享表锁（lock tables ... read）和独占表锁（lock tables ... write）发生冲突。
	1. 在使用 InnoDB 引擎的表里对某些记录加上「共享锁」之前，需要先在表级别加上一个「意向共享锁」；
	2. 在使用 InnoDB 引擎的表里对某些纪录加上「独占锁」之前，需要先在表级别加上一个「意向独占锁」；

**AUTO-INC 锁**

## 行级锁 {#h-d37b9404272dd317}

共享锁，排他锁

Record Lock，记录锁，也就是仅仅把一条记录锁上，RC，RR，RR
Gap Lock，间隙锁，锁定一个范围，但是不包含记录本身
Next-Key Lock：Record Lock + Gap Lock 的组合，锁定一个范围，并且锁定记录本身，RR

