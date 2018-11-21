FROM node

RUN apt-get update && apt-get install -y --no-install-recommends \
    dos2unix \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# 创建存放 用户数据目录 以及 任务数据目录
VOLUME [ "/user_data", "/program_data" ]

WORKDIR /app

# 复制代码
COPY ["src", "/app/src/"]
COPY ["package.json", "gulpfile.js", "tsconfig.json", "webpack.config.js", "start.sh", "LICENSE", "/app/"]

# 编译
RUN npm install && \ 
    npm run compileServer && \
    npm run compileClient && \
# 清除devDependencies包
    npm prune --production && \
# 删除多余文件
    rm -r src gulpfile.js tsconfig.json webpack.config.js && \
# 确保程序代码不会被破坏
    chmod 755 /app && \
# 确保可执行
    dos2unix node_modules/service-starter/src/Docker/health_check.sh start.sh && \
    chmod 755 node_modules/service-starter/src/Docker/health_check.sh start.sh

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

# DOMAIN：  配置域名，默认localhost:443
# DEBUG：   是否开启了debug模式。
# TZ：      时区默认是上海
ENV DOMAIN=localhost:443 DEBUG=false TZ=Asia/Shanghai

# 只暴露https
EXPOSE 443

CMD ["./start.sh"]