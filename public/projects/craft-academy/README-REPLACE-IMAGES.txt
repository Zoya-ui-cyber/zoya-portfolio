高清图片替换说明

所有本项目图片按屏幕顺序分类。页眉中的 04 DETAIL CALLOUT 对应第6屏，并非第4屏空间总览。

page-01-hero：首屏前后航拍；p01-before.png 改造前，p01-after.png 改造后。两张图请采用相同构图、视点和宽高比例，建议 1344:650 或同比更高分辨率。代码始终将两张完整图片铺满相同画框，滑块仅裁切可见范围，不会缩放图片。p01-after-original.png 是保留的原工程备用图，不是当前首屏引用。
page-02-context：场地研究；p02-context-research.png 为当前显示图，其余为原工程备用图。
page-03-generation：p03-design-generation.mp4，设计生成视频。
page-04-spatial-overview：p04-main-section.png 为总剖面；8张带 thumbnail 名称的图对应场景入口。
page-05-spatial-scenes：p05-scene-01.png 至 p05-scene-08.png 为8个场景大图。更换时也请同步替换第4屏的同场景缩略图。
page-06-exhibition-details：3张 p06-detail-* 为大样图，统一准备1:1正方形高清PNG；p06-section-perspective.png 为右侧剖透视；p06-location.png 为左下位置图。带 original 的文件为原工程备用图。
page-07-transformation：p07-before-model-01/02.png 为两张既有模型图；p07-exploded-axonometric.png 为拆解轴测；带 original 的图为保留的旧工程备用图。
page-08-model-archive：p08-technical-drawings.png 为左侧图纸；p08-model-01.png 至 p08-model-06.png 为模型照片。03–06目前是灰色占位图，比例534:330，已按1068×660生成。
page-09-end：无图片，是结束与下一个项目的导航页。

每张图的文件名、用途、现有尺寸、占位状态见 IMAGE-REPLACEMENT-GUIDE.csv，可用Excel打开。

替换方法：
1. 将高清图保存为同名 PNG，再替换对应文件。请保留英文文件名、目录和 .png 扩展名，避免仅把JPEG文件的扩展名改成PNG。
2. 灰色占位图直接用同名文件覆盖，无需修改代码。
3. 浏览器按 Ctrl+F5 强制刷新；必要时重启 npm run dev。
4. 如果中英文需要不同版本的图纸，需要额外接入双语图片路径。当前两种语言共用图纸素材，图纸中已经烘焙的文字不会自动翻译。
