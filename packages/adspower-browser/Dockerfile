# 使用 Node.js 官方 LTS 版本作为基础镜像
FROM node:lts

# 设置工作目录
WORKDIR /app

# 安装 adspower-browser 全局包
RUN npm install -g adspower-browser

# 创建缓存目录（与之前讨论的目录一致）
RUN mkdir -p /root/.adspowerCli

# 验证安装
RUN echo "Node.js版本:" && node --version && \
    echo "npm版本:" && npm --version && \
    echo "adspower-browser版本:" && adspower-browser --version

# 设置默认命令
CMD ["/bin/bash"]