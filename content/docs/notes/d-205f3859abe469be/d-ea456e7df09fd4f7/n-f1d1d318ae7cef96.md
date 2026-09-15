---
title: 架构
url: /docs/notes/d-205f3859abe469be/d-ea456e7df09fd4f7/n-f1d1d318ae7cef96/
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
obsidianSource: 面试/消息队列/架构.md
---

![2653861778727515.jpg](/obsidian/6a25c1baa1153c22/2653861778727515.jpg)
Broker：可以理解为机器或者节点吧，也可以理解为就是运行Kafka程序的服务器。​

Topic：主题是Kafka中的一个核心概念，它是对消息进行分类的一种方式。生产者将消息发送到特定的主题中，而消费者则通过订阅主题来接收相关的消息。但是要注意的是，主题是一个逻辑概念，实际上，一个主题可以被分为多个分区（Partition），以实现消息的并行处理和负载均衡，数据是存储在Partition这个级别的。​

Partition：分区是Kafka中的一个重要概念，它是主题的物理存储单位。每个分区都是一个有序的、不可变的消息序列，可以被独立地读写。分区在物理上对应一个文件夹及文件夹下面的文件，分区的命名规则为主题名称后接“—”连接符，之后再接分区编号，比如TopicA-1就表示主题A得1号分区，每个分区又可以有一至多个副本（Replica），以提高可用性。​

​**同一个Partition里的数据，消息是有序的。即使同一个主题里的消息，如果分布在多个Partition，不同Partition 的消息之间也是无序的**

Consumer Group再平衡，同一个 partition 同时只被一个 consumer 消费
**范围分配，轮询分配，粘性分配，合作粘性分配**，其中合作粘性分配和粘性分配一样都是尽可能减少变动，不同点是合作粘性分配下，未受变动的消费者可以继续消费主题。
1. Range Assignor：基于范围的分配策略，将分区按照范围分配给消费者。​
2. RoundRobin Assignor：基于轮询的分配策略，分区均匀地分配给消费者。​
3. Sticky Assignor：优先保持当前的分配状态，并尽量减少在再平衡过程中的分区移动。​
4. CooperativeStickyAssignor：和Sticky Assignor的策略是基本一样的，区别在于该协议将原来的一次大的全部分区重平衡，改成多次小规模分区重平衡。简单理解就是渐进式重平衡。

**手动提交和自动提交**
```go
for {
	msg, err := reader.FetchMessage(ctx)
	if err != nil {
		panic(err)
	}
	// 业务处理
	fmt.Println(string(msg.Value))
	// 成功后提交
	err = reader.CommitMessages(ctx, msg)
	if err != nil {
		panic(err)
	}
}

for {  
	m, _ := r.ReadMessage(context.Background())  
	fmt.Println(string(m.Value))  
}
```
- Replica：Replica是指Kafka集群中的一个副本，它可以是Leader副本或者Follower副本的一种。每个分区都有多个副本，其中一个是Leader副本，其余的是Follower副本。每个副本都保存了分区的完整数据，以保证数据的可靠性和高可用性。​
 - Leader：Leader是指Kafka集群中的一个分区副本，它负责处理该分区的所有读写请求。Leader副本是唯一可以自主向分区写入数据的副本，它将写入的数据都会同步到所有的Follower副本中，以保证数据的可靠性和一致性。​
- Follower：Follower是指Kafka集群中的一个分区副本，Follower副本不能直接向分区写入数据，它只能从Leader副本中复制数据，并将数据同步到本地的副本中，以保证数据的可靠性和一致性。在Leader副本挂掉的时候，Follower副本有机会被选举为新的leader副本从而保证分区的可用性。
- 数据是直接往Leader写入，写入之后Leader和Follower之间会进行同步，是否要等待同步完成取决于选择哪种写入策略。