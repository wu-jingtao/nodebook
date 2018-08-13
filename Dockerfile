FROM registry.cn-hangzhou.aliyuncs.com/wujingtao/node:latest

ENV NODEBOOK_VERSION="0.0.1"

# 如果容器还缺少curl，那么还需要安装curl(注意curl版本必须大于7.4 不然没有--unix-socket参数)
RUN apt-get update && apt-get install -y --no-install-recommends \
    dos2unix \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建存放 用户数据目录 以及 任务数据目录
VOLUME [ "/user_data", "/program_data" ]

# 创建存放openssl key目录
# 程序第一次启动时会生成临时的秘钥，如果自己有秘钥的话可以通过挂载的方式设置秘钥
# key：  /key/privkey.pem
# cert： /key/cert.pem
RUN mkdir -m 700 /key && \
# 创建 nodebook-task 账户，在执行用户程序的时候都是这个账户
    groupadd -g 6000 nodebook-task && \
    useradd -c nodebook-task -d /program-data -g nodebook-task -M -s /usr/sbin/nologin -u 6000 nodebook-task && \
# 使得用户程序可以修改 /program-data 目录
    chown nodebook-task:nodebook-task /program-data

WORKDIR /app

# 复制代码
COPY ["src", "package.json", "gulpfile.js", "tsconfig.json", "webpack.config.js", "LICENSE", "/app/"]

# 编译
RUN npm install && \ 
    npm run compileServer && \
    npm run compileClient && \
# 清除devDependencies包
    npm prune --production && \
# 删除多余文件
    rm -r src gulpfile.js tsconfig.json webpack.config.js && \
# 确保程序代码不会被破坏
    chmod 700 /app && \
# 确保可执行
    dos2unix /app/node_modules/service-starter/src/Docker/health_check.sh && \
    chmod 755 /app/node_modules/service-starter/src/Docker/health_check.sh

HEALTHCHECK \
    # 每次检查的间隔时间
    --interval=1m \
    # 单次检查的超时时长
    --timeout=30s \
    # 这个可以理解为在开始正式检查之前容器所需要的启动时间
    --start-period=1m \
    # 连续多少次检查失败可判定该服务是unhealthy
    --retries=3 \
    # 调用程序所暴露出的健康检查接口(要使用绝对路径)
    CMD /app/node_modules/service-starter/src/Docker/health_check.sh

# DOMAIN：配置域名，默认localhost
# DEBUG： 是否开启了debug模式。如果开启了,则会将错误的堆栈信息也输出给用户
ENV DOMAIN=localhost DEBUG=false

# 只暴露https
EXPOSE 443

CMD ["node", "."]