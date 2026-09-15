---
title: 1. 内存区域
url: /docs/notes/d-205f3859abe469be/d-abfc9c2201b07353/d-64f7ab1c4a97853c/n-bb6a8ee5de4216dc/
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
obsidianSource: 面试/Java/JVM/1. 内存区域.md
---

## 1 运行时数据区 {#h-385face3d9f07acd}
### 1.1 程序计数器 {#h-e814d02f9720be0c}

程序计数器可以看作是当前线程所执行的字节码的行号指示器。它通过标示下一条需要执行的字节码指令完成指令切换，可以说一个线程的运行就是在该计数器的不断变化推动下一步一步完成的。
### 1.2 虚拟机栈 {#h-65888226cd1c6085}

虚拟机栈的操作只有两个，就是入栈和出栈。当调用一个新的方法时，就构建一个栈帧压入到栈中，而一个方法执行结束，就会有一个栈帧出栈，整个遵循“先进后出/后进先出”的原则。栈帧中主要存储了局部变量表、操作数栈、动态连接、方法出口等信息
![Pasted image 20260809232750.png](/obsidian/b1ab8d4cc4fd82f4/Pasted%20image%2020260809232750.png)
### 1.3 本地方法栈 {#h-b9222ce2265faeb4}

一个 Native Method 就是一个 Java 调用非 Java 代码的接口。我们知道的 Unsafe 类就有很多本地方法。本地方法栈(Native M ethod Stacks)与虚拟机栈所发挥的作用是非常相似的，其区别只是虚拟机 栈为虚拟机执行Java方法(也就是字节码)服务，而本地方法栈则是为虚拟机使用到的本地(Native) 方法服务。

### 1.4 Java堆 {#h-14c1e88d2fb340af}

Java堆是被所有线程共享的一块内存区域，“几乎”所有的对象实例都在这里分配内存。Java堆也是垃圾收集器管理的内存区域，以G1收集器的出现为分界，往前的收集器基本是采用分代收集理论进行设计，所以“新生代”“老年代”“永久代”“Eden空间”“From Survivor空 间”“To Survivor空间”等概念都是分代设计下的产物，后面会介绍。（​JVM-垃圾收集器与内存分配策略 ），垃圾分代的唯一目的就是优化GC性能。

### 1.5 方法区 {#h-e0e24d9ab22b9340}

方法区(Method Area)与Java堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载 的类信息、常量、静态变量、即时编译器编译后的代码缓存等数据。​

运行时常量池（Runtime Constant Pool）是方法区的一部分。Class 文件中除了有类的版本/字段/方法/接口等描述信息外，还有一项信息是常量池表（Constant Pool Table），用于存放编译期生成的各种字面量和符号引用，这部分内容将在类加载后进入方法区的运行时常量池中存放，JVM 为每个已加载的类型（类或接口）都维护一个运行时常量池，在加载类和接口到虚拟机后创建。

