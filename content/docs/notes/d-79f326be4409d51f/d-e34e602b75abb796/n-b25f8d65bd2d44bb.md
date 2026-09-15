---
title: 定时推送
url: /docs/notes/d-79f326be4409d51f/d-e34e602b75abb796/n-b25f8d65bd2d44bb/
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
obsidianSource: 项目/后端项目/定时推送.md
---

![Pasted image 20260504172720.png](/obsidian/f7c60b655687fce7/Pasted%20image%2020260504172720.png)
核心思路：​
1. 定时临时缓冲区：预设一个定时消息临时缓冲区，所有定时消息先在临时缓冲区暂存，做定时处理。等定时缓冲区的消息到点之后再捞出。​
2. 到点消息变为普通消息：捞出的【到点消息】将其变为一条【普通消息】，进行后续推送流程。此流程与直接推送普通消息一致。

|字段|类型|约束/默认值|说明|
|---|---|---|---|
|id|bigint(20)|主键，自增|ID|
|msg_id|varchar(256)|非空，唯一索引（idx_msgid）|消息ID|
|req|varchar(4096)|非空|请求内容|
|send_timestamp|bigint(10)||定时发送时间|
|status|int(10)||状态|
|create_time|datetime|非空，默认 CURRENT_TIMESTAMP|创建时间|
|modify_time|datetime|非空，默认 CURRENT_TIMESTAMP，更新时自动刷新|修改时间|

### Redis选型设计 {#h-04aae16e450eb053}
存储介质选型上选择使用 Redis ZSet，以定时任务执行时间为 Score 进行有序结构的搭建，当定时任务数量达到一定量级时，ZSet 底层基于跳表作为有序表的实现. 一些更细致的实现流程如下：​

（1）以 Redis ZSet 作为存储介质；​
（2）每次添加定时任务时，执行 ZAdd 动作，以执行时间的【时间戳】为排序的键(Score) 进行有序结构的搭建；同时元素的值我们也用时间戳，这样保证同一时间点只会存储一份信息。

