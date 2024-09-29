Markdown具有良好的可读性和跨平台兼容性，不仅适合编写者阅读，也便于自动转换为 HTML 等格式。风格指南（Style Guide）帮助确保文档结构的一致性、清晰度和可维护性，特别是在多人协作项目中尤为重要。

```table-of-contents
```
## 文档结构

经典结构：
```
# Document Title

Short introduction.

[TOC]

## Topic

Content.

## See also

* https://link-to-more-info
```

1. `# Document Title` ：使用一级标题， 应该与文件名相同。
2. `author`： _可选_
3. `Short introduction.`：一到三句话来高度概括主题。
4. `[TOC]`：目录，内容的目录
5. `## Topic`：其余标题从二级开始
6. `## See also`: 将其他链接放在底部，供想了解更多信息或没有找到所需信息的用户使用。

## 内容目录

一页不能展示下就使用目录

### [TOC]直接放在简介的后面

将[TOC]指令放在页面介绍之后，第一个H2标题之前。例如:

```
# My Page

This is my introduction **before** the TOC.

[TOC]

## My first H2
```

```
# My Page

[TOC]

This is my introduction **after** the TOC where it should not be.

## My first H2
```

## 段落

段落后面使用一个空行来表示重新开始一个段落。

## 标题
不使用 `=` or `-` 来生成标题

### 使用唯一且完整的标题名称

为每个标题使用唯一且完全的名称（包括子标题）。由于链接锚是根据标题构建的，这有助于确保自动构建的锚链接直观且清晰。
For example, instead of:

```
## Foo
### Summary
### Example
## Bar
### Summary
### Example
```

prefer:

```
## Foo
### Foo summary
### Foo example
## Bar
### Bar summary
### Bar example
```

### 标题前后加空行

标题前后加空行:

```
...text before.

## Heading 2

Text after...
```

缺少间距使阅读源代码十分困难:

```
...text before.

##Heading 2
Text after... DO NOT DO THIS.
```

### 只使用一次H1标题

使用一个H1标题作为文档的标题。随后的标题应该是H2等。

## 列表

### 使用 lazy numbering

对于可能发生变化的较长列表，尤其是较长的嵌套列表，使用“lazy” numbering:

```
1.  Foo.
1.  Bar.
    1.  Foofoo.
    1.  Barbar.
1.  Baz.
```

但是，如果列表很小，并且您不打算更改它，那么最好使用完全编号的列表，这样阅读源码会很方便:

```
1.  Foo.
2.  Bar.
3.  Baz.
```

### 嵌套列表的缩进

嵌套列表时，列表都使用4个空格的缩进:
```
1.  在有序列表后使用2个空格，因此文本缩进4个空格。
    对换行文本使用4个空格的缩进。
2.  下一项再次使用2个空格。

*   在无序列表后使用3个空格，因此文本本身缩进4个空格。
    对换行文本使用4个空格的缩进。
    1.  在有序列表后使用2个空格
        对换行文本使用8个空格的缩进。
    2.  Looks nice, doesn't it?
*   回到项目符号列表，缩进3个空格。
```

1.  在有序列表后使用2个空格，因此文本缩进4个空格。
	对换行文本使用4个空格的缩进。
1.  下一项再次使用2个空格。

- 在无序列表后使用3个空格，因此文本本身缩进4个空格。
		对换行文本使用4个空格的缩进。
	1. 在有序列表后使用2个空格
		对换行文本使用8个空格的缩进。
	1. Looks nice, doesn't it?
- 回到项目符号列表，缩进3个空格。

## 代码

### Inline[](https://google.github.io/styleguide/docguide/style.html#inline)

短代码引用和字段名称使用 `inline`  表示例如：
- You'll want to run `really_cool_script.sh arg`.
- Pay attention to the `foo_bar_whammy` field in that table.

在提到文件类型时，以一般性的方式使用**行内代码**，而不是特指某个具体的文件。
- **一般文件类型**：`README.md`、`config.yaml`、`main.py` 等，这里使用行内代码来表示某种文件类型，而不是指某个实际存在的文件。
    
- **具体文件**：如果你指的是某个具体文件，例如项目中的特定 `README.md` 文件，那时就不需要使用行内代码，因为这时你讨论的是实际存在的文件，而不是一种泛指的文件类型。

### 使用代码片段来转义

