---
title: 03 持久化
url: /docs/notes/d-205f3859abe469be/d-01bd224b3773410f/d-7cf3b59b7dee5a40/n-0504e66dcc10cdbd/
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
obsidianSource: 面试/数据库/Redis/03 持久化.md
---

### 1. RDB 快照 {#h-de278c38a36d6110}

RDB（Redis Database Backup），记录Redis某个时刻的全部数据，这种方式本质就是二进制形式数据快照，直接保存二进制数据到磁盘，后续通过加载RDB文件恢复数据。

**触发时机**
- RDB可以通过配置定时触发，触发时用的是后台持久化方式。​
- 也可以save命令，bgsave命令主动触发，save底层用的是阻塞式持久化，bgsave用的是后台持久化。​
- 最后，如果Redis正常关闭，是会执行阻塞式持久化的。
**流程**
	首先，Fork出一个子进程来专门做RDB持久化​
	接着，子进程写数据到临时的RDB文件​
	最后，用新RDB文件替换旧的RDB文件
**写时复制**
1. 复制页表，但指向同一空间
2. 若主线程修改，物理内存就会被复制一份（键值对 A'），然后主线程在这个数据副本（键值对 A'）进行修改操作

**混合持久化**
当开启了混合持久化时，在 AOF 重写日志时，fork 出来的重写子进程会先将与主线程共享的内存数据以 RDB 方式写入到 AOF 文件，然后主线程处理的操作命令会被记录在重写缓冲区里，重写缓冲区里的增量命令会以 AOF 方式写入到 AOF 文件，写入完成后通知主进程将新的含有 RDB 格式和 AOF 格式的 AOF 文件替换旧的的 AOF 文件。


### 2. AOF 日志 {#h-8c8d98c7353e569d}
AOF（Append Only File），记录执行的每条命令，重启之后通过重放命令来恢复数据，AOF本质是记录操作日志，后续通过日志重放恢复数据。

先执行后写日志，
好处：避免检查开销、不阻塞命令
风险：日志丢失、阻塞下一个命令

流程
1. 写入server.aof_buf 缓冲区
2. write() 系统调用，拷贝到page cache
3. 写入磁盘

写磁盘策略
Redis 提供了三种将 **AOF 日志写回硬盘的策略**，分别是 Always、Everysec 和 No，这三种策略在可靠性上是从高到低，而在性能上则是从低到高。

**重写机制**
- 随着执行的命令越多，AOF 文件的体积自然也会越来越大，为了避免日志文件过大， Redis 提供了 **AOF 重写机制**，它会直接扫描数据中所有的键值对数据，然后为每一个键值对生成一条写操作命令，接着将该命令写入到新的 AOF 文件，重写完成后，就替换掉现有的 AOF 日志。重写的过程是由后台子进程完成的，这样可以使得主进程可以继续正常处理命令。
- 重写流程：一次拷贝，两处缓冲
	- fork子进程
	- 写入AOF缓冲 和 AOF 重写缓冲; AOF缓冲用于保证 此时发生宕机，原来的AOF日志也是完整的，可用于恢复。 AOF重写缓冲 用于保证 新的AOF文件 也不会丢失 最新的写入操作。
### 区别 {#h-188781e516655d43}

体积方面：相同数据量下，RDB体积更小，因为RDB是记录的二进制紧凑型数据​
恢复速度：RDB是数据快照，可以直接加载，而AOF文件恢复，相当于重放情况，RDB显然会更快​
数据完整性：AOF记录了每条日志，RDB是间隔一段时间记录一次，用AOF恢复数据通常会更为完整。