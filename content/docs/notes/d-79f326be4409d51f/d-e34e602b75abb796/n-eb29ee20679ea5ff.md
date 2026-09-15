---
title: 中转站-数据库
url: /docs/notes/d-79f326be4409d51f/d-e34e602b75abb796/n-eb29ee20679ea5ff/
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
obsidianSource: 项目/后端项目/中转站-数据库.md
---

|字段|类型|说明|
|---|---|---|
|id|bigint(20)|主键自增ID|
|msg_id|varchar(256)|消息id，通过uuid生成|
|to|varchar(256)|消息发给谁|
|subject|string|消息主题|
|channel|int(10)|消息类型：1邮件；2短信；3飞书|
|template_id|varchar(256)|模板唯一ID，使用模板时有效|
|template_data|varchar(256)|模板传入参数|
|status|tinyint(3)|状态|
|create_time|datetime|创建时间|
|modify_time|datetime|修改时间|


<img src="/obsidian/3fb159baf5c518e3/Pasted%20image%2020260504001819.png" alt="Pasted image 20260504001819.png" width="493" loading="lazy" style="max-width:100%;height:auto">


使用三张表，模拟高中低三个消息队列，即t_msg_queue_low、t_msg_queue_middle、t_msg_queue_high，对应优先级的消息进入对应的消息队列表，整体思路无非是普通消息进入低优队列，比较重要的消息进入中优队列，十分要紧的消息进入高优，本质就是进入高优的消息会远远少于低优，且高优拥有独立的资源，这个类比下高铁座位应该很好理解。

相比于消息队列，用MySQL做中转，有如下优缺点：​
- 优点1：更少的组件依赖，维护成本低​
- 缺点1：吞吐没有消息队列高，消息创建速度超过5000/s时则不适用​
- 缺点2: 消费者扩展性没有消息队列强，消息队列如Kafka天然分片，可以并发拉取消息，而MySQL则不行，如果做分片和管理对应调度关系，又是非常重的成本。好在大多数情况瓶颈都不在于拉取消息，一般在于第三方能力限制。