当你不希望文本被作为普通 Markdown 处理时（例如假路径或示例 URL，可能导致错误的自动链接），可以用反引号（`）将其包裹起来。

例如：

- 一个 Markdown 的假路径示例：`Markdown/foo/Markdown/bar.md`  
    使用反引号后，路径不会被解释为链接。
- 一个查询 URL 示例：`https://www.google.com/search?q=$TERM`  

### 代码块

对于超过一行的代码引用，使用围栏式代码块来包裹代码：

```python
def Foo(self, bar):
	self.bar = bar
```

在 Markdown 中，使用三个反引号可以创建一个代码块，适用于长代码段。你还可以在反引号后面指定编程语言（如 `python`），以便启用语法高亮。

## 链接

### **使用显式路径**

对于 Markdown 文件中的链接，建议使用显式路径。从项目的根目录开始，表示的是文件在项目内部的具体位置。
例如：

- **正确的方式**：`[...](/path/to/other/markdown/page.md)`
- **错误的方式**：`[...](https://bad-full-url.example.com/path/to/other/markdown/page.md)`

没有必要使用完整的 URL，只需指向具体路径即可。

### **避免使用相对路径**

相对路径在同一目录中使用时是安全的，例如：

- `[...](/path/to/another/dir/other-page.md)`
- `[...] (other-page-in-same-dir.md)`

但是，如果需要引用其他目录，尽量避免使用 `../` 的形式，因为这样会增加路径的复杂性：

- **避免**：`[...] (../../bad/path/to/another/dir/other-page.md)`

### **使用有意义的 Markdown 链接标题**

Markdown 的链接语法允许设置链接标题，应该合理利用这一点。因为很多用户不会逐字阅读文档，而是快速扫描，链接标题可以吸引他们的注意力。

不要使用类似“here”或“link”这种无意义的标题，这无法为读者提供有用的信息。比如：

- **不要这样做**：
    
    - [link](markdown.md)
    - [here](/styleguide/docguide/style.html)

## 图片

**适度使用图片，并优先选择简单的截图**  

纯文本可以让用户更快地进入交流的核心内容，减少读者的分心和作者的拖延。然而，在某些情况下，确实非常有帮助能用图片展示所要表达的内容。

**何时使用图片**

- **图片的作用**：当用图片比用文字更容易向读者传达信息时，可以使用图片。例如，解释如何操作用户界面时，使用图片往往比文字说明更直观。
    
- **适当的图片描述**：为图片提供合适的描述文本非常重要，特别是为那些无法看到图片的读者。他们依赖文本来理解内容，因此，确保图片的内容和目的通过描述清晰传达。

## 表格

使用表格的情况：在需要快速浏览数据时使用表格，在能使用list展示数据时，就不要使用表格。

- 相对均匀的二维数据分布。 
- 许多具有不同属性的平行项目。 


例如:

DO NOT DO THIS

Fruit  | Metrics      | Grows on | Acute curvature    | Attributes                                                                                                  | Notes
------ | ------------ | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------
Apple  | Very popular | Trees    |                    | [Juicy](http://cs/SomeReallyReallyReallyReallyReallyReallyReallyReallyLongQuery), Firm, Sweet               | Apples keep doctors away.
Banana | Very popular | Trees    | 16 degrees average | [Convenient](http://cs/SomeDifferentReallyReallyReallyReallyReallyReallyReallyReallyLongQuery), Soft, Sweet | Contrary to popular belief, most apes prefer mangoes. Don't you? See the [design doc][banana_v2] for the newest hotness in bananiels.

表格存在几个问题:

- **分布不佳**：如果表格中的某些列在不同行之间没有差异，或者有些单元格是空的，通常说明这些数据不适合用表格展示。表格的有效性在于清晰呈现数据，缺乏变化或空白的单元格可能使表格难以阅读和理解。
    
- **维度不平衡**：当表格的列数明显多于行数，或者反之，表格可能变得像是一种不灵活的文本格式。维度的极度不平衡会削弱表格的作用，降低其在数据展示中的效果。
    
- **冗长的文字**：如果表格中的某些单元格包含了过多的文字，表格就无法做到一目了然。表格的核心价值在于简明扼要地传递信息，过多的文字会影响其简洁性和可读性。


## 相关链接
[谷歌styleguide](https://google.github.io/styleguide/docguide/style.html#table-of-contents)