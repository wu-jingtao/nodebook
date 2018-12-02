import * as moment from 'moment';

import * as FilePath from '../../Server/FilePath';

/**
 * 根据文件名生成对应的代码模板
 */
export function codeTemplate(filename: string) {
    filename = filename.toLowerCase();

    if (filename.endsWith('.html'))
        return html(filename);
    else if (filename.endsWith('.client.js'))
        return clientJs(filename);
    else if (filename.endsWith('.server.js'))
        return ServerJs(filename);
    else if (filename.endsWith('.js'))
        return js(filename);
    else if (filename.endsWith('.sh'))
        return bash(filename);
    else
        return default_file(filename);
}

function default_file(filename: string) {
    return `/* ${moment().format('YYYY-MM-DD HH:mm:ss')} */`;
}

function bash(filename: string) {
    return `# ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
}

function html(filename: string) {
    return `<!-- ${moment().format('YYYY-MM-DD HH:mm:ss')} -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="/static/res/helper/jquery.min.js"></script>
    <script src="/static/res/helper/client_helper.js"></script>
    <title>${filename}</title>
</head>
<body>
    <!-- 
        <script src="/file/data/code/用户代码目录下的文件.js"></script>
        <script src="/file/data/programData/程序数据目录下的文件.js"></script>
        <script src="/file/data/recycle/回收站目录下的文件.js"></script>
        <script src="/file/data/library/类库目录下的文件.js"></script>
        <script src="/file/api/readFile?path=文件的完整路径.js"></script>
    -->
</body>
</html>
`;
}

function js(filename: string) {
    return `"use strict"; /* ${moment().format('YYYY-MM-DD HH:mm:ss')} */`;
}

function clientJs(filename: string) {
    return `"use strict"; /* ${moment().format('YYYY-MM-DD HH:mm:ss')} */

/* 调用服务器端任务暴露出来的方法 */
nodebook.invokeTask('${FilePath._userCodeDir}/test.js', 'exportedFunctionName', {data: 123})
    .then((jsonData) => {})
    .catch((err) => {})
`;
}

function ServerJs(filename: string) {
    return `"use strict"; /* ${moment().format('YYYY-MM-DD HH:mm:ss')} */

const nodebook = require('/app/bin/Client/res/helper/server_helper.js');

/* 调用服务器端任务暴露出的方法 */
nodebook.invokeTask('${FilePath._userCodeDir}/test.js', 'exportedFunctionName', {data: 123})
    .then((jsonData) => {})
    .catch((err) => {})

/* 暴露出一个方法供外界调用 */
nodebook.exportFunction('functionName', async (data) => { 
    
});
`;
}