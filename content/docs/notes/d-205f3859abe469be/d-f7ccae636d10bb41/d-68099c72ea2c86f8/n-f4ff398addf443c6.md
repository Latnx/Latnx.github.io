---
title: GC
url: /docs/notes/d-205f3859abe469be/d-f7ccae636d10bb41/d-68099c72ea2c86f8/n-f4ff398addf443c6/
draft: false
featureimage: img/note-covers/programming-a.webp
images:
  - img/note-covers/programming-a.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: 面试/golang/原理/GC.md
---

### V1.3及之前：标记清除算法​ {#h-9f6c2b933e62d86a}

完整的标记清除算法需要在进行GC前进行STW，即暂停整个用户程序。这样的话，性能必然很低，很难有人可以接受这种性能损耗

### V1.5：三色并发标记法​ {#h-c3616167f7f25254}

白色：未被垃圾收集器访问到的对象，也就是潜在的垃圾对象。在回收开始阶段 ，所有对象都标记为白色；在回收结束后，所有白色对象均不可达，其内存将被释放​
灰色：已被垃圾收集器访问到的对象，但是垃圾收集器需要继续扫描它们的子对象，因为其可能存在指向白色对象的外部指针​
黑色：已被垃圾收集器访问到的对象，且其引用都已被扫描到，黑色对象中任何一个指针都不可能直接指向白色对象

发生错误：
- 一个白色对象被黑色对象引用(白色对象被挂在黑色对象下)​
- 灰色对象与它之间的可达关系的白色对象遭到破坏(灰色对象同时丢失了该白色对象的引用)

屏障技术：
**强三色不变性**：不存在黑色对象引用到白色对象的指针，即黑色对象不会指向白色对象，只会指向灰色对象或黑色对象
**弱三色不变性**：所有被黑色对象引用的白色对象都处于灰色对象的保护状态，黑色对象可以指向的白色对象，但是必须包含一条从灰色对象到这个白色对象的可达路径

1. 插入写屏障（Dijistra Insertion Barrier）​：作用在堆上，栈上仍然是stw
由于指针修改时，指向的新对象要被强制标灰，所以插入写屏障满足强三色不变式，不存在黑色对象引用白色对象的情况了， 因为白色会强制变成灰色
2. 删除写屏障（Yuasa Deletion Barrier）：go未使用


### V1.8：混合写屏障机制 {#h-4a744482b749cbfc}
