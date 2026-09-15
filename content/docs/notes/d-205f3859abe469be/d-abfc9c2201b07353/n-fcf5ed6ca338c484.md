---
title: 序列化
url: /docs/notes/d-205f3859abe469be/d-abfc9c2201b07353/n-fcf5ed6ca338c484/
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
obsidianSource: 面试/Java/序列化.md
---

由于，网络传输的数据必须是二进制数据，但调用方请求的出入参数都是对象。对象是不能直接在网络中传输的，所以需要提前把它转成可传输的二进制，并且要求转换算法是可逆的。

- **序列化（serialize）**：序列化是将对象转换为二进制数据。
- **反序列化（deserialize）**：反序列化是将二进制数据转换为对象。


### JDK序列化 {#h-db8b923125bbe953}

#### [Serializable 接口](https://dunwu.github.io/javacore/pages/2b2f0f/#serializable-%E6%8E%A5%E5%8F%A3) {#h-c2849d3b10cc0d0a}
你的类必须实现 `java.io.Serializable` 接口。这是一个**标记接口**（没有任何方法），只告诉 JVM：“这个对象允许被序列化”。
```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("user.obj"))
oos.writeObject(user)
```

#### 1. 序列化到底保存了什么？ {#h-b1ab4a1d0d941e28}

**它保存的是对象的“状态”（即成员变量的值），而不保存“方法”（代码逻辑）。**

具体流程：

- **序列化时：** 通过反射获取对象的所有非静态、非瞬态（`transient`）字段，将字段名 + 字段值按特定格式写入字节流，同时会写入类的元信息（如类名、`serialVersionUID`）。
- **反序列化时：** JVM 根据字节流中的类名，去加载对应的 `.class` 文件，然后**直接通过内存分配创建对象（不调用构造器！）**，再把字节流中的字段值赋给这个新对象的对应字段。

#### 2. 核心：serialVersionUID（版本号） {#h-51344c2a366577cc}

- JVM 在序列化时会根据类的结构（字段、方法、访问修饰符等）计算出一个哈希值作为 `serialVersionUID`，并写入字节流。
- 反序列化时，JVM 会对比字节流中的 `UID` 和当前加载的类的 `UID`。**如果一致，则允许反序列化；如果不一致，抛出 `InvalidClassException`。**

#### 总结： {#h-d691521ed4ec401b}

JDK 序列化是 Java 内置的对象持久化和传输机制，通过实现 `Serializable` 标记接口，利用 `ObjectOutputStream` 和 `ObjectInputStream` 完成。

它的底层原理是通过反射获取对象的非静态、非瞬态字段，以特定格式写入字节流，并附带类名和 `serialVersionUID`。反序列化时不走构造器，直接分配内存重建对象。

这里有几个关键点需要注意：`static` 和 `transient` 字段不参与序列化；必须显式声明 `serialVersionUID` 避免版本冲突；如果涉及循环引用，JVM 内部有特殊处理机制。如果对默认方式不满意，还可以通过重写 `writeObject` 和 `readObject` 自定义行为。
#### Externalizable 接口 {#h-db8e2a1157619120}

```java
public class Employee implements Externalizable {
    private String name;
    private int salary;

    // 必须有无参构造器（public）
    public Employee() {}

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeUTF(name);      // 手动写
        out.writeInt(salary);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        name = in.readUTF();     // 手动读（顺序必须一致）
        salary = in.readInt();
    }
}
```

### 二进制序列化 {#h-d1ea511daea8b691}

### JSON序列化 {#h-e95fd788ac5f902c}
