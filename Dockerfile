FROM registry.cn-hangzhou.aliyuncs.com/wujingtao/node:latest

# 如果容器还缺少curl，那么还需要安装curl(注意curl版本必须大于7.4 不然没有--unix-socket参数)
RUN apt-get update && apt-get install -y --no-install-recommends \
    dos2unix \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# 确保程序代码不会被tast访问
RUN chmod 700 /app

# 复制代码
COPY src /app/src
COPY package.json /app/package.json
COPY gulpfile.js /app/gulpfile.js
COPY tsconfig.json /app/tsconfig.json
COPY webpack.config.js /app/webpack.config.js

# 编译
RUN npm install
RUN npm run compileServer
RUN npm run compileClient

# 清除devDependencies包
RUN npm prune --production

# 删除多余文件
RUN rm -r src gulpfile.js tsconfig.json webpack.config.js

# 确保可执行
RUN dos2unix /app/node_modules/service-starter/src/Docker/health_check.sh
RUN chmod 755 /app/node_modules/service-starter/src/Docker/health_check.sh

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

# 创建存放用户数据目录
RUN mkdir -m 755 /user-data

# 创建存放任务临时数据目录
RUN mkdir -m 755 /program-data

# 创建存放openssl key目录
# 程序第一次启动时会生成临时的秘钥，如果自己有秘钥的话可以通过挂载的方式设置秘钥
# key：  /key/privkey.pem
# cert： /key/cert.pem
RUN mkdir -m 700 /key

# 配置域名，默认localhost
ENV DOMAIN=localhost

CMD ["node", "."]