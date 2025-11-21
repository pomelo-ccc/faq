
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initial Mock Data (The 50+ items moved from Frontend)
let FAQS = [
    // --- Existing 5 ---
    {
      id: 'form-async-validation',
      title: '[Form] 异步校验失败后仍可提交表单',
      component: 'Form',
      version: '1.2.x',
      tags: ['校验', '异步', '表单提交'],
      errorCode: 'ASYNC_VALIDATE_FAIL',
      summary: '异步验证器返回错误状态后，提交按钮未被禁用，用户仍可提交错误数据。',
      phenomenon: '复现步骤：\n1. 创建一个带有异步验证器（如检查用户名唯一性）的表单字段。\n2. 输入触发验证错误的值。\n3. 错误信息显示，但提交按钮仍然可用。\n4. 点击提交，无效数据被发送。',
      solution: '根本原因通常是验证器状态更新处理不当。修复方法是结合 `asyncValidators` 使用 `updateValueAndValidity()` 方法，并根据表单整体的 `status` 属性（PENDING/VALID/INVALID）来控制提交按钮的禁用状态，而不仅仅是检查 `valid` 属性。',
      troubleshootingFlow: `graph TD; A[开始] --> B{表单提交?}; B --> C{表单状态是 PENDING?}; C -- 是 --> D[禁用提交按钮]; D --> E{等待异步校验完成}; E --> F{表单状态是 VALID?}; F -- 是 --> G[启用按钮 & 允许提交]; F -- 否 --> H[保持禁用, 显示错误]; C -- 否 --> F;`,
      validationMethod: '验证异步校验失败后，提交按钮变为禁用状态，直到字段值修正并通过校验。',
      views: 128,
      solveTimeMinutes: 10,
    },
    {
      id: 'form-dynamic-fields',
      title: '[Form] 动态添加字段后值不同步',
      component: 'Form',
      version: '1.3.x',
      tags: ['动态表单', 'FormArray', '数据绑定'],
      summary: '向 FormArray 动态添加控件时，其初始值未反映在父表单的 value 对象中。',
      phenomenon: '1. 创建带有 FormArray 的表单。\n2. 点击按钮动态 push 一个新的 FormGroup。\n3. 检查父表单的 `value` 属性，发现新添加的部分缺失。',
      solution: '通常是因为新控件未正确注册。创建新 FormGroup/FormControl 时，确保立即将其 push 到 FormArray。之后调用 `markAsDirty()` 或 `updateValueAndValidity()` 触发变更检测。',
      troubleshootingFlow: `graph TD; A[点击添加按钮] --> B[创建新 FormGroup]; B --> C{Push 到 FormArray?}; C -- 是 --> D[检查父级 form.value]; D --> E{新字段值是否存在?}; E -- 是 --> F[成功]; E -- 否 --> G[调用 FormArray.updateValueAndValidity()]; G --> D;`,
      validationMethod: '点击“添加字段”后，控制台打印 `form.value`，应包含新字段及其默认值。',
      views: 245,
      solveTimeMinutes: 5,
    },
    {
      id: 'table-pagination-data',
      title: '[Table] 切换分页后数据未更新',
      component: 'Table',
      version: '1.0.x',
      tags: ['分页', '状态管理', 'API'],
      errorCode: 'PAGINATION_NO_REFRESH',
      summary: '点击表格分页控件的页码，数据停留在第一页，未获取新数据。',
      phenomenon: '1. 加载多页数据的表格。\n2. 点击“第2页”或“下一页”。\n3. 分页器状态变了，但表格内容没变。',
      solution: '组件未在页码变更时重新请求数据。需要在分页事件处理函数（`pageChange`）中调用 API，并更新数据源 Signal 或 Observable。',
      troubleshootingFlow: `graph TD; A[点击页码] --> B[触发 Pagination 事件]; B --> C{是否有事件处理函数?}; C -- 是 --> D{是否调用带新页码的 API?}; D -- 是 --> E{数据源是否更新?}; E -- 否 --> F[在 API 回调中更新数据源]; E -- 是 --> G[成功];`,
      validationMethod: '切换不同页码，表格行内容应随之变化，网络请求参数中 page 字段应正确变化。',
      views: 412,
      solveTimeMinutes: 5,
    },
    {
      id: 'project-build-fail',
      title: '[Project] 依赖冲突导致构建失败',
      component: 'Project',
      version: 'N/A',
      tags: ['构建', '依赖', 'npm'],
      summary: 'CI/CD 流水线报错 "Peer dependency missing" 或版本不兼容。',
      phenomenon: '本地 `npm install` 成功，但推送到 GitLab CI 后构建失败，提示某些包版本不匹配。',
      solution: '通常是因为 `package-lock.json` 未提交或本地使用了 `--legacy-peer-deps`。强制统一依赖版本，检查 `package.json` 中的 override 配置，并确保 lock 文件已提交。',
      troubleshootingFlow: `graph TD; A[构建失败] --> B{本地能否构建?}; B -- 是 --> C[检查 package-lock.json 是否提交]; C -- 未提交 --> D[提交 lock 文件]; C -- 已提交 --> E[检查 Node 版本一致性]; B -- 否 --> F[删除 node_modules 重装];`,
      validationMethod: '在全新的环境中执行 `npm ci` 能够成功安装依赖并运行 `npm run build`。',
      views: 89,
      solveTimeMinutes: 30,
    },
    {
      id: 'backend-500-timeout',
      title: '[Backend] 大数据量导出导致 504 Gateway Timeout',
      component: 'Backend',
      version: '2.1.0',
      tags: ['性能', '超时', '导出'],
      errorCode: 'HTTP_504',
      summary: '用户导出超过 10000 条数据时，接口请求超时，前端报 504 错误。',
      phenomenon: '点击导出按钮，Loading 转圈约 60秒后，提示“网关超时”。',
      solution: '同步导出接口处理时间过长。应改为“异步任务模式”：点击导出 -> 后端创建任务返回 TaskID -> 前端轮询任务状态 -> 任务完成显示下载链接。或者优化 SQL 查询与流式输出。',
      troubleshootingFlow: `graph TD; A[发起导出] --> B[后端处理数据]; B --> C{处理时间 > Nginx超时?}; C -- 是 --> D[返回 504]; D --> E[方案: 改为异步任务队列]; C -- 否 --> F[正常返回文件流];`,
      validationMethod: '导出 20000 条数据，前端立即收到“任务已创建”提示，可在任务中心下载文件，无超时报错。',
      views: 560,
      solveTimeMinutes: 120,
    },
    // --- NEW ITEMS (45+) ---
    // --- Form Module ---
    {
      id: 'form-cva-initial-value',
      title: '[Form] Custom ControlValueAccessor 初始值不显示',
      component: 'Form',
      version: '1.0.0',
      tags: ['CVA', '自定义组件', 'ngModel'],
      summary: '自定义表单组件在页面加载时未显示绑定的初始值。',
      phenomenon: '组件实现了 CVA 接口，使用 formControlName 绑定了初始值 "abc"，但 Input 框显示为空。',
      solution: '检查 `writeValue` 方法。该方法在初始化时会被调用，必须在其中将传入的 value 赋值给内部 DOM 或状态变量。',
      troubleshootingFlow: `graph TD; A[Init] --> B{调用 writeValue?}; B -- 是 --> C[检查 value 是否赋值给 DOM]; C -- 否 --> D[修正 writeValue 逻辑]; B -- 否 --> E[检查 Provider 注册];`,
      validationMethod: '刷新页面，输入框应直接显示 "abc"。',
      views: 85,
      solveTimeMinutes: 15
    },
    {
      id: 'form-disable-valuechanges',
      title: '[Form] disable() 后 valueChanges 未触发',
      component: 'Form',
      version: 'ALL',
      tags: ['ReactiveForms', 'RxJS'],
      summary: '调用 control.disable() 后，订阅的 valueChanges 没有收到通知。',
      phenomenon: '代码中监听了 valueChanges，调用 disable() 期望收到 null 或 undefined，但什么都没发生。',
      solution: '`disable()` 默认会触发 valueChanges，但如果你在调用时传入了 `{emitEvent: false}` 则不会。另外，disabled 的控件不会出现在 `form.value` 中，除非使用 `form.getRawValue()`。',
      troubleshootingFlow: `graph TD; A[control.disable()] --> B{emitEvent: false?}; B -- 是 --> C[不触发]; B -- 否 --> D[触发 valueChanges]; D --> E[检查 Subscription 是否存活];`,
      validationMethod: '调用 disable()，控制台应打印出 valueChanges 事件。',
      views: 92,
      solveTimeMinutes: 10
    },
    {
      id: 'form-mat-select-compare',
      title: '[Form] MatSelect 对象绑定回显失败',
      component: 'Form',
      version: 'Material',
      tags: ['Select', '对象绑定', '回显'],
      summary: 'Select 绑定对象数组，设置了正确的值却无法自动选中对应选项。',
      phenomenon: 'Options 是 `[{id:1, name:"A"}]`，Control 值是 `{id:1, name:"A"}`，但下拉框显示空白。',
      solution: 'Angular 默认比较对象引用。必须提供 `compareWith` 函数，告诉 Select 如何比较两个对象（例如比较 id）。',
      troubleshootingFlow: `graph TD; A[绑定对象值] --> B{是否设置 compareWith?}; B -- 否 --> C[默认引用比较 -> 失败]; B -- 是 --> D[比较函数是否正确?]; D -- 是 --> E[回显成功];`,
      validationMethod: '添加 compareWith input 后，下拉框正确显示 "A"。',
      views: 310,
      solveTimeMinutes: 5
    },
    {
      id: 'form-autofill-bg',
      title: '[Form] 浏览器自动填充背景色无法去除',
      component: 'Form',
      version: 'CSS',
      tags: ['CSS', 'Autofill', 'Chrome'],
      summary: 'Chrome 自动填充密码后，输入框背景变成淡黄色，无法通过 background-color 覆盖。',
      phenomenon: '登录页记住密码后，Input 框变黄，破坏 UI 设计。',
      solution: '使用 CSS `box-shadow` 覆盖内阴影：`input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #fff inset; }`。',
      troubleshootingFlow: `graph TD; A[自动填充变黄] --> B[尝试 background-color]; B --> C[无效]; C --> D[使用 box-shadow inset 覆盖];`,
      validationMethod: '自动填充后输入框背景色保持设计原样。',
      views: 505,
      solveTimeMinutes: 20
    },
    {
      id: 'form-input-number-e',
      title: '[Form] input type=number 允许输入 "e"',
      component: 'Form',
      version: 'HTML5',
      tags: ['Input', 'Validation'],
      summary: '数字输入框期望只输入纯数字，但用户可以输入科学计数法 "e"。',
      phenomenon: '输入 "12e3"，Input 认为是合法数字，但业务只需要整数。',
      solution: '监听 `keydown` 事件，阻止 "e", "E", "+", "-" 等非数字字符。',
      troubleshootingFlow: `graph TD; A[Input type=number] --> B[输入 'e']; B --> C[浏览器认为是数字]; C --> D[监听 keydown]; D --> E[阻止 e 键];`,
      validationMethod: '按键盘 "e" 键，输入框无反应。',
      views: 150,
      solveTimeMinutes: 10
    },
    {
      id: 'form-radio-name',
      title: '[Form] Radio Group 只能选一个但可以全不选',
      component: 'Form',
      version: 'HTML',
      tags: ['Radio', 'Name属性'],
      summary: '多个 Radio Button 应该互斥，但点击后发现行为异常或无法互斥。',
      phenomenon: '点击 Radio A，再点击 Radio B，结果两个都被选中了。',
      solution: '必须给同一组的 input[type=radio] 设置相同的 `name` 属性。',
      troubleshootingFlow: `graph TD; A[多个 Radio] --> B{name 属性是否相同?}; B -- 否 --> C[不互斥]; B -- 是 --> D[互斥正常];`,
      validationMethod: '点击不同选项，前一个选项自动取消选中。',
      views: 60,
      solveTimeMinutes: 2
    },
    {
      id: 'form-validators-redos',
      title: '[Form] 正则 Validators 导致页面卡死',
      component: 'Form',
      version: 'All',
      tags: ['Performance', 'Regex', 'ReDoS'],
      summary: '输入特定长字符串时，页面失去响应 (ReDoS 攻击风险)。',
      phenomenon: 'Validators.pattern 使用了复杂的嵌套量词，输入长串字符后浏览器卡死。',
      solution: '优化正则表达式，避免回溯灾难。尽量不要使用 `(.*a)+` 这种模式。',
      troubleshootingFlow: `graph TD; A[输入长文本] --> B[页面卡顿]; B --> C[检查 Pattern Validator]; C --> D[优化正则或改用自定义 Validator];`,
      validationMethod: '输入长文本，验证瞬间完成，无卡顿。',
      views: 45,
      solveTimeMinutes: 60
    },
    {
      id: 'form-patch-value-error',
      title: '[Form] setValue 报错 "Must supply a value for form control"',
      component: 'Form',
      version: 'ReactiveForms',
      tags: ['API', 'Error'],
      summary: '使用 setValue 更新表单时报错，因为数据结构不完全匹配。',
      phenomenon: '调用 `form.setValue(data)` 抛出错误，提示缺少某个字段。',
      solution: '`setValue` 要求对象结构严格匹配。如果只更新部分字段，请使用 `patchValue`。',
      troubleshootingFlow: `graph TD; A[调用 setValue] --> B{结构完全一致?}; B -- 否 --> C[报错]; C --> D[改用 patchValue];`,
      validationMethod: '改为 patchValue 后，部分更新成功且不报错。',
      views: 220,
      solveTimeMinutes: 2
    },
    {
      id: 'form-checkbox-required',
      title: '[Form] Required Validator 对 Checkbox (false) 无效',
      component: 'Form',
      version: 'Angular',
      tags: ['Checkbox', 'Validation'],
      summary: 'Checkbox 勾选为 true，不勾选为 false，Validators.required 认为 false 也是有值。',
      phenomenon: '必选的同意协议 Checkbox，默认 false，但不勾选也能通过校验。',
      solution: '使用 `Validators.requiredTrue` 专门用于 Checkbox。',
      troubleshootingFlow: `graph TD; A[Checkbox false] --> B[Validators.required]; B --> C[校验通过(Valid)]; C --> D[改为 requiredTrue]; D --> E[校验失败(Invalid)];`,
      validationMethod: '不勾选时表单 invalid，勾选后 valid。',
      views: 180,
      solveTimeMinutes: 5
    },
    {
      id: 'form-input-blur-twice',
      title: '[Form] Input 失去焦点触发两次事件',
      component: 'Form',
      version: 'DOM',
      tags: ['Event', 'Blur'],
      summary: '绑定 (blur) 事件执行了两次，导致业务逻辑重复。',
      phenomenon: '点击外部区域，控制台打印了两次 log。',
      solution: '检查是否混用了 `(blur)` 和 `(focusout)`，或者事件冒泡导致的。通常是模板中绑定了多次，或即绑定了 component event 又绑定了 native event。',
      troubleshootingFlow: `graph TD; A[Blur 事件] --> B{触发次数}; B -- >1 --> C[检查绑定及冒泡];`,
      validationMethod: 'Blur 只触发一次。',
      views: 70,
      solveTimeMinutes: 15
    },
    {
      id: 'form-nested-formarray-status',
      title: '[Form] 嵌套 FormArray 状态未冒泡',
      component: 'Form',
      version: 'ReactiveForms',
      tags: ['FormArray', 'Status'],
      summary: '深层嵌套的 Control 无效，但最顶层 FormGroup 依然 Valid。',
      phenomenon: '修改了孙子节点的校验状态，爷爷节点状态没变。',
      solution: 'Angular 表单状态默认自动冒泡。如果手动操作了 DOM 或使用了 OnPush 且没有触发变更检测，可能导致视图未更新。确保调用 updateValueAndValidity()。',
      troubleshootingFlow: `graph TD; A[子节点 Invalid] --> B[检查父节点 Status]; B -- Valid --> C[ChangeDetection?];`,
      validationMethod: '子节点变红，顶层提交按钮同步变灰。',
      views: 110,
      solveTimeMinutes: 30
    },
    {
      id: 'form-remove-control-error',
      title: '[Form] 动态移除 Control 后 Async Pipe 报错',
      component: 'Form',
      version: 'RxJS',
      tags: ['AsyncPipe', 'Lifecycle'],
      summary: '移除 FormGroup 中的 Control 后，模板中绑定该 Control 的 async pipe 抛出错误。',
      phenomenon: '`form.get("name").valueChanges | async` 报错 "Cannot read property valueChanges of null"。',
      solution: '模板中使用 `form.get("name")` 可能会返回 null。应使用 `*ngIf` 保护，或使用 `?.valueChanges`。',
      troubleshootingFlow: `graph TD; A[removeControl] --> B[模板重新渲染]; B --> C[get() 返回 null]; C --> D[添加空值检查];`,
      validationMethod: '移除字段后控制台无报错。',
      views: 95,
      solveTimeMinutes: 10
    },

    // --- Table Module ---
    {
      id: 'table-zindex-dropdown',
      title: '[Table] 固定列遮挡操作栏下拉菜单',
      component: 'Table',
      version: 'CSS',
      tags: ['Z-Index', 'Sticky', 'Overflow'],
      summary: '表格使用了 Sticky 列，导致列中的 Dropdown 菜单弹出时被相邻列遮挡或截断。',
      phenomenon: '点击“更多操作”，菜单只显示一半，另一半被右侧固定列盖住。',
      solution: 'Sticky 创建了新的层叠上下文。需将 Dropdown 设置为 `position: fixed` 或附加到 body (append to body)，避免受父级 overflow: hidden 或 sticky z-index 影响。',
      troubleshootingFlow: `graph TD; A[展开菜单] --> B{被遮挡?}; B -- 是 --> C[检查父级 overflow]; C --> D[改为 appendToBody];`,
      validationMethod: '菜单完整显示在所有列之上。',
      views: 330,
      solveTimeMinutes: 45
    },
    {
      id: 'table-colspan-header',
      title: '[Table] 多级表头导致列对齐错乱',
      component: 'Table',
      version: 'Layout',
      tags: ['Table', 'Header', 'Colspan'],
      summary: '使用 colspan/rowspan 做复杂表头时，Body 单元格与 Header 不对齐。',
      phenomenon: '表头很漂亮，但数据列跟标题没对上，偏移了一列。',
      solution: '仔细检查 `th` 的 colspan 属性总和是否等于 `td` 的数量。HTML 表格布局对齐严格依赖列数一致。',
      troubleshootingFlow: `graph TD; A[检查 Header 结构] --> B[计算 Colspan 总和]; C[计算 Body TD 数]; B -- 不等于 --> C --> D[修正 Colspan];`,
      validationMethod: '每一列数据都精确对齐表头。',
      views: 140,
      solveTimeMinutes: 20
    },
    {
      id: 'table-virtual-scroll-height',
      title: '[Table] 虚拟滚动出现大量空白或抖动',
      component: 'Table',
      version: 'CDK',
      tags: ['VirtualScroll', 'Performance'],
      summary: '开启虚拟滚动后，滚动条位置跳动，或者底部出现大片空白。',
      phenomenon: '滚动到底部，明明还有数据却滚不下去了，或者列表高度计算错误。',
      solution: '虚拟滚动需要固定的 `itemSize`。如果行高不固定，需要使用 `autosize` 策略或自行实现高度缓存。确保容器高度显式设置。',
      troubleshootingFlow: `graph TD; A[滚动异常] --> B[检查 itemSize]; B -- 固定? --> C[检查容器高度]; B -- 不固定 --> D[使用 autosize 策略];`,
      validationMethod: '快速拖拽滚动条，列表平滑无白屏，无跳动。',
      views: 270,
      solveTimeMinutes: 60
    },
    {
      id: 'table-drag-drop-index',
      title: '[Table] 拖拽排序后数据索引未更新',
      component: 'Table',
      version: 'CDK DragDrop',
      tags: ['DragDrop', 'Index'],
      summary: '拖拽行改变顺序后，Angular 数据源没变，或者是索引乱了。',
      phenomenon: '视图上行换了位置，但点击“删除”删掉的是原来位置的那行数据。',
      solution: '在 `cdkDropListDropped` 事件中使用 `moveItemInArray` 更新数据源数组，而不仅仅是依赖 DOM 变化。',
      troubleshootingFlow: `graph TD; A[Drop 事件] --> B[View 更新]; B --> C[检查 Model Array]; C -- 未变 --> D[调用 moveItemInArray];`,
      validationMethod: '拖拽后删除第一行，确实删除了视觉上的第一行。',
      views: 190,
      solveTimeMinutes: 15
    },
    {
      id: 'table-export-bom',
      title: '[Table] 导出 CSV 可以在 Excel 打开但中文乱码',
      component: 'Table',
      version: 'FileSaver',
      tags: ['Export', 'Encoding', 'CSV'],
      summary: '前端生成的 CSV 文件，用 Excel 打开中文显示乱码，记事本打开正常。',
      phenomenon: 'Excel 默认非 UTF-8 打开。',
      solution: '在 Blob 数据前添加 BOM 头 `\\uFEFF`。 `new Blob(["\\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })`。',
      troubleshootingFlow: `graph TD; A[导出 CSV] --> B[Excel 打开乱码]; B --> C[添加 BOM 头]; C --> D[Excel 识别为 UTF-8];`,
      validationMethod: 'Excel 打开中文显示正常。',
      views: 400,
      solveTimeMinutes: 5
    },
    {
      id: 'table-tree-perf',
      title: '[Table] 树形表格展开大量子节点卡顿',
      component: 'Table',
      version: 'Component',
      tags: ['Performance', 'Tree', 'Recursion'],
      summary: '点击展开包含 1000+ 子节点的树节点，浏览器主线程挂起。',
      phenomenon: '点击 "+" 号，界面卡死 2 秒才显示子行。',
      solution: '不要一次性渲染所有子组件。使用 `trackBy`，或者改为虚拟滚动树，或者分批次渲染（Time slicing）。',
      troubleshootingFlow: `graph TD; A[展开节点] --> B[DOM 节点数激增]; C[页面卡顿]; B --> D[实施虚拟滚动/分批渲染];`,
      validationMethod: '展开 2000 个子节点，动画流畅，无掉帧。',
      views: 135,
      solveTimeMinutes: 120
    },
    {
      id: 'table-filter-pagination',
      title: '[Table] 筛选后分页总数未重置',
      component: 'Table',
      version: 'Logic',
      tags: ['Pagination', 'Filter'],
      summary: '搜索过滤后，数据变少了，但分页条显示的总页数还是原来的。',
      phenomenon: '原本 100 条 10 页。搜索 "xyz" 只有 2 条，但分页器还显示 10 页，点第 2 页是空的。',
      solution: '过滤逻辑执行后，必须同步更新 `total` 计数，并将 `pageIndex` 重置为 1。',
      troubleshootingFlow: `graph TD; A[执行 Filter] --> B[更新 DataSource]; B --> C[更新 Total Length]; C --> D[重置 PageIndex = 1];`,
      validationMethod: '搜索后，分页器只显示 1 页。',
      views: 210,
      solveTimeMinutes: 10
    },
    {
      id: 'table-print-style',
      title: '[Table] 打印页面时表格样式丢失或不全',
      component: 'Table',
      version: 'CSS Print',
      tags: ['Print', 'CSS'],
      summary: '浏览器打印预览中，表格线条消失，背景色不见，只能打印一页。',
      phenomenon: 'Table 在屏幕上看很好，打印出来是白板。',
      solution: '使用 `@media print`。设置 `-webkit-print-color-adjust: exact` 以保留背景色。防止分页截断使用 `page-break-inside: avoid`。',
      troubleshootingFlow: `graph TD; A[Ctrl+P] --> B[样式丢失]; B --> C[添加 @media print]; C --> D[强制打印背景色];`,
      validationMethod: '打印预览中表格带背景色，且行没有被切成两半。',
      views: 88,
      solveTimeMinutes: 30
    },
    {
      id: 'table-ellipsis-fail',
      title: '[Table] 单元格内容溢出省略号失效',
      component: 'Table',
      version: 'CSS',
      tags: ['CSS', 'Layout'],
      summary: '设置了 `text-overflow: ellipsis` 但文本还是撑开了单元格或换行了。',
      phenomenon: '长文本把列宽撑得非常大。',
      solution: 'Table 布局默认是自动宽度的。必须设置 `table-layout: fixed`，并且给单元格或内部 div 设置明确的宽度/最大宽度以及 `overflow: hidden; white-space: nowrap;`。',
      troubleshootingFlow: `graph TD; A[设置 ellipsis] --> B[无效]; B --> C[检查 table-layout]; C -- auto --> D[改为 fixed];`,
      validationMethod: '长文本显示为 "..."，列宽保持固定。',
      views: 165,
      solveTimeMinutes: 15
    },
    {
      id: 'table-context-menu-offset',
      title: '[Table] 右键菜单位置在滚动后偏移',
      component: 'Table',
      version: 'DOM',
      tags: ['Position', 'Scroll'],
      summary: '表格有滚动条时，右键菜单出现的位置偏离了鼠标指针。',
      phenomenon: '向下滚动表格，右键某行，菜单出现在上方很远的地方。',
      solution: '计算位置时使用了 `clientY` 但未加上 `scrollTop`，或者未减去容器的 offset。推荐使用 `fixed` 定位基于 viewport 显示菜单，直接使用 `clientX/Y`。',
      troubleshootingFlow: `graph TD; A[ContextMenu] --> B[获取 MouseEvent]; C[计算 top/left]; C --> D[考虑 Scroll 偏移];`,
      validationMethod: '无论滚动条在哪，菜单始终紧贴鼠标出现。',
      views: 75,
      solveTimeMinutes: 25
    },
    {
      id: 'table-col-width-sync',
      title: '[Table] 拖拽列宽后刷新页面失效',
      component: 'Table',
      version: 'Feature',
      tags: ['Storage', 'UX'],
      summary: '用户辛辛苦苦调整了列宽，F5 刷新后又变回默认了。',
      phenomenon: '列宽状态未持久化。',
      solution: '监听列宽变更事件，将配置保存到 `localStorage` 或后端。初始化时读取配置应用到表格。',
      troubleshootingFlow: `graph TD; A[Resize Column] --> B[Save to Storage]; C[Reload Page]; C --> D[Load from Storage];`,
      validationMethod: '刷新页面列宽保持用户调整后的状态。',
      views: 120,
      solveTimeMinutes: 40
    },

    // --- Project Module ---
    {
      id: 'project-sass-alias',
      title: '[Project] styles.scss 无法引用路径别名 @styles',
      component: 'Project',
      version: 'CLI',
      tags: ['Sass', 'Config'],
      summary: 'TS 文件中可以用 @/ 路径，但在 SCSS 文件中 `@import "@styles/var"` 报错。',
      phenomenon: 'Can\'t find stylesheet to import.',
      solution: 'Sass loader 不自动读取 tsconfig paths。需在 `angular.json` 的 `stylePreprocessorOptions.includePaths` 中添加路径，或使用 `~` 前缀 (Webpack 依赖)。',
      troubleshootingFlow: `graph TD; A[SCSS Import] --> B[报错]; B --> C[修改 angular.json]; C --> D[添加 includePaths];`,
      validationMethod: 'Build 成功，样式生效。',
      views: 98,
      solveTimeMinutes: 20
    },
    {
      id: 'project-node-memory',
      title: '[Project] HEAP OUT OF MEMORY 构建崩溃',
      component: 'Project',
      version: 'Node',
      tags: ['Build', 'Memory'],
      summary: '项目过大，运行 build 时 Node 进程崩溃。',
      phenomenon: 'JavaScript heap out of memory.',
      solution: '增加 Node 内存上限。使用 `max_old_space_size` 参数。例如 `export NODE_OPTIONS="--max_old_space_size=4096"`。',
      troubleshootingFlow: `graph TD; A[Run Build] --> B[OOM Crash]; B --> C[设置 NODE_OPTIONS]; C --> D[Build Success];`,
      validationMethod: '构建过程顺利完成，无内存溢出错误。',
      views: 450,
      solveTimeMinutes: 10
    },
    {
      id: 'project-tslib-helper',
      title: '[Project] tslib 找不到 helper 函数',
      component: 'Project',
      version: 'TypeScript',
      tags: ['Config', 'Dependencies'],
      summary: '运行时报错 `__spreadArray is not defined`。',
      phenomenon: '升级 TS 版本后出现，通常是因为 `importHelpers: true` 但 `tslib` 版本不匹配。',
      solution: '检查 `package.json` 中 `tslib` 的版本，确保已安装。尝试删除 node_modules 重装。',
      troubleshootingFlow: `graph TD; A[Runtime Error] --> B[缺少 helper]; B --> C[检查 tslib]; C --> D[Update tslib];`,
      validationMethod: '应用正常启动无报错。',
      views: 65,
      solveTimeMinutes: 15
    },
    {
      id: 'project-zone-lost',
      title: '[Project] Zone.js 丢失导致页面不刷新',
      component: 'Project',
      version: 'Core',
      tags: ['Zone.js', 'Polyfill'],
      summary: '使用了 async/await 或某些第三方库后，Angular 变更检测失效。',
      phenomenon: '数据变了，界面没变，点击一下界面才变。',
      solution: '通常是 Zone.js 被全局覆盖或未正确 Patch。检查 `polyfills.ts` 引入顺序，或是否在 Zone 加载前使用了 Native Promise。对于微前端场景需特别注意 Zone 隔离。',
      troubleshootingFlow: `graph TD; A[UI 不刷新] --> B[检查 window.Zone]; B --> C[检查 polyfill 顺序];`,
      validationMethod: '异步操作后 UI 自动刷新。',
      views: 280,
      solveTimeMinutes: 120
    },
    {
      id: 'project-circular-dependency',
      title: '[Project] Detected circular dependency 警告',
      component: 'Project',
      version: 'Webpack',
      tags: ['Refactor', 'Warning'],
      summary: '构建时出现大量循环依赖警告。',
      phenomenon: 'Circular dependency detected: A -> B -> A。可能导致运行时 "Class extends value undefined"。',
      solution: '重构代码，提取公共接口或服务到独立文件（Shared Module）。使用 `madge` 工具分析依赖图。',
      troubleshootingFlow: `graph TD; A[Build Warn] --> B[使用 Madge 分析]; C[解耦依赖]; D[提取 Shared];`,
      validationMethod: '构建无循环依赖警告。',
      views: 175,
      solveTimeMinutes: 60
    },
    {
      id: 'project-prod-env-replace',
      title: '[Project] environment.prod.ts 未生效',
      component: 'Project',
      version: 'CLI',
      tags: ['Config', 'Build'],
      summary: '生产环境构建却连接了测试环境 API。',
      phenomenon: '`ng build --configuration production` 后打印 environment 还是 false。',
      solution: '检查 `angular.json` 中的 `fileReplacements` 配置。Angular 12+ 默认配置可能变更，确保 production 配置块中有替换规则。',
      troubleshootingFlow: `graph TD; A[Build Prod] --> B[Env 错误]; B --> C[检查 angular.json]; C --> D[修复 fileReplacements];`,
      validationMethod: '生产包打印 environment.production 为 true。',
      views: 200,
      solveTimeMinutes: 20
    },
    {
      id: 'project-jest-unexpected-token',
      title: '[Project] Jest 报错 Unexpected token import',
      component: 'Project',
      version: 'Test',
      tags: ['Jest', 'ESM'],
      summary: '运行单元测试时，引用某个第三方库报错。',
      phenomenon: 'Jest 默认不处理 node_modules 中的 ESM 模块。',
      solution: '在 `jest.config.js` 中配置 `transformIgnorePatterns`，允许转换特定的库。例如 `transformIgnorePatterns: ["node_modules/(?!lodash-es)"]`。',
      troubleshootingFlow: `graph TD; A[Run Test] --> B[Syntax Error]; B --> C[Jest 不支持 ESM]; C --> D[配置 transformIgnorePatterns];`,
      validationMethod: '测试用例成功运行。',
      views: 110,
      solveTimeMinutes: 40
    },
    {
      id: 'project-svg-color',
      title: '[Project] SVG Icon 无法通过 CSS 修改颜色',
      component: 'Project',
      version: 'Assets',
      tags: ['SVG', 'CSS'],
      summary: '想用 `fill: red` 改变 SVG 图标颜色，但无效。',
      phenomenon: 'SVG 文件内部硬编码了 `fill="#000"`。',
      solution: '手动或使用 SVGO 工具删除 SVG 源码中的 `fill` 属性，或者将其改为 `fill="currentColor"`，这样它就会继承父元素的颜色。',
      troubleshootingFlow: `graph TD; A[设置 fill] --> B[无效]; B --> C[检查 SVG 源码]; C --> D[删除内置 fill 属性];`,
      validationMethod: '图标颜色随 CSS 类变化。',
      views: 130,
      solveTimeMinutes: 10
    },
    {
      id: 'project-tailwind-missing',
      title: '[Project] Tailwind CSS 样式未生效',
      component: 'Project',
      version: 'Tailwind',
      tags: ['CSS', 'Config'],
      summary: '写了 class="text-red-500" 但文字没变红。',
      phenomenon: '构建后的 CSS 文件中没有包含该样式。',
      solution: '检查 `tailwind.config.js` 的 `content` 数组。确保包含了所有组件文件的路径（如 `./src/**/*.{html,ts}`）。',
      troubleshootingFlow: `graph TD; A[样式丢失] --> B[检查 content 配置]; B -- 路径错误 --> C[修正路径];`,
      validationMethod: '样式正确应用。',
      views: 300,
      solveTimeMinutes: 15
    },
    {
      id: 'project-sourcemap-leak',
      title: '[Project] 生产环境泄露 SourceMap',
      component: 'Project',
      version: 'Security',
      tags: ['Build', 'Security'],
      summary: 'F12 能看到完整的源码 TS 文件。',
      phenomenon: '生产环境开启了 sourceMap: true。',
      solution: '修改 `angular.json` 的 production 配置，设置 `"sourceMap": false`。',
      troubleshootingFlow: `graph TD; A[检查生产网] --> B[源码可见]; B --> C[修改 angular.json]; C --> D[关闭 sourceMap];`,
      validationMethod: '浏览器 DevTools 无法看到 webpack:// 源码目录。',
      views: 160,
      solveTimeMinutes: 5
    },
    {
      id: 'project-moment-size',
      title: '[Project] Moment.js 包体积过大',
      component: 'Project',
      version: 'Optimization',
      tags: ['BundleSize', 'Webpack'],
      summary: 'Moment.js 引入了所有语言包，导致 main.js 巨大。',
      phenomenon: 'Bundle Analyzer 显示 Moment 占了 500KB。',
      solution: '使用 `ContextReplacementPlugin` 过滤语言包，或者迁移到 `date-fns` / `dayjs`。',
      troubleshootingFlow: `graph TD; A[Analyze Bundle] --> B[Moment 过大]; B --> C[配置 Webpack Plugin]; D[只保留 zh-cn];`,
      validationMethod: '包体积显著减小。',
      views: 220,
      solveTimeMinutes: 30
    },

    // --- Backend Module ---
    {
      id: 'backend-token-refresh-403',
      title: '[Backend] 403/401 Token 过期未自动刷新',
      component: 'Backend',
      version: 'HTTP',
      tags: ['Auth', 'Interceptor'],
      summary: 'Token 过期后，用户直接被踢出，而不是静默刷新 Token。',
      phenomenon: '请求报 401，Interceptor 未捕获或刷新逻辑失败。',
      solution: '实现 HttpInterceptor。捕获 401 错误 -> 暂停请求 -> 调用刷新接口 -> 刷新成功重放请求。注意处理并发刷新时的锁机制。',
      troubleshootingFlow: `graph TD; A[请求 401] --> B[Interceptor 捕获]; C{正在刷新?}; C -- 是 --> D[加入队列]; C -- 否 --> E[调用 Refresh API]; E --> F[重放队列请求];`,
      validationMethod: 'Token 过期后，用户无感知，请求自动恢复。',
      views: 510,
      solveTimeMinutes: 180
    },
    {
      id: 'backend-cors-302',
      title: '[Backend] 302 重定向导致 CORS 错误',
      component: 'Backend',
      version: 'HTTP',
      tags: ['CORS', 'Redirect'],
      summary: '后端返回 302 跳转，浏览器报 "No Access-Control-Allow-Origin"。',
      phenomenon: '登录接口重定向到 SSO 页面时跨域失败。',
      solution: 'Ajax/Fetch 请求遇到 302 会自动跟随，如果跳转的目标域没有设置 CORS 头，就会报错。通常 API 不应返回 302，而应返回 JSON 告诉前端需要跳转的 URL，由前端执行 `window.location.href`。',
      troubleshootingFlow: `graph TD; A[请求 API] --> B[返回 302]; B --> C[浏览器自动跟随]; D[跨域失败]; E[方案: 后端改返 JSON];`,
      validationMethod: '前端接收 JSON 后手动跳转。',
      views: 290,
      solveTimeMinutes: 60
    },
    {
      id: 'backend-sse-timeout',
      title: '[Backend] SSE 连接 1 分钟自动断开',
      component: 'Backend',
      version: 'Nginx',
      tags: ['SSE', 'Timeout'],
      summary: 'Server-Sent Events 连接在 60 秒时准时断开。',
      phenomenon: 'Nginx 默认 `proxy_read_timeout` 为 60s。',
      solution: '调整 Nginx 配置，增加超时时间，并关闭 buffer：`proxy_buffering off;`。同时后端应实现心跳机制（Keep-alive）。',
      troubleshootingFlow: `graph TD; A[SSE 连接] --> B[60s 断开]; B --> C[检查 Nginx]; C --> D[关闭 buffering, 增加 timeout];`,
      validationMethod: 'SSE 连接保持长久不掉线。',
      views: 145,
      solveTimeMinutes: 40
    },
    {
      id: 'backend-upload-stuck',
      title: '[Backend] 文件上传进度条 100% 后卡顿',
      component: 'Backend',
      version: 'HTTP',
      tags: ['Upload', 'UX'],
      summary: '上传文件，进度很快到 100%，然后卡住很久才完成。',
      phenomenon: '前端发送完毕，但在等待后端处理/存储。',
      solution: '区分“上传进度”和“处理进度”。100% 仅代表数据发到了服务器网卡。UI 上应在 100% 后显示“服务器处理中...”。或者后端优化流式处理。',
      troubleshootingFlow: `graph TD; A[上传] --> B[100% sent]; C[等待 Server Response]; D[UI 显示 Processing];`,
      validationMethod: '用户体验优化，不再误以为死机。',
      views: 205,
      solveTimeMinutes: 30
    },
    {
      id: 'backend-url-too-long',
      title: '[Backend] GET 请求参数过长报 414 Error',
      component: 'Backend',
      version: 'HTTP',
      tags: ['API', 'Limit'],
      summary: '查询参数非常多时，接口报错 URI Too Long。',
      phenomenon: '筛选条件太多，GET URL 超过浏览器或服务器限制（通常 2KB-8KB）。',
      solution: '将查询接口改为 POST 方法，把参数放在 Body 中传输。',
      troubleshootingFlow: `graph TD; A[复杂查询] --> B[URL 超长]; C[报 414]; D[改为 POST 请求];`,
      validationMethod: '大量参数查询正常返回。',
      views: 115,
      solveTimeMinutes: 20
    },
    {
      id: 'backend-timezone-offset',
      title: '[Backend] Date 传输到后端少 8 小时',
      component: 'Backend',
      version: 'Date',
      tags: ['Timezone', 'JSON'],
      summary: '前端选的 2024-01-01 00:00，后端存的是 2023-12-31 16:00。',
      phenomenon: 'JSON 序列化 Date 时默认使用 `.toISOString()` (UTC)。',
      solution: '前端发送前手动调整时区，或者发送字符串 "YYYY-MM-DD HH:mm:ss"，或者后端统一按 UTC 处理并在展示时转回本地时间。推荐统一 UTC。',
      troubleshootingFlow: `graph TD; A[Date Object] --> B[JSON.stringify]; C[UTC String]; D[Server 收到 UTC];`,
      validationMethod: '前后端时间显示一致。',
      views: 380,
      solveTimeMinutes: 45
    },
    {
      id: 'backend-502-bad-gateway',
      title: '[Backend] 502 Bad Gateway 偶发错误',
      component: 'Backend',
      version: 'Nginx',
      tags: ['Ops', 'Network'],
      summary: '请求偶尔报 502，刷新又好了。',
      phenomenon: '后端服务重启中，或者 Node 进程负载过高，或者 Nginx 与 Upstream 连接断开。',
      solution: '检查后端日志是否崩溃重启。检查 Nginx `keepalive` 配置。',
      troubleshootingFlow: `graph TD; A[502 Error] --> B[Check Server Log]; C[Check Load]; D[Check Upstream];`,
      validationMethod: '服务稳定性提升。',
      views: 230,
      solveTimeMinutes: 120
    },
    {
      id: 'backend-put-empty-body',
      title: '[Backend] PUT 请求 Body 丢失',
      component: 'Backend',
      version: 'HTTP',
      tags: ['Proxy', 'BodyParser'],
      summary: '发送 PUT 请求，后端收到的 Body 为空。',
      phenomenon: 'POST 正常，PUT 不正常。',
      solution: '某些旧代理服务器或 WAF 可能拦截 PUT Body。或者后端 BodyParser 中间件未正确配置处理 PUT 方法。检查 `Content-Type` 是否正确设置。',
      troubleshootingFlow: `graph TD; A[PUT Data] --> B[Server Body Empty]; B --> C[Check Content-Type]; C --> D[Check Middleware];`,
      validationMethod: 'PUT 请求后端正确解析参数。',
      views: 80,
      solveTimeMinutes: 60
    },
    {
      id: 'backend-delete-body',
      title: '[Backend] DELETE 请求带 Body 被丢弃',
      component: 'Backend',
      version: 'HTTP',
      tags: ['Restful', 'Standard'],
      summary: '尝试在 DELETE 请求中发送 JSON 数据，后端没收到。',
      phenomenon: 'HTTP 规范中 DELETE Body 语义未定义，很多网关/服务器（如 Tomcat, Nginx）默认丢弃 DELETE Body。',
      solution: '不要在 DELETE 中传 Body。改用 URL Params，或者如果必须传复杂数据，改用 POST + `/delete` 语义。',
      troubleshootingFlow: `graph TD; A[DELETE with Body] --> B[Body Lost]; C[Standard Violation]; D[Use Params or POST];`,
      validationMethod: '参数正确传递。',
      views: 155,
      solveTimeMinutes: 10
    },
    {
      id: 'backend-float-precision',
      title: '[Backend] 浮点数计算精度丢失 (0.1+0.2!=0.3)',
      component: 'Backend',
      version: 'JS/Java',
      tags: ['Math', 'Precision'],
      summary: '金额计算出现 9.99999999999。',
      phenomenon: 'IEEE 754 浮点数问题。',
      solution: '金额计算前端使用 `decimal.js` 或 `big.js`。后端使用 BigDecimal。传输时建议使用字符串或“分”为单位的整数传输。',
      troubleshootingFlow: `graph TD; A[0.1 + 0.2] --> B[0.300000004]; C[UI Error]; D[Use Integer/String];`,
      validationMethod: '金额显示精确，无长小数。',
      views: 320,
      solveTimeMinutes: 20
    },
    {
      id: 'backend-options-slow',
      title: '[Backend] OPTIONS 预检请求耗时过长',
      component: 'Backend',
      version: 'CORS',
      tags: ['Performance', 'Latency'],
      summary: '每个 POST 请求前都有一个慢速的 OPTIONS 请求，拖慢交互。',
      phenomenon: '跨域请求必须 Preflight。',
      solution: '后端设置 `Access-Control-Max-Age` 头，缓存预检结果（例如 24 小时）。这样浏览器在有效期内不会再次发送 OPTIONS。',
      troubleshootingFlow: `graph TD; A[POST] --> B[Wait OPTIONS]; C[High Latency]; D[Set Max-Age header];`,
      validationMethod: '第二次请求时无 OPTIONS 请求。',
      views: 195,
      solveTimeMinutes: 10
    }
];

// Routes
// GET All
app.get('/api/faqs', (req, res) => {
  res.json(FAQS);
});

// GET One
app.get('/api/faqs/:id', (req, res) => {
  const item = FAQS.find(f => f.id === req.params.id);
  if (item) res.json(item);
  else res.status(404).send('Not found');
});

// POST Create (Admin)
app.post('/api/faqs', (req, res) => {
  const newItem = { ...req.body, id: req.body.id || Date.now().toString() };
  FAQS.unshift(newItem);
  res.status(201).json(newItem);
});

// PUT Update (Admin)
app.put('/api/faqs/:id', (req, res) => {
  const index = FAQS.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    FAQS[index] = { ...FAQS[index], ...req.body };
    res.json(FAQS[index]);
  } else {
    res.status(404).send('Not found');
  }
});

// DELETE (Admin)
app.delete('/api/faqs/:id', (req, res) => {
  FAQS = FAQS.filter(f => f.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
