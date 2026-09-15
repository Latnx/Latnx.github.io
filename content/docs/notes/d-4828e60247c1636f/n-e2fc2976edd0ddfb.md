---
title: User
url: /docs/notes/d-4828e60247c1636f/n-e2fc2976edd0ddfb/
draft: false
featureimage: img/note-covers/systems.webp
images:
  - img/note-covers/systems.webp
showDate: false
showDateUpdated: false
showAuthor: false
showHero: true
showReadingTime: false
showWordCount: false
showTableOfContents: true
showEdit: false
obsidianSource: Linux/User.md
---

### useradd {#h-116fdff3ffb2d2f4}
- 在 /etc/passwd 里面创建一行与帐号相关的数据，包括创建 UID/GID/主文件夹等；
- 在 /etc/shadow 里面将此帐号的密码相关参数填入，但是尚未有密码； 
- 在 /etc/group 里面加入一个与帐号名称一模一样的群组名称； 
- 在 /home 下面创建一个与帐号同名的目录作为使用者主文件夹，且权限为 700
### passwd  {#h-fd3f81807e9ad615}
### usermod {#h-98d375dc82bb0eb8}

sudo
visudo
/etc/sudoers
su -