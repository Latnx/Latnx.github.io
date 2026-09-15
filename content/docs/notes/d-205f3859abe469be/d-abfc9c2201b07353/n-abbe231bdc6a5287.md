---
title: 数据类型包装类
url: /docs/notes/d-205f3859abe469be/d-abfc9c2201b07353/n-abbe231bdc6a5287/
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
obsidianSource: 面试/Java/数据类型包装类.md
---

所有的包装类 **Integer、Long、Byte、Double、Float、Short** 都是抽象类 Number 的子类。

| 类名           | 对应基本类型        | 描述             |
| ------------ | ------------- | -------------- |
| Byte         | byte          | 字节型包装类         |
| Short        | short         | 短整型包装类         |
| Integer      | int           | 整型包装类          |
| Long         | long          | 长整型包装类         |
| Float        | float         | 单精度浮点型包装类      |
| Double       | double        | 双精度浮点型包装类      |
| BigInteger   | -             | 不可变任意精度整数      |
| BigDecimal   | -             | 不可变任意精度有符号十进制数 |
| String       |               |                |
| StringBuffer | StringBuilder |                |
## String {#h-587eb0985f018297}

String 创建的字符串存储在公共池中，而 new 创建的字符串对象在堆上：
```java
String s1 = "Runoob";              // String 直接创建
String s2 = "Runoob";              // String 直接创建
String s3 = s1;                    // 相同引用
String s4 = new String("Runoob");   // String 对象创建
String s5 = new String("Runoob");   // String 对象创建
```

![Pasted image 20260802212207.png](/obsidian/cbc0a1c4cbab391c/Pasted%20image%2020260802212207.png)

### StringBuilder和StringBuffer {#h-a7b9895be04ffd13}
StringBuilder 类在 Java 5 中被提出，它和 StringBuffer 之间的最大不同在于 StringBuilder 的方法不是线程安全的（不能同步访问）。

由于 StringBuilder 相较于 StringBuffer 有速度优势，所以多数情况下建议使用 StringBuilder 类。

