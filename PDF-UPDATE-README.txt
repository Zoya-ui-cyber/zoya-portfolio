Project 2–6 PDF Portfolio 更新包

请先备份当前项目。此包是增量更新，不要删除原 src 和 public。
将压缩包中的 src、public、scripts 文件夹及 package.json 复制到现有 zoya-portfolio 项目根目录，合并文件夹，替换同名文件。
不要把 src/public 整个删掉再复制。本包不包含 Project 1 的文件。

依赖未改变，原项目已安装依赖时直接运行 npm run dev。
新环境需先 npm ci，再 npm run dev。
浏览器打开 http://localhost:3000。

修改文件：
src/app/projects/[slug]/page.tsx：在原 Project 1 分支之后增加 PDF 模式分支。
src/content/projects.ts：仅为 Project 2–6 增加 mode 与 pages，保留原 slug、标题和顺序。
src/types/project.ts：新增可选 mode、pages 类型。
src/components/project/PdfPortfolioProject.tsx：可复用 PDF 展示组件。
src/components/project/pdf-portfolio.module.css：PDF 页面独立样式。
package.json、scripts/dev.mjs：兼容预览参数，仍使用原 Next.js dev，依赖和 build 命令不变。

资源：public/projects/{xinhua-road,whale-pier,zhejiang-museum,bamboo,seen-light}/pdf/page-XX.webp。
Project 2/3/4 各4页，Project 5/6 各1页，共14页；全部3000×2122，无损WebP。
PDF-PAGES.json 记录原PDF名称、内部页号及对应图片路径。
保留原图比例，不裁切、不变形，页间距为0。第一页优先，后续lazy loading。
图片内部文字保持原PDF内容，不随中英文按钮翻译；网页导航语言保留。

验证：生产构建、TypeScript检查通过。五个项目路由及Next Project衔接逐一检查。
桌面1363px和手机320px宽度的浏览器布局核对通过，无横向溢出、首图在48px导航下、无额外页间隙。
Project 1 专属组件/图片、globals.css、首页与Directory源文件未编辑且不包含在此增量包中。

未来定制：为相应项目设置 mode: "custom"，添加独立定制组件分支；无需改动Project 1。
