---
title: 消息队列
url: /docs/notes/d-79f326be4409d51f/d-e34e602b75abb796/n-ca5ebd88c91eca69/
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
obsidianSource: 项目/后端项目/消息队列.md
---

### 为什么要使用消息队列 {#h-3121af9fa4f2295c}
1. 提高成功率，第三方推送平台不一定稳定，交互过程可能会使得，通过消息中转站可以很方便的实现异步重试，提高成功率
2. 实现流量管控：削峰
3. 能够更好的协调资源，让重要消息优先享受服务

### 消息队列的作用 {#h-16257d18d309fb30}

#### 异步 {#h-59ff6c0c0dd3673a}
#### 消息分发 {#h-8e9e1164e48e6416}
#### 削峰 {#h-b0248c9b14ec851b}

### 为什么要用Kafka {#h-4ceecdc3e3b2c052}
1. 从性能上讲，RocketMQ、Kafka达到10万级，相比其它万级消息队列会更高一些，当然对于我们而言万级也够用，因为实际瓶颈在第三方推送；​
2. 作为消息推送中台，还是希望数据是可靠的，所以从可用性而言，RocketMQ、Kafka更符合我们的需求，因为它们都是分布式的；​
3. 从主题数目而言，RabbitMQ、RocketMQ在大量topic下具备一些优势，但Kafka也支持上百个topic，在消息推送场景都能满足需要。

主要还是看团队的技术栈，这里我们因为熟悉程度选用了Kafka，如果面试问到，可以说之前团队，普遍都是用Kafka，已有完整的实践和运维经验，故而使用Kafka。
